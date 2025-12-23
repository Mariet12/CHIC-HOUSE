"use client";

import React, { useState, useEffect, useRef } from "react";
import { chatApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ChatPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [loadingNewChat, setLoadingNewChat] = useState(false);
  const [errorNewChat, setErrorNewChat] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchConversations();
  }, [token]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await chatApi.getAllConversations();
      if (response.data?.data) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
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
    if (!receiverId.trim() || !user?.id) return;
    setLoadingNewChat(true);
    setErrorNewChat(null);
    try {
      const response = await chatApi.createConversation({
        senderId: user.id,
        receiverId: receiverId.trim(),
      });
      await fetchConversations();
      // لو الـ API رجع الـ id الجديد، نحاول اختياره
      const newId = response.data?.data?.id;
      if (newId) {
        const newConv = conversations.find((c) => c.id === newId);
        if (newConv) setSelectedConversation(newConv);
      }
      setReceiverId("");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Cannot start conversation";
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
      <h1 className="text-3xl font-bold mb-8 text-primary">Chat</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Conversations List */}
        <div className="bg-secondary-light rounded-lg shadow-md p-4 overflow-y-auto border border-secondary-dark">
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Start new chat (receiver ID or email)"
                value={receiverId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReceiverId(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={handleCreateConversation}
                disabled={loadingNewChat}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-60"
              >
                {loadingNewChat ? "Starting..." : "Start"}
              </button>
            </div>
            {errorNewChat && <p className="text-sm text-red-600">{errorNewChat}</p>}

            <input
              type="text"
              placeholder="Search chats..."
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
                      {conv.lastMessage || "No messages"}
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
                        {new Date(msg.sentAt).toLocaleTimeString("en-US")}
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
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to start
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

