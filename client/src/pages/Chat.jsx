// src/pages/Chat.jsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Chat = () => {
  const { user } = useAuthStore();
  const { selectedUser, setMessages, setOnlineUsers } = useChatStore();
  const [socket, setSocket] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "night");
  }, []);

  useEffect(() => {
    if (!user?._id) return;

   const s = io("https://real-time-chat-backend-28xj.onrender.com", {
  withCredentials: true,
});

    setSocket(s);

    s.emit("user_connected", user._id);
    s.on("online_users", (users) => setOnlineUsers(users));

    return () => {
      s.disconnect();
    };
  }, [user, setOnlineUsers]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUser) return;

      setLoadingMessages(true);
      try {
        const { data } = await api.get(`/messages/${selectedUser._id}`);
        setMessages(data);
        await api.post(`/messages/seen/${selectedUser._id}`);
      } catch (err) {
        console.error("FETCH MESSAGES ERROR:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedUser, setMessages]);

  return (
    <div className="min-h-screen flex relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 overflow-hidden">
      {/* radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.45),transparent_70%)]" />

      {/* sidebar */}
      <div className="hidden md:flex md:w-80 lg:w-96 relative z-10">
        <Sidebar />
      </div>

      {/* chat area - make sure it stretches full height */}
      <div className="flex-1 flex relative z-10">
        <ChatWindow socket={socket} loading={loadingMessages} />
      </div>
    </div>
  );
};

export default Chat;
