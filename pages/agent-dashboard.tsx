// pages/agent-dashboard.tsx

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/useSession";
import { formatDistanceToNow } from "date-fns";

interface Profile {
  id: string;
  email: string;
  role: string;
}
interface Message {
  id: string;
  user_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  seen?: boolean;
  seen_at?: string;
}

const AgentDashboardContent = () => {
  const session = useSession();
  const agentId = session?.user?.id ?? "";

  const [users, setUsers] = useState<Profile[]>([]);
  const [agentIds, setAgentIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isUserTyping, setIsUserTyping] = useState(false);

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role")
        .neq("role", "agent");

      if (data) setUsers(data);
      if (error) console.error("Error fetching users:", error);
    };

    if (isClient) fetchUsers();
  }, [isClient]);

  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "agent");

      if (data) setAgentIds(data.map((a) => a.id));
      if (error) console.error("Error fetching agents:", error);
    };

    if (isClient) fetchAgents();
  }, [isClient]);

  useEffect(() => {
    if (!selectedUser || !isClient) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", selectedUser.id)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
      if (error) console.error("Error fetching messages:", error);
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages:user:${selectedUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `user_id=eq.${selectedUser.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .on(
        "postgres_changes", 
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `user_id=eq.${selectedUser.id}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages((prev) => 
            prev.map(msg => msg.id === updatedMsg.id ? updatedMsg : msg)
          );
        }
      )
      .subscribe();

    // On mobile, close the sidebar when a user is selected
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }

    // Subscribe to typing status changes for the selected user
    const typingChannel = supabase
      .channel(`typing-status:${selectedUser.id}`)
      .on(
        "postgres_changes",
        { 
          event: "UPDATE", 
          schema: "public", 
          table: "typing_status",
          filter: `user_id=eq.${selectedUser.id}`
        },
        (payload) => {
          setIsUserTyping(payload.new.is_typing);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
    };
  }, [selectedUser, isClient]);

  useEffect(() => {
    if (isClient) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isClient]);

  // Mark agent messages as seen when the user sees them
  useEffect(() => {
    const markMessagesSeen = async () => {
      if (!selectedUser || !agentId) return;

      const unseen = messages.filter(
        (msg) => !msg.seen && msg.sender_id === agentId
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
  }, [messages, selectedUser, agentId]);

  // Update typing status based on input changes
  useEffect(() => {
    if (!selectedUser || !agentId) return;
    
    const updateTyping = async () => {
      await supabase
        .from("typing_status")
        .upsert({ user_id: agentId, is_typing: true });
    };

    const timer = setTimeout(() => {
      supabase
        .from("typing_status")
        .upsert({ user_id: agentId, is_typing: false });
    }, 2000);

    if (newMessage.trim()) {
      updateTyping();
    }

    return () => clearTimeout(timer);
  }, [newMessage, selectedUser, agentId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !agentId) return;

    setSending(true);

    const { error } = await supabase.from("messages").insert([
      {
        user_id: selectedUser.id,
        sender_id: agentId,
        content: newMessage.trim(),
        seen: false,
      },
    ]);

    setSending(false);

    if (!error) setNewMessage("");
    else console.error("Failed to send message:", error);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isAgentMessage = (senderId: string) => agentIds.includes(senderId);

  const formatMessageTime = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting message time:", error);
      return "";
    }
  };

  const getInitials = (email: string): string => {
    if (!email) return "?";
    const parts = email.split("@")[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isClient) return <div className="p-4 text-gray-700">Loading dashboard...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-3 flex items-center justify-between shadow-sm">
        <button 
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-blue-600">Agent Dashboard</h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static z-30 h-full md:h-auto md:flex-shrink-0 w-full md:w-72 lg:w-80 bg-white border-r border-gray-200 shadow-lg md:shadow-none`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h2 className="text-xl font-bold">Users</h2>
              <p className="text-sm text-blue-100">Select a user to chat</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {users.length > 0 ? (
                  users.map((user) => (
                    <button
                      key={user.id}
                      className={`flex items-center w-full p-3 rounded-lg transition ${
                        selectedUser?.id === user.id
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setSelectedUser(user);
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedUser?.id === user.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}>
                        {getInitials(user.email)}
                      </div>
                      <div className="ml-3 text-left">
                        <p className="font-medium text-gray-600 truncate">{user.email || "User"}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          {selectedUser ? (
            <div className="p-3 border-b border-gray-200 flex items-center bg-white shadow-sm">
              {sidebarOpen === false && (
                <button
                  onClick={toggleSidebar}
                  className="mr-2 text-gray-600 md:hidden"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white`}>
                {getInitials(selectedUser.email)}
              </div>
              <div className="ml-3">
                <h2 className="font-semibold text-gray-600">{selectedUser.email || "User"}</h2>
                <p className="text-xs text-gray-500">
                  {isUserTyping ? (
                    <span className="text-green-600 font-medium flex items-center">
                      typing
                      <span className="ml-1 flex space-x-1">
                        <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                        <span className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                      </span>
                    </span>
                  ) : (
                    selectedUser.role
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm hidden md:block">
              <h2 className="text-xl font-semibold text-gray-600">Select a user to start chatting</h2>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 bg-gray-50">
            {!selectedUser ? (
              <div className="flex flex-col flex-1 items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg">Select a user to start chatting</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col flex-1 items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-lg">No messages yet</p>
                <p className="text-sm mt-2">Send a message to start the conversation</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isAgent = isAgentMessage(msg.sender_id);
                  const showDate = index === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();
                  
                  return (
                    <div key={msg.id} className="w-full">
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <div className="bg-gray-200 rounded-full px-3 py-1 text-xs text-gray-600">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      <div
                        className={`flex ${
                          isAgent ? "justify-end" : "justify-start"
                        } w-full`}
                      >
                        {!isAgent && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mr-2">
                            {getInitials(selectedUser.email)}
                          </div>
                        )}
                        
                        <div className="max-w-xs sm:max-w-sm md:max-w-md">
                          <div
                            className={`p-3 rounded-2xl ${
                              isAgent
                                ? "bg-blue-600 text-white rounded-tr-none"
                                : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                            } shadow-sm`}
                          >
                            {msg.content}
                          </div>
                          <div 
                            className={`text-xs mt-1 text-gray-500 ${
                              isAgent ? "text-right mr-1" : "ml-1"
                            }`}
                          >
                            {formatMessageTime(msg.created_at)}
                            {isAgent && msg.seen && (
                              <span className="ml-2 text-blue-400">Seen ✓</span>
                            )}
                          </div>
                        </div>
                        
                        {isAgent && (
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 ml-2">
                            AG
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isUserTyping && (
                  <div className="flex justify-start w-full mt-1">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mr-2">
                      {getInitials(selectedUser.email)}
                    </div>
                    <div className="bg-white text-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm max-w-xs">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            {selectedUser ? (
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-gray-100 rounded-lg p-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
                  <input
                    ref={inputRef}
                    type="text"
                    className="w-full p-2 bg-transparent text-gray-600 focus:outline-none"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className={`p-3 rounded-full transition flex items-center justify-center ${
                    !newMessage.trim() || sending
                      ? "bg-gray-300 text-gray-500"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {sending ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center p-2 text-gray-500 text-sm">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const AgentDashboard = dynamic(() => Promise.resolve(AgentDashboardContent), {
  ssr: false,
});

export default AgentDashboard;