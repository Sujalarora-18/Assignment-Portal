
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Logo from "../assets/campusflow-logo.svg";

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
        navigate("/", { replace: true });
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
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950">
      {/* Left: Logo */}
      <div className="md:w-1/2 flex flex-col items-center justify-center text-center p-10 bg-gray-900 text-gray-100">
        <img src={Logo} alt="CampusFlow Logo" className="w-80 h-auto mb-8" />
        <h1 className="text-4xl font-bold text-gray-100 mb-3">Welcome Back</h1>
        <p className="text-xl font-semibold text-gray-400 mb-6">Manage Assignments Effortlessly</p>
        <div className="max-w-sm space-y-4 text-left">
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 font-bold text-lg">✓</span>
            <p className="text-gray-400 font-medium">Track and submit assignments in one place</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 font-bold text-lg">✓</span>
            <p className="text-gray-400 font-medium">Get instant feedback from faculty</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-indigo-400 font-bold text-lg">✓</span>
            <p className="text-gray-400 font-medium">Streamlined workflow for educators</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-8">Built for universities and institutions</p>
      </div>

      {/* Right: Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-gray-950">
        <div className="w-full max-w-md bg-gray-800 shadow-2xl rounded-2xl p-8 md:p-12 border border-gray-700">
          <h2 className="text-3xl font-extrabold text-gray-100 mb-2 text-center">Welcome back</h2>
          <p className="text-center text-gray-400 font-medium mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 font-semibold">
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
              <label className="inline-flex items-center gap-2 font-semibold text-gray-400">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-gray-900"
                />
                Remember me
              </label>

              <Link
                to="/forgot"
                className="text-indigo-400 hover:underline font-bold"
              >
                Forgot?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
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

          <div className="mt-6 text-center text-sm font-semibold text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-400 hover:underline font-bold"
            >
              Sign up
            </Link>
          </div>

          <p className="mt-4 text-center text-xs font-medium text-gray-500">
            By continuing you agree to our {" "}
            <span className="underline">Terms</span> and {" "}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
