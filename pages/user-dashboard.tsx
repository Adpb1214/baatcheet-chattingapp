import { useEffect, useRef, useState } from "react";
import { useSession } from "@/hooks/useSession";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Heart, 
  Send, 
  Sparkles, 
  Bot, 
  Check, 
  CheckCheck,
  Smile,
  Moon,
  Star,

} from "lucide-react";

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
  const [messageCount, setMessageCount] = useState(0);
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

      if (data) {
        setMessages(data);
        setMessageCount(data.length);
      }
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
          setMessageCount(prev => prev + 1);
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
          content: "Hi there! How can I assist you today? 😊",
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="flex items-center space-x-3 text-purple-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <span className="font-medium">Opening your safe space...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, rgba(236, 72, 153, 0.1) 0%, transparent 50%), 
                                radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
             }} />
      </div>

      {/* Compact Header */}
      <div className="relative z-10 px-6 py-4 bg-white/70 backdrop-blur-sm border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                BaatCheet
              </h2>
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Safe space for your thoughts</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs px-2 py-1 bg-purple-100 text-purple-700">
              {messageCount} chats
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to your safe space</h3>
            <p className="text-gray-500 text-sm mb-4 max-w-sm">
              Share what&apos;s on your mind. We&apos;re here to listen without judgment 💫
            </p>
            <div className="flex space-x-2">
              {['🌸', '💭', '✨'].map((emoji, i) => (
                <span key={i} className="text-xl animate-bounce" style={{ animationDelay: `${i * 0.3}s` }}>
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender_id === userId;
            const isBot = msg.sender_id === "f5edd70b-3cab-4214-8bd1-ed0c6bb95126" || msg.sender_id === "chatbot";

            return (
              <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
                <div className={`max-w-xs lg:max-w-md ${isUser ? "ml-12" : "mr-12"}`}>
                  {/* Message bubble */}
                  <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                    isUser
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
                      : isBot
                      ? "bg-white border border-purple-200 text-gray-800 rounded-bl-md"
                      : "bg-white border border-green-200 text-gray-800 rounded-bl-md"
                  }`}>
                    {/* Bot label */}
                    {isBot && (
                      <div className="flex items-center space-x-1 mb-2 pb-2 border-b border-purple-100">
                        <Bot className="h-3 w-3 text-purple-600" />
                        <span className="text-xs font-medium text-purple-700">Dil Se Listener</span>
                        <Star className="h-3 w-3 text-yellow-500" />
                      </div>
                    )}
                    
                    {/* Message content */}
                    <p className="text-sm leading-relaxed whitespace-pre-line break-words">
                      {msg.content}
                    </p>
                    
                    {/* Message footer */}
                    <div className={`flex items-center justify-between mt-2 pt-1 text-xs ${
                      isUser ? "text-purple-100" : "text-gray-400"
                    }`}>
                      <span>{formatTime(msg.created_at)}</span>
                      {isUser && (
                        <div className="flex items-center space-x-1">
                          {msg.seen ? (
                            <>
                              <CheckCheck className="h-3 w-3" />
                              <span>Seen</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3" />
                              <span>Sent</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="mr-12 max-w-xs">
              <div className="bg-white border border-purple-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex items-center space-x-1 mb-2 pb-2 border-b border-purple-100">
                  <Bot className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Typing...</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative z-10 px-4 py-4 bg-white/70 backdrop-blur-sm border-t border-purple-100">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Share what's in your heart... 💭"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              className="pr-10 py-3 border-2 border-purple-200 rounded-full bg-white/80 focus:border-purple-400 focus:ring-purple-400 placeholder:text-gray-400"
              disabled={isSending}
            />
            <Smile className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            size="sm"
            className={`px-4 py-3 rounded-full transition-all duration-200 ${
              isSending
                ? "bg-gray-300 cursor-wait"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Footer indicators */}
        <div className="flex items-center justify-center mt-3 space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Heart className="h-3 w-3 text-pink-400" />
            <span>Safe</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <Moon className="h-3 w-3 text-purple-400" />
            <span>Anonymous</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>Judgment-free</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserDashboard = dynamic(() => Promise.resolve(UserDashboardContent), {
  ssr: false,
});

export default UserDashboard;