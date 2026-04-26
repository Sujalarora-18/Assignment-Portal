import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Api/api";

export default function ProfessorDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchNotifications();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.request("/api/professor/dashboard");
      setAssignments(res.assignments || []);
      setPendingCount(res.pendingCount || 0);
    } catch (err) {
      console.error("Dashboard Error:", err);
      if (err?.status === 401 || err?.message?.includes("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        nav("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.request("/api/professor/notifications");
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error("Notifications Error:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.request(`/api/professor/notifications/${id}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
  };

  const getDaysPendingColor = (days) => {
    if (days >= 7) return "text-red-400 bg-red-900/30";
    if (days >= 3) return "text-amber-400 bg-amber-900/30";
    return "text-emerald-400 bg-emerald-900/30";
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-extrabold text-gray-100">Professor Dashboard</h2>
          
          {pendingCount > 0 && (
            <span className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold border border-indigo-500 shadow-md">
              {pendingCount} Pending Review{pendingCount !== 1 && "s"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-700"
            >
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-gray-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="font-extrabold text-gray-100">Notifications</h3>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500 font-medium text-center">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 ${
                        !n.isRead ? "bg-indigo-900/30" : ""
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-300">{n.message}</p>
                      <p className="text-xs font-medium text-gray-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>



          <button
            onClick={logout}
            className="btn-danger px-4 py-2.5 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-sm font-bold">Pending Reviews</p>
          <p className="text-3xl font-extrabold text-indigo-400 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-sm font-bold">Unread Notifications</p>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">{unreadCount}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-sm font-bold">Oldest Pending</p>
          <p className="text-3xl font-extrabold text-red-400 mt-2">
            {assignments.length > 0
              ? `${assignments[0]?.daysPending || 0} days`
              : "-"}
          </p>
        </div>
      </div>

      <h3 className="text-xl font-extrabold text-gray-100 mb-4">
        Pending Assignments
      </h3>

      {loading ? (
        <div className="text-center py-10 font-bold text-gray-500">Loading...</div>
      ) : assignments.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 text-center font-bold text-gray-500 border border-gray-700 shadow-sm">
          No pending reviews. Great job!
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md flex justify-between items-center hover:border-indigo-500/50 transition"
            >
              <div className="flex-1">
                <p className="font-extrabold text-lg text-gray-100">{a.title}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm font-medium text-gray-400">
                  <span>
                    <strong className="text-gray-300">Student:</strong> {a.student?.name || "Unknown"}
                  </span>
                  <span>
                    <strong className="text-gray-300">Category:</strong> {a.category}
                  </span>
                  <span>
                    <strong className="text-gray-300">Submitted:</strong>{" "}
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDaysPendingColor(
                    a.daysPending
                  )}`}
                >
                  {a.daysPending} day{a.daysPending !== 1 && "s"} pending
                </span>

                <Link
                  to={`/professor/review/${a._id}`}
                  className="btn-primary px-5 py-2 text-sm"
                >
                  Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
