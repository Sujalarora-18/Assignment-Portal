import React, { useState, useEffect } from "react";
import axios from "axios";

export default function OTPVerificationModal({ email, onVerified, onClose }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/verify-otp`,
        { email, otp }
      );

      setSuccess(res.data.message);
      setTimeout(() => {
        onVerified();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/resend-otp`,
        { email }
      );

      setSuccess(res.data.message);
      setTimer(600);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="w-full px-4 py-3 text-center text-3xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 tracking-widest"
            />
            <p className="text-xs text-gray-500 text-center mt-2">
              OTP expires in {formatTimer(timer)}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Didn't receive the OTP?{" "}
            <button
              onClick={handleResendOTP}
              disabled={!canResend || loading}
              className="text-blue-600 hover:text-blue-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Resend
            </button>
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 text-gray-600 hover:text-gray-800 font-medium py-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
