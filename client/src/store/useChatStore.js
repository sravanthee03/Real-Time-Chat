import { create } from "zustand";

const useChatStore = create((set) => ({
  selectedUser: null,
  messages: [],
  onlineUsers: [],
  setSelectedUser: (user) => set({ selectedUser: user, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));

export default useChatStore;
