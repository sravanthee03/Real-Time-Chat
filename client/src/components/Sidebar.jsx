// src/components/Sidebar.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { selectedUser, setSelectedUser, onlineUsers } = useChatStore();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/auth/users");
        setUsers(data.filter((u) => u._id !== user._id));
      } catch (err) {
        console.error("FETCH USERS ERROR:", err);
      }
    };
    fetchUsers();
  }, [user]);

  const isOnline = (id) => onlineUsers.includes(id);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-900/70 via-blue-800/60 to-blue-700/50 backdrop-blur-2xl border-r border-white/20 shadow-2xl rounded-r-3xl">
      {/* top profile */}
      <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-cyan-500 text-white rounded-br-3xl shadow-lg flex items-center justify-between">
        <div>
          <p className="font-semibold text-lg">{user?.name}</p>
          <p className="text-xs opacity-80">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="btn btn-sm bg-white/90 text-blue-600 hover:bg-white border-none shadow-md"
        >
          Logout
        </button>
      </div>

      {/* user list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {users.length === 0 && (
          <p className="text-xs text-blue-100/80">
            No other users yet. Register another account to test chat.
          </p>
        )}

        {users.map((u) => (
          <button
            key={u._id}
            onClick={() => setSelectedUser(u)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition 
              ${
                selectedUser?._id === u._id
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl scale-[1.03]"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-cyan-400 text-blue-900 rounded-full w-9 flex items-center justify-center font-semibold">
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{u.name}</p>
                <p className="text-[11px] opacity-80">{u.email}</p>
              </div>
            </div>

            <span
              className={`w-3 h-3 rounded-full ${
                isOnline(u._id)
                  ? "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                  : "bg-gray-400"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
