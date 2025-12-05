// src/components/ChatWindow.jsx
import { useEffect, useRef } from "react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import MessageInput from "./MessageInput";

const ChatWindow = ({ socket, loading }) => {
  const { selectedUser, messages, addMessage, onlineUsers } = useChatStore();
  const { user } = useAuthStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const onReceive = (message) => addMessage(message);
    const onEcho = (message) => addMessage(message);

    socket.on("receive_message", onReceive);
    socket.on("message_sent", onEcho);

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("message_sent", onEcho);
    };
  }, [socket, addMessage]);

  if (!selectedUser) {
    return (
      <div className="h-full flex-1 flex items-center justify-center text-blue-100">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">
            Select a user to start chatting 💬
          </p>
          <p className="text-xs text-blue-100/80">
            (Open another browser window and log in with a second account.)
          </p>
        </div>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  // 🔥 IMPORTANT: h-full + flex + flex-col makes the input stick to bottom
  return (
    <div className="h-full flex-1 flex flex-col bg-white/10 backdrop-blur-2xl border-l border-white/20 rounded-l-3xl shadow-inner">
      {/* header */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white rounded-bl-3xl shadow-lg flex items-center justify-between border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-white/30 text-white rounded-full w-10 flex items-center justify-center font-semibold">
              {selectedUser.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm">{selectedUser.name}</p>
            <p className="text-[11px] opacity-90">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* messages - takes all remaining space */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-blue-700/20 rounded-tl-3xl">
        {loading ? (
          <p className="text-blue-100">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-blue-100/80 text-sm text-center mt-4">
            No messages yet. Say hi 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender === user._id;
            return (
              <div
                key={m._id || m.createdAt}
                className={`chat ${mine ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble max-w-xs md:max-w-md shadow-xl ${
                    mine
                      ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-blue-900/40"
                      : "bg-white/90 text-gray-900"
                  }`}
                >
                  {m.imageUrl ? (
                    <img
                      src={`http://localhost:5000${m.imageUrl}`}
                      alt="sent"
                      className="rounded-lg max-h-64 object-cover"
                    />
                  ) : m.audioUrl ? (
                    <audio
                      controls
                      src={`http://localhost:5000${m.audioUrl}`}
                      className="max-w-full"
                    />
                  ) : (
                    m.content
                  )}
                </div>

                <div className="text-[10px] opacity-80 mt-1 text-blue-100 flex items-center gap-1">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {mine && (
                    <span className="ml-1">
                      {m.status === "seen" ? "👁" : "✔"}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* input bar - always at bottom */}
      <MessageInput socket={socket} />
    </div>
  );
};

export default ChatWindow;
