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

  const messageEndRef = useRef<HTMLDivElement | null>(null);

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

    setSending(true);

    const { error } = await supabase.from("messages").insert([
      {
        user_id: selectedUser.id,
        sender_id: agentId,
        content: newMessage.trim(),
      },
    ]);

    setSending(false);

    if (!error) setNewMessage("");
    else console.error("Failed to send message:", error);
  };

  const isAgentMessage = (senderId: string) => agentIds.includes(senderId);

  if (!isClient) return <div className="p-4 text-gray-700">Loading dashboard...</div>;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 p-4 overflow-auto bg-gray-100 text-gray-800">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <ul>
          {users.length > 0 ? (
            users.map((user) => (
              <li key={user.id} className="py-2">
                <button
                  className={`w-full text-left p-2 rounded-md transition ${
                    selectedUser?.id === user.id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  {user.email || "User"}
                </button>
              </li>
            ))
          ) : (
            <li>
              <p className="text-gray-600">No users found</p>
            </li>
          )}
        </ul>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col bg-white text-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold">
            Chat with{" "}
            {selectedUser ? selectedUser.email || "User" : "Select a user"}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto px-6 py-4 space-y-2 bg-gray-50">
          {!selectedUser ? (
            <p className="text-gray-500">Select a user to start chatting</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500">No messages yet</p>
          ) : (
            messages.map((msg) => {
              const isAgent = isAgentMessage(msg.sender_id);
              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    isAgent ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs md:max-w-md p-3 rounded-lg shadow ${
                      isAgent
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 p-4 border-t border-gray-200 bg-white">
          <input
            type="text"
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!selectedUser || sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!selectedUser || sending}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center"
          >
            {sending ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AgentDashboard = dynamic(() => Promise.resolve(AgentDashboardContent), {
  ssr: false,
});

export default AgentDashboard;
