using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Text.Json.Serialization;

namespace Electro.Core.Dtos.Chat
{
    public class CreateConversationDTO
    {
        [JsonPropertyName("senderId")]
        public string SenderId { get; set; } = string.Empty;

        [JsonPropertyName("receiverId")]
        public string ReceiverId { get; set; } = string.Empty;
    }
}
