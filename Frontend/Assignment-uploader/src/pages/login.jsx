
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Logo from "../assets/react.svg";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        email: form.email.trim(),
        password: form.password,
      });

      const { user, token } = res.data || {};
      if (!user || !token) {
        throw new Error("Invalid server response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const role = String(user.role || "").toLowerCase();

      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "student") {
        navigate("/student/dashboard", { replace: true });
      } else if (role === "professor") {
        navigate("/professor/dashboard", { replace: true });
      } else if (role === "hod") {
        navigate("/hod/dashboard", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err?.response ?? err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Left: Logo, Name, Tagline */}
      <div className="md:w-1/2 flex flex-col items-center justify-center text-center p-10 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white">
        <img src={Logo} alt="Project Logo" className="w-32 h-32 mx-auto mb-6 drop-shadow-xl" />
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight drop-shadow-lg">Assignment Uploader</h1>
        <p className="text-xl font-semibold mb-4 opacity-90">Empowering seamless assignment management</p>
        <span className="text-base opacity-70">Your digital platform for easy, secure, and efficient assignment submissions.</span>
      </div>

      {/* Right: Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 md:p-12 border-2 border-slate-200">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2 text-center">Welcome back</h2>
          <p className="text-center text-slate-600 font-medium mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
              className="input-strong"
            />

            <input
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              required
              className="input-strong"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-2 border-slate-400 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>

              <Link
                to="/forgot"
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                Forgot?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
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
                  Logging in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-semibold text-slate-600">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-bold"
            >
              Sign up
            </Link>
            <span className="mx-2 text-gray-300">|</span>
            <Link to="/home" className="text-gray-600 hover:underline">
              Home
            </Link>
          </div>

          <p className="mt-4 text-center text-xs font-medium text-slate-500">
            By continuing you agree to our {" "}
            <span className="underline">Terms</span> and {" "}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
