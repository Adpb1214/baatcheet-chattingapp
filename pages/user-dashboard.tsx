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
}

const UserDashboardContent = () => {
  const session = useSession();
  const userId = session?.user?.id ?? ""; 

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch messages
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

    // Real-time subscription
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

  // Scroll to bottom on new message
  useEffect(() => {
    if (isClient) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isClient]);

  // Send message
  const handleSendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !userId) return;

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: userId,
        user_id: userId,
        content,
      },
    ]);

    if (!error) {
      setNewMessage("");

      // Simulate chatbot reply after a short delay
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender_id: "chatbot", // Chatbot sender ID
            user_id: userId,
            content: "Hi there! How can I assist you today?",
            created_at: new Date().toISOString(),
          },
        ]);
      }, 1500);
    } else {
      console.error("Failed to send message:", error);
    }
  };

  if (!isClient) {
    return <div className="p-4 text-center text-lg text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 bg-blue-100">
        <h2 className="text-lg font-semibold text-blue-700">Talk to us, we are listening 👂</h2>
      </div>
    
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 flex flex-col space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 my-auto">We are just a message away 💬</p>
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
                  className={`max-w-[80%] rounded-lg p-3 ${
                    isUser
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : isBot
                      ? "bg-purple-100 text-purple-800 rounded-tl-none"
                      : "bg-green-100 text-green-800 rounded-tl-none"
                  }`}
                >
                  {isBot && (
                    <div className="flex items-center mb-1">
                     
                      <span className="text-xs font-semibold">Dil Se Listener</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-purple-100 text-purple-800 rounded-lg rounded-tl-none p-3">
              <div className="flex items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>
    
      {/* Input */}
      <div className="flex items-center gap-2 p-4 border-t border-gray-300 bg-gray-100">
        <input
          type="text"
          placeholder="Type a message... 😊"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 p-3 border rounded-lg text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const UserDashboard = dynamic(() => Promise.resolve(UserDashboardContent), {
  ssr: false,
});

export default UserDashboard;