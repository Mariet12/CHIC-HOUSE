"use client";

import React, { useState, useEffect, useRef } from "react";
import { chatApi, accountApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [loadingNewChat, setLoadingNewChat] = useState(false);
  const [errorNewChat, setErrorNewChat] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (!isAdmin) {
      fetchAdminUsers();
    } else {
      fetchConversations();
    }
  }, [token, isAdmin]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async (adminUsersList?: any[]) => {
    try {
      const response = await chatApi.getAllConversations();
      if (response.data?.data) {
        let filteredConversations = response.data.data;
        
        if (!isAdmin && (adminUsersList || adminUsers).length > 0) {
          const adminsToCheck = adminUsersList || adminUsers;
          filteredConversations = filteredConversations.filter((conv: any) => {
            const otherUserId = conv.senderId === user?.id ? conv.receiverId : conv.senderId;
            return adminsToCheck.some((admin: any) => admin.id === otherUserId);
          });
        }
        
        setConversations(filteredConversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
      toast.error("تعذر تحميل المحادثات. يمكنك بدء محادثة جديدة.");
    }
  };

  const fetchAdminUsers = async () => {
    try {
      setLoadingAdmins(true);
      const response = await accountApi.getAllUsers();
      if (response.data?.data) {
        // تصفية فقط المستخدمين الأدمن
        const admins = response.data.data.filter((u: any) => 
          u.role === "Admin" || u.Role === "Admin"
        );
        setAdminUsers(admins);
        // بعد جلب الأدمن، أعد جلب المحادثات مع قائمة الأدمن
        await fetchConversations(admins);
      }
    } catch (error) {
      console.error("Error fetching admin users:", error);
      toast.error("فشل تحميل بيانات الأدمن");
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await chatApi.getMessages(conversationId);
      if (response.data?.data) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    try {
      await chatApi.sendMessage({
        conversationId: selectedConversation.id,
        senderId: user?.id || "",
        receiverId: selectedConversation.receiverId || selectedConversation.senderId,
        content: message,
      });
      setMessage("");
      fetchMessages(selectedConversation.id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCreateConversation = async () => {
    if (!user?.id) return;
    
    let receiverIdToUse = "";
    
    // للمستخدمين العاديين: إيميل الأدمن ثابت = أول أدمن من القائمة
    if (!isAdmin) {
      const firstAdmin = adminUsers[0];
      if (!firstAdmin?.id) {
        setErrorNewChat("لا يوجد أدمن للتواصل حالياً. جاري التحميل...");
        return;
      }
      receiverIdToUse = firstAdmin.id;
    } else {
      // للأدمن: يمكنهم إدخال ID أو إيميل
      if (!receiverId.trim() && !receiverEmail.trim()) {
        setErrorNewChat("يرجى إدخال ID المستخدم أو الإيميل");
        return;
      }
      
      if (receiverId.trim()) {
        receiverIdToUse = receiverId.trim();
      } else if (receiverEmail.trim()) {
        try {
          const allUsersResponse = await accountApi.getAllUsers();
          if (allUsersResponse.data?.data) {
            const foundUser = allUsersResponse.data.data.find((u: any) => 
              u.email?.toLowerCase() === receiverEmail.trim().toLowerCase()
            );
            if (foundUser) {
              receiverIdToUse = foundUser.id;
            } else {
              setErrorNewChat("لم يتم العثور على مستخدم بهذا الإيميل");
              return;
            }
          }
        } catch (error) {
          setErrorNewChat("فشل البحث عن المستخدم");
          return;
        }
      }
    }
    
    if (!receiverIdToUse) {
      setErrorNewChat(isAdmin ? "يرجى إدخال ID المستخدم أو الإيميل" : "لا يوجد أدمن للتواصل حالياً");
      return;
    }
    
    setLoadingNewChat(true);
    setErrorNewChat(null);
    try {
      const response = await chatApi.createConversation({
        senderId: user.id,
        receiverId: receiverIdToUse,
      });
      await fetchConversations();
      const newId = response.data?.data?.id;
      if (newId) {
        const newConv = conversations.find((c) => c.id === newId);
        if (newConv) setSelectedConversation(newConv);
      }
      setReceiverId("");
      setReceiverEmail("");
    } catch (error: any) {
      const msg = error.response?.data?.message || "تعذر بدء المحادثة";
      setErrorNewChat(msg);
      console.error("Error creating conversation:", error);
    } finally {
      setLoadingNewChat(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary text-right">الشات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Conversations List */}
        <div className="bg-secondary-light rounded-lg shadow-md p-4 overflow-y-auto border border-secondary-dark">
          <div className="space-y-3">
            <div className="space-y-2">
              {!isAdmin ? (
                <>
                  <p className="text-sm text-primary font-medium">
                    تواصل مع الدعم
                  </p>
                  {!loadingAdmins && adminUsers.length === 0 ? (
                    <p className="text-xs text-amber-600 font-medium">
                      لا يوجد حساب دعم (أدمن) حتى الآن. أضف مستخدماً بدور أدمن من لوحة التحكم.
                    </p>
                  ) : adminUsers[0] ? (
                    <p className="text-xs text-gray-600" title="إيميل الأدمن">
                      الدعم: {adminUsers[0].email || adminUsers[0].userName || "—"}
                    </p>
                  ) : null}
                  <p className="text-xs text-gray-500">
                    يمكنك الشات مع الأدمن فقط
                  </p>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="ID المستخدم"
                    value={receiverId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setReceiverId(e.target.value);
                      setReceiverEmail("");
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <span className="text-xs text-gray-500">أو</span>
                  <input
                    type="email"
                    placeholder="إيميل المستخدم"
                    value={receiverEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setReceiverEmail(e.target.value);
                      setReceiverId("");
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </>
              )}
              <button
                onClick={handleCreateConversation}
                disabled={loadingNewChat || loadingAdmins || (!isAdmin && adminUsers.length === 0)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-60"
              >
                {loadingNewChat ? "جاري الإنشاء..." : loadingAdmins && !isAdmin ? "جاري تحميل الدعم..." : !isAdmin && adminUsers.length === 0 ? "غير متاح — لا يوجد أدمن" : "بدء محادثة جديدة"}
              </button>
            </div>
            {errorNewChat && <p className="text-sm text-red-600">{errorNewChat}</p>}

            <input
              type="text"
                  placeholder="البحث في المحادثات..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="space-y-2 mt-3">
            {conversations
              .filter((conv) =>
                searchTerm
                  ? conv.userName?.toLowerCase().includes(searchTerm.toLowerCase())
                  : true
              )
              .map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-3 rounded-lg cursor-pointer hover:bg-secondary ${
                  selectedConversation?.id === conv.id ? "bg-secondary" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full bg-secondary">
                    {conv.userImage && (
                      <Image
                        src={conv.userImage}
                        alt={conv.userName}
                        fill
                        className="rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{conv.userName}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage || "لا توجد رسائل"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-secondary-light rounded-lg shadow-md flex flex-col border border-secondary-dark">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b">
                <h3 className="font-bold">{selectedConversation.userName}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender?.senderId === user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        msg.sender?.senderId === user?.id
                          ? "bg-primary text-white"
                          : "bg-secondary"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.sentAt).toLocaleTimeString("ar-EG")}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSendMessage()}
                  placeholder="اكتب رسالة..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
                >
                  إرسال
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-center px-4">
              {!isAdmin ? (
                <div>
                  <p className="mb-2">اختر محادثة مع الأدمن للبدء</p>
                  <p className="text-sm">يمكنك الشات مع الأدمن فقط</p>
                </div>
              ) : (
                "اختر محادثة للبدء"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

