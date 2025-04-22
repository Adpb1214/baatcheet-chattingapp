// pages/agent-dashboard.tsx

import { useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/useSession";

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
}

// The main component with client-side only rendering
const AgentDashboardContent = () => {
    const session = useSession();  // Don't destructure directly
    const agentId = session?.user?.id ?? "";  // Safe access using optional chaining
  
    // The rest of the component remains the same
    const [users, setUsers] = useState<Profile[]>([]);
    const [agentIds, setAgentIds] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isClient, setIsClient] = useState(false);
  
    const messageEndRef = useRef<HTMLDivElement | null>(null);
  
    // Set isClient to true when component mounts on client
    useEffect(() => {
      setIsClient(true);
    }, []);
  
    // Fetch users, agents, and messages like before
    useEffect(() => {
      const fetchUsers = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, role")
          .neq("role", "agent");
  
        if (data) setUsers(data || []);
        if (error) console.error("Error fetching users:", error);
      };
  
      if (isClient) {
        fetchUsers();
      }
    }, [isClient]);
  
    useEffect(() => {
      const fetchAgents = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "agent");
  
        if (data) {
          const ids = data.map((a) => a.id);
          setAgentIds(ids);
        }
        if (error) console.error("Error fetching agents:", error);
      };
  
      if (isClient) {
        fetchAgents();
      }
    }, [isClient]);
  
    useEffect(() => {
      if (!selectedUser || !isClient) return;
  
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("user_id", selectedUser.id)
          .order("created_at", { ascending: true });
  
        if (data) setMessages(data || []);
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
        .subscribe();
  
      return () => {
        supabase.removeChannel(channel);
      };
    }, [selectedUser, isClient]);
  
    useEffect(() => {
      if (isClient) {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages, isClient]);
  
    const handleSendMessage = async () => {
      if (!newMessage.trim() || !selectedUser || !agentId) return;
  
      const content = newMessage.trim();
  
      const { error } = await supabase.from("messages").insert([
        {
          user_id: selectedUser.id,
          sender_id: agentId,
          content,
        },
      ]);
  
      if (!error) {
        setNewMessage("");
      } else {
        console.error("Failed to send message:", error);
      }
    };
  
    const isAgentMessage = (senderId: string) => {
      return agentIds.includes(senderId);
    };
  
    if (!isClient) {
      return <div className="p-4">Loading dashboard...</div>;
    }
  
    return (
        <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Fixed User List */}
        <div className="w-80 border-r p-4 overflow-auto">
          <h2 className="text-lg font-semibold">Users</h2>
          <ul>
            {users && users.length > 0 ? (
              users.map((user) => (
                <li key={user.id} className="py-2">
                  <button
                    className={`w-full text-left p-2 rounded-md ${
                      selectedUser?.id === user.id ? "bg-blue-100" : ""
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    {user.email || "User"}
                  </button>
                </li>
              ))
            ) : (
              <li>
                <p className="text-gray-500">No users found</p>
              </li>
            )}
          </ul>
        </div>
      
        {/* Chat Window */}
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              Chat with {selectedUser ? (selectedUser.email || "User") : "Select a user"}
            </h2>
          </div>
      
          {/* Message List */}
          <div className="flex-1 overflow-auto px-4 py-2">
            {!selectedUser ? (
              <p className="text-gray-500">Select a user to start chatting</p>
            ) : messages.length === 0 ? (
              <p className="text-gray-500">No messages</p>
            ) : (
              messages.map((msg) => {
                const isAgent = isAgentMessage(msg.sender_id); // Check if it's an agent message
                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-md mb-2 ${
                      isAgent
                        ? "bg-green-200 text-green-800 self-end" // Green for agent
                        : "bg-gray-200 text-gray-800 self-start" // Gray for user
                    }`}
                  >
                    <p className="inline-block">{msg.content || ""}</p>
                  </div>
                );
              })
            )}
            <div ref={messageEndRef} />
          </div>
      
          {/* Input Area */}
          <div className="flex gap-2 p-4 border-t">
            <input
              type="text"
              className="flex-1 p-2 border rounded-md"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!selectedUser}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={handleSendMessage}
              disabled={!selectedUser}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      
      
    );
  };
  

// Using dynamic import with ssr: false to prevent server-side rendering issues
const AgentDashboard = dynamic(() => Promise.resolve(AgentDashboardContent), {
  ssr: false,
});

export default AgentDashboard;
