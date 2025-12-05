import { useState } from "react";
import api from "../api/axios";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/login", form);
      setUser(
        { _id: data._id, name: data.name, email: data.email },
        data.token
      );
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 p-5">

      {/* Glass Panel */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl 
        rounded-3xl shadow-2xl p-8 border border-white/20">

        <h2 className="text-3xl font-bold text-blue-100 text-center mb-6 drop-shadow-lg">
          Welcome Back 💙
        </h2>

        {error && (
          <p className="text-red-300 text-sm text-center mb-3 bg-red-900/40 py-1 rounded-md">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-white">

          <input
            className="input input-bordered w-full bg-white/20 text-white placeholder-white/60 
              border-white/30 focus:border-cyan-300 focus:outline-none"
            placeholder="Email Address"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="password"
            className="input input-bordered w-full bg-white/20 text-white placeholder-white/60 
              border-white/30 focus:border-cyan-300 focus:outline-none"
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          <button
            className="btn w-full mt-2 bg-gradient-to-r from-blue-600 to-cyan-400 
              hover:from-cyan-400 hover:to-blue-500 text-white font-semibold 
              rounded-xl shadow-xl border-none"
            type="submit"
          >
            Login 🔐
          </button>
        </form>

        <p
          className="text-sm mt-4 text-center text-blue-200 hover:text-white cursor-pointer"
          onClick={() => navigate("/register")}
        >
          New here? <span className="font-bold">Create an account</span>
        </p>
      </div>
    </div>
  );
}
