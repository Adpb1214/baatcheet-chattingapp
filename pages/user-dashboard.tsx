import { useEffect, useRef, useState } from "react";
import { useSession } from "@/hooks/useSession";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  sender_id: string;
  user_id: string;
  content: string;
  created_at: string;
  seen?: boolean;
  seen_at?: string;
}

const UserDashboardContent = () => {
  const session = useSession();
  const userId = session?.user?.id ?? "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!userId || !isClient) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
      if (error) console.error("Error fetching messages:", error);
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages:user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isClient]);

  useEffect(() => {
    if (isClient) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isClient]);

  useEffect(() => {
    const markMessagesSeen = async () => {
      if (!userId) return;

      const unseen = messages.filter(
        (msg) => !msg.seen && msg.sender_id !== userId
      );
      if (unseen.length > 0) {
        const { error } = await supabase
          .from("messages")
          .update({ seen: true, seen_at: new Date().toISOString() })
          .in("id", unseen.map((m) => m.id));

        if (error) console.error("Failed to update seen status:", error);
      }
    };

    markMessagesSeen();
  }, [messages, userId]);

  useEffect(() => {
    const typingChannel = supabase
      .channel("typing-status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "typing_status" },
        (payload) => {
          if (payload.new.user_id !== userId) {
            setIsTyping(payload.new.is_typing);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [userId]);

  useEffect(() => {
    const updateTyping = async () => {
      if (!userId) return;
      await supabase
        .from("typing_status")
        .upsert({ user_id: userId, is_typing: true });
    };

    const timer = setTimeout(() => {
      supabase
        .from("typing_status")
        .upsert({ user_id: userId, is_typing: false });
    }, 2000);

    if (newMessage.trim()) {
      updateTyping();
    }

    return () => clearTimeout(timer);
  }, [newMessage]);

  const handleSendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !userId) return;

    setIsSending(true);

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: userId,
        user_id: userId,
        content,
      },
    ]);

    if (!error) {
      setNewMessage("");

      if (messages.length === 0) {
        setIsTyping(true);

        const botMessage = {
          sender_id: "f5edd70b-3cab-4214-8bd1-ed0c6bb95126",
          user_id: userId,
          content: "Hi there! How can I assist you today?",
          created_at: new Date().toISOString(),
        };

        setTimeout(async () => {
          setIsTyping(false);

          const { error: botError } = await supabase
            .from("messages")
            .insert([botMessage]);
          if (botError) {
            console.error("Bot message failed to save:", botError);
          }
        }, 1500);
      }
    } else {
      console.error("Failed to send message:", error);
    }

    setIsSending(false);
  };

  if (!isClient) {
    return (
      <div className="p-4 text-center text-lg text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="p-4 border-b border-gray-300 bg-gradient-to-r from-blue-200 via-white to-purple-200">
        <h2 className="text-lg font-semibold text-blue-700 text-center">
          Talk to us, we are listening 👂
        </h2>
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 my-auto">
            We are just a message away 💬
          </p>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender_id === userId;
            const isBot = msg.sender_id === "chatbot";

            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-xl shadow ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : isBot
                      ? "bg-purple-100 text-purple-900 rounded-tl-sm"
                      : "bg-green-100 text-green-800 rounded-tl-sm"
                  }`}
                >
                  {isBot && (
                    <p className="text-xs font-semibold mb-1 text-purple-700">
                      Dil Se Listener
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-line break-words">
                    {msg.content}
                  </p>
                  {isUser && msg.seen && (
                    <p className="text-xs text-right text-gray-200 mt-1">
                      Seen ✅
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-purple-100 text-purple-800 p-4 rounded-xl rounded-tl-sm shadow max-w-[75%]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <div className="p-4 border-t border-gray-300 bg-white shadow-inner flex gap-2">
        <input
          type="text"
          placeholder="Wanna share something... 😊"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 p-3 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || isSending}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            isSending
              ? "bg-blue-300 cursor-wait"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          }`}
        >
          {isSending ? "Sending..." : "Send 🚀"}
        </button>
      </div>
    </div>
  );
};

const UserDashboard = dynamic(() => Promise.resolve(UserDashboardContent), {
  ssr: false,
});

export default UserDashboard;
