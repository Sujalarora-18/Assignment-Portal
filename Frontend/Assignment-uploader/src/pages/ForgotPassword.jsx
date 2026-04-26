import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/forgot-password`, {
        email: email.trim(),
      });
      setMessage(res.data?.message || "OTP sent if the email is registered.");
      setStep(2);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Request failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters, contain one uppercase letter and one special character.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/reset-password`, {
        email: email.trim(),
        otp,
        password,
      });
      setMessage(res.data?.message || "Password reset successfully.");
      setTimeout(() => nav("/"), 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Reset failed. The OTP might be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
              ?
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-100">
                {step === 1 ? "Forgot Password" : "Reset Password"}
              </h1>
              <p className="text-sm font-medium text-gray-400">
                {step === 1 ? "Enter your email to receive an OTP" : "Enter the OTP sent to your email"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-xl bg-emerald-900/50 border border-emerald-500 text-emerald-300 px-4 py-3 font-semibold">
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-strong"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Sending..." : "Send Reset OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="input-strong tracking-widest"
                required
                maxLength={6}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                className="input-strong"
                required
                minLength={8}
              />
               <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="input-strong"
                required
                minLength={8}
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-indigo-400 hover:text-indigo-300 font-bold"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
