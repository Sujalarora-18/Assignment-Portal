
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Logo from "../assets/campusflow-logo.svg";
import OTPVerificationModal from "../components/OTPVerificationModal";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError("Password must be at least 8 characters, contain one uppercase letter and one special character.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/signup`, form);
      setSignupEmail(form.email);
      setShowOTPModal(true);
      setForm({ name: "", email: "", password: "", role: "student" });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
    setLoading(false);
  };

  const handleOTPVerified = () => {
    setShowOTPModal(false);
    alert("Email verified successfully! You can now log in.");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950">
      {/* Left: Logo */}
      <div className="md:w-1/2 flex flex-col items-center justify-center text-center p-10 bg-gray-900 text-gray-100">
        <img src={Logo} alt="CampusFlow Logo" className="w-80 h-auto mb-8" />
        <h1 className="text-4xl font-bold text-gray-100 mb-3">Join CampusFlow</h1>
        <p className="text-xl font-semibold text-gray-400 mb-6">Simplify Your Academic Journey</p>
        <div className="max-w-sm space-y-4 text-left">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 font-bold text-lg">✓</span>
            <p className="text-gray-400 font-medium">Easy assignment submission and tracking</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-400 font-bold text-lg">✓</span>
            <p className="text-gray-400 font-medium">Real-time notifications and updates</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-400 font-bold text-lg">✓</span>
            <p className="text-gray-400 font-medium">Collaborate with professors and peers</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-8">Join thousands of students already using CampusFlow</p>
      </div>

      {/* Right: Signup Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-950">
        <div className="w-full max-w-md bg-gray-800 shadow-2xl rounded-2xl p-8 md:p-12 border border-gray-700">
          <h2 className="text-3xl font-extrabold text-gray-100 mb-2 text-center">Sign Up</h2>
          <p className="text-center text-gray-400 font-medium mb-6">Create your account to get started</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="Full Name"
              className="input-strong"
              required
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="Email address"
              className="input-strong"
              required
            />

            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder="Password"
              className="input-strong"
              required
            />

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input-strong"
            >
              <option value="student">Student</option>
              <option value="professor">Professor</option>
              <option value="hod">HOD</option>
              <option value="admin">Admin</option>
            </select>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-xl font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-400 font-semibold mt-6">
            Already have an account?{" "}
            <Link to="/" className="text-blue-400 hover:underline font-bold">
              Login
            </Link>
          </p>
        </div>
      </div>

      {showOTPModal && (
        <OTPVerificationModal
          email={signupEmail}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </div>
  );
}
