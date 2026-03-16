
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Logo from "../assets/campusflow-logo.svg";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/signup`, form);
      alert(res.data.message);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-800">
      {/* Left: Logo */}
      <div className="md:w-1/2 flex flex-col items-center justify-center text-center p-10 bg-gray-400 text-gray-900">
        <img src={Logo} alt="CampusFlow Logo" className="w-80 h-auto mb-8" />
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Join CampusFlow</h1>
        <p className="text-xl font-semibold text-gray-700 mb-6">Simplify Your Academic Journey</p>
        <div className="max-w-sm space-y-4 text-left">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold text-lg">✓</span>
            <p className="text-gray-700 font-medium">Easy assignment submission and tracking</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold text-lg">✓</span>
            <p className="text-gray-700 font-medium">Real-time notifications and updates</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold text-lg">✓</span>
            <p className="text-gray-700 font-medium">Collaborate with professors and peers</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-8">Join thousands of students already using CampusFlow</p>
      </div>

      {/* Right: Signup Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 md:p-12 border border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Sign Up</h2>
          <p className="text-center text-gray-600 font-medium mb-6">Create your account to get started</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-xl border border-gray-400 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-900 placeholder-gray-400 font-medium"
              required
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-xl border border-gray-400 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-900 placeholder-gray-400 font-medium"
              required
            />

            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-400 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-900 placeholder-gray-400 font-medium"
              required
            />

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-400 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-900 font-medium"
            >
              <option value="student">Student</option>
              <option value="professor">Professor</option>
              <option value="hod">HOD</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-700 transition disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-700 font-semibold mt-6">
            Already have an account?{" "}
            <Link to="/" className="text-gray-900 hover:underline font-bold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
