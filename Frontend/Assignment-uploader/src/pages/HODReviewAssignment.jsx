import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../Api/api";

export default function HODReviewAssignment() {
  const { id } = useParams();
  const nav = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [remark, setRemark] = useState("");
  const [signature, setSignature] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const res = await api.request(`/api/hod/assignments/${id}/review`);
      setAssignment(res.assignment);
    } catch (err) {
      setMsg("Failed to load assignment");
      setMsgType("error");
    }
  };

  const approve = async () => {
    if (!signature.trim()) {
      setMsg("Digital signature is required");
      setMsgType("error");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      await api.request(`/api/hod/assignments/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ remark, signature }),
      });

      setMsg("Assignment finally approved!");
      setMsgType("success");
      setTimeout(() => nav("/hod/dashboard"), 1000);
    } catch (err) {
      setMsg(err?.message || "Approval failed");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  const reject = async () => {
    const trimmed = rejectRemark.trim();
    if (!trimmed) {
      setMsg("Rejection feedback is required");
      setMsgType("error");
      return;
    }
    if (trimmed.length < 10) {
      setMsg("Feedback must be at least 10 characters");
      setMsgType("error");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      await api.request(`/api/hod/assignments/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ remark: trimmed }),
      });

      setMsg("Assignment rejected");
      setMsgType("success");
      setShowRejectModal(false);
      setRejectRemark("");
      setTimeout(() => nav("/hod/dashboard"), 1000);
    } catch (err) {
      setMsg(err?.message || err?.data?.message || "Rejection failed");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  const getMessageStyles = () => {
    switch (msgType) {
      case "success":
        return "bg-emerald-900/50 border-emerald-500 text-emerald-300";
      case "error":
        return "bg-red-900/50 border-red-500 text-red-300";
      default:
        return "bg-indigo-900/50 border-indigo-500 text-indigo-300";
    }
  };

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-lg font-bold text-gray-100">Loading assignment...</div>
      </div>
    );
  }

  const pdfUrl = assignment.filePath?.startsWith("http")
    ? assignment.filePath
    : `${import.meta.env.VITE_API_URL}${assignment.filePath}`;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-100">Finalize Assignment</h2>
          <Link
            to="/hod/dashboard"
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold border border-gray-600"
          >
            Back to Dashboard
          </Link>
        </div>

        {msg && (
          <div className={`mb-4 p-4 rounded-xl border-2 font-bold ${getMessageStyles()}`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-900">
              <h3 className="font-extrabold text-gray-200">Document Preview</h3>
            </div>
            <div className="h-[600px]">
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="Assignment PDF"
              />
            </div>
            <div className="p-3 bg-gray-900 border-t border-gray-700">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline text-sm font-medium"
              >
                Open in new tab / Download
              </a>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-100 mb-3">
                {assignment.title}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Student:</span>
                  <p className="font-medium text-gray-200">{assignment.student?.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium text-gray-200">{assignment.student?.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium text-gray-200">{assignment.category}</p>
                </div>
                <div>
                  <span className="text-gray-500">Submitted:</span>
                  <p className="font-medium text-gray-200">
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {assignment.description && (
                <div className="mt-4">
                  <span className="text-gray-500 text-sm">Description:</span>
                  <p className="text-gray-300 mt-1">{assignment.description}</p>
                </div>
              )}

              {assignment.plagiarismScore !== undefined && (
                <div className="mt-6 p-4 rounded-xl border flex flex-col gap-2 bg-gray-900 shadow-sm border-gray-700">
                  <h4 className="font-bold text-gray-200 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Plagiarism Report
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <div className={`text-2xl font-extrabold ${assignment.plagiarismScore > 30 ? 'text-red-400' : assignment.plagiarismScore > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {assignment.plagiarismScore}% Match
                    </div>
                    {assignment.plagiarismMatch && assignment.plagiarismScore > 0 && (
                      <div className="text-sm text-gray-400 border-l-2 border-gray-700 pl-4">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Highest Similarity With</p>
                        <p className="font-extrabold text-gray-200 truncate max-w-[200px]">{assignment.plagiarismMatch.title}</p>
                        <p className="font-medium text-gray-400">by {assignment.plagiarismMatch.student?.name || "Unknown Student"}</p>
                      </div>
                    )}
                    {assignment.plagiarismScore === 0 && (
                      <div className="text-sm text-gray-400 border-l-2 border-gray-700 pl-4">
                        <p className="font-bold text-emerald-400">No matching assignments found in the database.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {assignment.history && assignment.history.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-2">History</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {assignment.history.map((h, i) => (
                    <div
                      key={i}
                      className="p-2 bg-gray-900 rounded-lg text-sm border border-gray-700"
                    >
                      <span
                        className={`font-medium ${
                          h.action === "approved"
                            ? "text-emerald-400"
                            : h.action === "rejected"
                            ? "text-red-400"
                            : h.action === "forwarded"
                            ? "text-violet-400"
                            : "text-indigo-400"
                        }`}
                      >
                        {h.action.toUpperCase()}
                      </span>
                      <span className="text-gray-300 font-bold ml-2">
                        by {h.reviewerId?.name || "System"}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {new Date(h.date).toLocaleString()}
                      </span>
                      {h.remark && (
                        <p className="text-gray-400 mt-1">Remark: {h.remark}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="my-4 border-gray-700" />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add your approval remarks..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="input-strong resize-none disabled:opacity-70"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Digital Signature *
                </label>
                <input
                  type="text"
                  placeholder="Enter your name as signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="input-strong disabled:opacity-70"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={approve}
                  disabled={loading || !signature.trim()}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Final Approve"}
                </button>

                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-100 mb-4">
              Reject Assignment
            </h3>

            <p className="text-sm text-gray-400 mb-4">
              Please provide feedback for the student (minimum 10 characters).
            </p>

            <textarea
              rows={4}
              placeholder="Enter rejection feedback (min 10 characters)..."
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              className="input-strong resize-none mb-2"
              autoFocus
            />
            <p className="text-xs text-gray-500 mb-4">
              {rejectRemark.length}/10 characters minimum
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectRemark("");
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={reject}
                disabled={loading || !rejectRemark.trim() || rejectRemark.trim().length < 10}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold disabled:opacity-50"
              >
                {loading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
