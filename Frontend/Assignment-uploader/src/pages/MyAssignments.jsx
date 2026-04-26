import React, { useEffect, useState } from "react";
import api from "../Api/api";
import { Link, useNavigate } from "react-router-dom";

export default function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nav = useNavigate();

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line
  }, [status, sort]);

  async function fetchList() {
    try {
      setLoading(true);
      setError("");

      const q = new URLSearchParams();
      if (status) q.append("status", status);
      q.append("sort", sort);

      const res = await api.request(
        "/api/student/assignments?" + q.toString()
      );

      setAssignments(res.assignments || []);
    } catch (err) {
      console.error("Fetch assignments error", err);

      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        nav("/");
        return;
      }

      setError("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-100">My Assignments</h2>

        <Link to="/student/upload">
          <button className="btn-primary px-6 py-3 shadow-lg">
            Upload New
          </button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-6 bg-gray-800 p-5 rounded-2xl mb-6 border border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-gray-300 font-bold">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-strong py-2"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="forwarded">Forwarded</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-gray-300 font-bold">Sort:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-strong py-2"
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/50 border border-red-500 text-red-300 font-bold">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
        <table className="w-full table-strong">
          <thead>
            <tr className="text-left">
              <th className="py-4 px-6">Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Submitted Date</th>
              <th>Reviewer</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-gray-500 text-lg"
                >
                  Loading assignments...
                </td>
              </tr>
            )}

            {!loading && assignments.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-gray-500 text-lg"
                >
                  No assignments found.
                </td>
              </tr>
            )}

            {!loading &&
              assignments.map((a) => (
                <tr
                  key={a._id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                >
                  <td className="py-4 px-6 font-bold text-indigo-400 hover:underline">
                    <Link to={`/student/assignments/${a._id}`}>
                      {a.title}
                    </Link>
                  </td>

                  <td className="px-6 font-medium text-gray-300">{a.category}</td>

                  <td className="px-6">
                    <StatusBadge status={a.status} />
                  </td>

                  <td className="px-6 font-medium text-gray-400">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>

                  <td className="px-6 font-medium text-gray-400">
                    {a.currentReviewer?.name || "-"}
                  </td>

                  <td className="px-6">
                    {a.status === "draft" && (
                      <Link
                        to={`/student/assignments/${a._id}`}
                        className="text-indigo-400 hover:underline text-sm font-medium"
                      >
                        Submit
                      </Link>
                    )}

                    {a.status === "rejected" && (
                      <Link
                        to={`/student/assignments/${a._id}/resubmit`}
                        className="text-red-400 hover:underline text-sm font-medium"
                      >
                        Resubmit
                      </Link>
                    )}

                    {a.status !== "draft" && a.status !== "rejected" && (
                      <Link
                        to={`/student/assignments/${a._id}`}
                        className="text-gray-400 hover:underline text-sm font-medium"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  let displayStatus = status?.toUpperCase();
  if (status === "forwarded") displayStatus = "APPROVED, WAITING FOR HOD";
  if (status === "approved") displayStatus = "ASSIGNMENT SUBMITTED";

  const colors = {
    approved: "badge-approved",
    rejected: "badge-rejected",
    submitted: "badge-submitted",
    forwarded: "badge-forwarded",
    draft: "badge-draft",
  };

  return (
    <span className={colors[status] || "badge-draft"}>
      {displayStatus}
    </span>
  );
}
