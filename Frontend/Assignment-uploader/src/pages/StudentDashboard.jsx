import React, { useEffect, useState } from "react";
import api from "../Api/api";
import { Link, useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    draft: 0,
    submitted: 0,
    forwarded: 0,
    approved: 0,
    rejected: 0,
  });
  const [recent, setRecent] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api
      .request("/api/student/dashboard")
      .then((r) => {
        setStats(
          r.stats || {
            draft: 0,
            submitted: 0,
            forwarded: 0,
            approved: 0,
            rejected: 0,
          }
        );
        setRecent(Array.isArray(r.recent) ? r.recent : []);
      })
      .catch((err) => {
        console.error("Dashboard fetch error", err);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        nav("/");
      });
  }, [nav]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
  };

  const statusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-emerald-400";
      case "rejected":
        return "text-red-400";
      case "submitted":
        return "text-amber-400";
      case "forwarded":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-100">
          Student Dashboard
        </h1>

        <div className="flex gap-3">

          <button
            onClick={logout}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold border border-red-500 transition shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        <Card title="Drafts" value={stats.draft} color="text-gray-400 bg-gray-800" />
        <Card title="Submitted" value={stats.submitted} color="text-amber-400 bg-amber-900/30" />
        <Card title="Forwarded" value={stats.forwarded || 0} color="text-blue-400 bg-blue-900/30" />
        <Card title="Approved" value={stats.approved} color="text-emerald-400 bg-emerald-900/30" />
        <Card title="Rejected" value={stats.rejected} color="text-red-400 bg-red-900/30" />
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-extrabold text-gray-100 mb-4">
          Recent Submissions
        </h3>

        {recent.length === 0 ? (
          <p className="text-gray-500 font-medium">No submissions yet.</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((r) => (
              <li
                key={r._id}
                className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-sm flex justify-between items-center hover:shadow-md hover:border-gray-600 transition"
              >
                <Link
                  to={`/student/assignments/${r._id}`}
                  className="font-bold text-gray-200 hover:text-blue-400 hover:underline"
                >
                  {r.title}
                </Link>

                <div className="text-right">
                  <p className={`text-sm font-bold ${statusColor(r.status)}`}>
                    {r.status?.toUpperCase()}
                  </p>
                  <p className="text-sm font-medium text-gray-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/student/upload">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg">
            Upload New Assignment
          </button>
        </Link>

        <Link to="/student/bulk-upload">
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl border border-gray-600 transition shadow-sm">
            Bulk Upload
          </button>
        </Link>

        <Link to="/student/assignments">
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl border border-gray-600 transition shadow-sm">
            View All Assignments
          </button>
        </Link>
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center shadow-lg">
      <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">{title}</p>
      <p className={`mt-3 text-3xl font-extrabold px-4 py-2 rounded-xl inline-block ${color}`}>
        {value}
      </p>
    </div>
  );
}
