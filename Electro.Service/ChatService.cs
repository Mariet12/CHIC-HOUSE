using Electro.Core.Dtos.Chat;
using Electro.Core.Entities.Chat;
using Electro.Core.Interface;
using Electro.Core.Interfaces;
using Electro.Core.Models.Identity;
using Electro.Reposatory.Data.Identity;
using MailKit.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using System.Security.Claims;


namespace Electro.services
{
    public class ChatService : IChatService
    {
        private readonly AppIdentityDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly INotificationService _notificationService;

        public ChatService(AppIdentityDbContext context, UserManager<AppUser> userManager, IHubContext<ChatHub> hubContext, INotificationService notificationService)
        {
            _context = context;
            _userManager = userManager;
            _hubContext = hubContext;
            _notificationService = notificationService;
        }



        public async Task<Conversation> CreateOrGetConversationAsync(string senderId, string receiverId)
        {
            if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(receiverId))
            {
                throw new ArgumentException("SenderId and ReceiverId cannot be null or empty.");
            }

            // التحقق إذا كان المرسل هو نفسه المستقبل
            if (senderId == receiverId)
            {
                throw new ArgumentException("Sender and receiver cannot be the same.");
            }

            // البحث عن محادثة موجودة بين المرسل والمستقبل بأي ترتيب
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(c =>
                    (c.SenderId == senderId && c.ReceiverId == receiverId) ||
                    (c.SenderId == receiverId && c.ReceiverId == senderId));

            if (conversation == null)
            {
                // إذا لم تكن هناك محادثة، أنشئ محادثة جديدة
                conversation = new Conversation
                {
                    SenderId = senderId,
                    ReceiverId = receiverId
                };
                await _context.Conversations.AddAsync(conversation);
                await _context.SaveChangesAsync();
            }

            return conversation;
        }
        public async Task<IEnumerable<ConversationDTO>> GetAllConversationsAsync(ClaimsPrincipal user)
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // استرجاع المحادثات التي أرسلتها أو استقبلتها
            var conversations = await _context.Conversations
                .Where(c => c.SenderId == userId || c.ReceiverId == userId)
                .Include(c => c.Messages)
                .Include(c => c.Sender)
                .Include(c => c.Receiver)
                .ToListAsync();

