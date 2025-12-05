// src/components/MessageInput.jsx
import { useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import useChatStore from "../store/useChatStore";
import useAuthStore from "../store/useAuthStore";
import api from "../api/axios";

const MessageInput = ({ socket }) => {
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);

  const { selectedUser } = useChatStore();
  const { user } = useAuthStore();

  const handleSendText = (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedUser || !socket) return;

    socket.emit("send_message", {
      senderId: user._id,
      receiverId: selectedUser._id,
      content: content.trim(),
      imageUrl: "",
      audioUrl: "",
    });

    setContent("");
    setShowEmoji(false);
  };

  const handleImageClick = () => {
    if (!selectedUser) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser || !socket) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      socket.emit("send_message", {
        senderId: user._id,
        receiverId: selectedUser._id,
        content: "",
        imageUrl: data.imageUrl,
        audioUrl: "",
      });
    } catch (err) {
      console.error("IMAGE UPLOAD ERROR:", err);
    } finally {
      e.target.value = "";
    }
  };

  const onEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="relative">
      {/* emoji picker popup */}
      {showEmoji && (
        <div className="absolute bottom-16 left-4 z-20 shadow-2xl rounded-2xl overflow-hidden">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme="dark"
            height={320}
            width={280}
          />
        </div>
      )}

      {/* hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImageChange}
      />

      <form
        onSubmit={handleSendText}
        className="px-4 py-3 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 flex items-center gap-3 shadow-xl border-t border-white/20"
      >
        {/* emoji button */}
        <button
          type="button"
          className="btn btn-circle btn-sm bg-white/20 text-yellow-200 hover:bg-white/30 shadow-md border border-white/30 backdrop-blur"
          onClick={() => setShowEmoji((v) => !v)}
          disabled={!selectedUser}
          title="Emoji"
        >
          😄
        </button>

        {/* image button */}
        <button
          type="button"
          className="btn btn-circle btn-sm bg-white/20 text-blue-200 hover:bg_white/30 shadow-md border border-white/30 backdrop-blur"
          onClick={handleImageClick}
          disabled={!selectedUser}
          title="Send photo"
        >
          📷
        </button>

        {/* text input */}
        <input
          type="text"
          className="input input-bordered bg-white/30 text-white placeholder-white/60 border border-white/40 backdrop-blur flex-1"
          placeholder={
            selectedUser ? `Message ${selectedUser.name}...` : "Select a user..."
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!selectedUser}
        />

        <button
          className="btn bg-white/20 text-white font-semibold hover:bg-white/30 border border-white/40 shadow-md backdrop-blur"
          type="submit"
          disabled={!selectedUser || !socket || !content.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