            // تحويل المحادثات إلى DTO (معالجة Messages إذا كانت null)
            return conversations.Select(c =>
            {
                var msgs = c.Messages ?? Enumerable.Empty<Message>();
                var lastMsg = msgs.OrderByDescending(m => m.SentAt).FirstOrDefault();
                return new ConversationDTO
                {
                    Id = c.Id,
                    SenderId = c.SenderId,
                    ReceiverId = c.ReceiverId,
                    UserName = c.SenderId == userId ? c.Receiver?.UserName ?? "Unknown" : c.Sender?.UserName ?? "Unknown",
                    UserImage = c.SenderId == userId ? c.Receiver?.Image : c.Sender?.Image,
                    LastMessageContent = lastMsg?.Content,
                    LastMessageTimestamp = lastMsg?.SentAt,
                    UnreadMessagesCount = msgs.Count(m => m.ReceiverId == userId && !m.IsRead),
                };
            }).ToList();
        }
      
        public async Task<IEnumerable<ConversationDTO>> GetAllConversationsAsync(ClaimsPrincipal user, string? term = null)
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // استرجاع المحادثات التي أرسلتها أو استقبلتها
            var conversationsQuery = _context.Conversations
                .Include(c => c.Sender)    // تضمين بيانات المرسل
                .Include(c => c.Receiver)  // تضمين بيانات المستقبل
                .Include(c => c.Messages)  // تضمين الرسائل
                .Where(c => c.SenderId == userId || c.ReceiverId == userId)
                .AsQueryable();

            // إذا كان هناك term، تصفية المحادثات بناءً على الاسم
            if (!string.IsNullOrEmpty(term))
            {
                conversationsQuery = conversationsQuery.Where(c =>
                    (c.Receiver != null && c.Receiver.UserName != null && c.Receiver.UserName.Contains(term)) ||
                    (c.Sender != null && c.Sender.UserName != null && c.Sender.UserName.Contains(term))
                );
            }

            var conversations = await conversationsQuery.ToListAsync();

            // تحويل المحادثات إلى DTO (معالجة Messages إذا كانت null)
            return conversations.Select(c =>
            {
                var msgs = c.Messages ?? Enumerable.Empty<Message>();
                var lastMsg = msgs.OrderByDescending(m => m.SentAt).FirstOrDefault();
                return new ConversationDTO
                {
                    Id = c.Id,
                    SenderId = c.SenderId,
                    ReceiverId = c.ReceiverId,
                    UserName = c.SenderId == userId ? c.Receiver?.UserName ?? "Unknown" : c.Sender?.UserName ?? "Unknown",
                    UserImage = c.SenderId == userId ? c.Receiver?.Image : c.Sender?.Image,
                    LastMessageContent = lastMsg?.Content,
                    LastMessageTimestamp = lastMsg?.SentAt
                };
            }).ToList();
        }
     
        public async Task<Message> SendMessageAsync(int conversationId, string senderId, string receiverId, string content)
        {

            var message = new Message
            {
                ConversationId = conversationId,
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return message; // ✅ الآن ترجع كائن الرسالة بعد حفظها
        }
        public async Task<List<MessageDto>> GetMessagesAsync(int conversationId)
        {
            if (conversationId <= 0)
            {
                throw new ArgumentException("ConversationId must be valid.");
            }

            var messages = await _context.Messages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            if (!messages.Any())
            {
                return new List<MessageDto>();
            }

            var userIds = messages.SelectMany(m => new[] { m.SenderId, m.ReceiverId }).Distinct();
            var users = await _userManager.Users
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            return messages.Select(message => new MessageDto
            {
                Id = message.Id,
                Content = message.Content,
                SenderId = message.SenderId,
                SenderName = users.TryGetValue(message.SenderId, out var sender) ? sender.UserName : "Unknown",
                SenderProfilePicture = users.TryGetValue(message.SenderId, out sender) ? sender.Image : null,
                ReceiverId = message.ReceiverId,
                RecipientName = users.TryGetValue(message.ReceiverId, out var receiver) ? receiver.UserName : "Unknown",
                RecipientProfilePicture = users.TryGetValue(message.ReceiverId, out receiver) ? receiver.Image : null,
                SentAt = message.SentAt,
                IsRead = message.IsRead,
                ConversationId = message.ConversationId
            }).ToList();
        }
        public async Task SaveMessageAsync(MessageDto messageDto)
        {
            if (string.IsNullOrEmpty(messageDto.SenderId) || string.IsNullOrEmpty(messageDto.ReceiverId) || string.IsNullOrEmpty(messageDto.Content))
            {
                throw new ArgumentException("SenderId, ReceiverId, and Content cannot be null or empty.");
            }

            var conversation = await CreateOrGetConversationAsync(messageDto.SenderId, messageDto.ReceiverId);

            var message = new Message
            {
                ConversationId = conversation.Id,
                SenderId = messageDto.SenderId,
                ReceiverId = messageDto.ReceiverId,
                Content = messageDto.Content,
                IsRead = messageDto.IsRead,
                SentAt = messageDto.SentAt
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
        }

        public async Task<string> GetSenderNameAsync(string senderId)
        {
            var sender = await _userManager.FindByIdAsync(senderId);
            return sender?.UserName ?? "Unknown";
        }
        public async Task<string> GetSenderProfilePictureAsync(string senderId)
        {
            var sender = await _userManager.FindByIdAsync(senderId);
            return sender?.Image ?? "default_image_url";
        }
        public async Task<string> SendMessageFromAdminAsync(string adminId, string receiverId, string content)
        {
            var sender = await _context.Users.FirstOrDefaultAsync(u => u.Id == adminId);
            var receiver = await _context.Users.FirstOrDefaultAsync(u => u.Id == receiverId);

            if (receiver == null || string.IsNullOrEmpty(receiver.Email))
                return "فشل في العثور على بريد المستلم.";

            var subject = $"رسالة جديدة من {sender?.UserName ?? "الإدارة"} myService";
            var body = $"<p>لقد استلمت رسالة جديدة:</p><blockquote>{content}</blockquote>";

            await SendEmailAsync(receiver.Email, subject, body);

            return "تم إرسال البريد الإلكتروني بنجاح.";
        }

        public async Task SendEmailAsync(string To, string Subject, string Body, CancellationToken Cancellation = default)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("MyServices", "lawyerforu77@gmail.com"));
            message.To.Add(new MailboxAddress("", To));
            message.Subject = Subject;
            message.Body = new TextPart("html") { Text = Body };

            using var client = new MailKit.Net.Smtp.SmtpClient();
            client.ServerCertificateValidationCallback = (s, c, h, e) => true; // تجاوز مشكلة الشهادة إذا لزم الأمر

            try
            {
                // 🔹 استخدم STARTTLS مع المنفذ 587
                await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls, Cancellation);

                // 🔹 المصادقة
                await client.AuthenticateAsync("lawyerforu77@gmail.com", "icow sbxg rtrf iavo", Cancellation);

                // 🔹 إرسال البريد
                await client.SendAsync(message, Cancellation);

                // 🔹 قطع الاتصال
                await client.DisconnectAsync(true, Cancellation);
            }
            catch (Exception)
            {
                throw;
            }

        }

    }
}
