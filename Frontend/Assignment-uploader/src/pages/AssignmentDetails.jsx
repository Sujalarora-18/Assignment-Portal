import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../Api/api";

export default function AssignmentDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [history, setHistory] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [reviewerId, setReviewerId] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchDetails();
    fetchProfessors();
    // eslint-disable-next-line
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await api.request(`/api/student/assignments/${id}`);
      setAssignment(res.assignment);

      const hist = await api.request(`/api/student/assignments/${id}/history`);
      setHistory(hist.history || []);
    } catch (err) {
      console.error(err);
      setMsg("Failed to load assignment");
      setMsgType("error");
    }
  };

  const fetchProfessors = async () => {
    try {
      const res = await api.request("/api/student/professors");
      setProfessors(res.professors || []);
    } catch (err) {
      console.error("Failed to load professors:", err);
    }
  };

  const submitForReview = async () => {
    if (!reviewerId) {
      setMsg("Please select a professor");
      setMsgType("error");
      return;
    }

    try {
      setLoading(true);
      await api.request(`/api/student/assignments/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ reviewerId }),
      });

      setMsg("Assignment submitted for review successfully!");
      setMsgType("success");
      setShowConfirmModal(false);
      fetchDetails();
    } catch (err) {
      setMsg(err?.message || "Submit failed");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    let displayStatus = status?.toUpperCase();
    if (status === "forwarded") displayStatus = "APPROVED, WAITING FOR HOD";
    if (status === "approved") displayStatus = "ASSIGNMENT SUBMITTED";

    const styles = {
      draft: "bg-gray-600",
      submitted: "bg-amber-500",
      forwarded: "bg-violet-600",
      approved: "bg-emerald-600",
      rejected: "bg-red-600",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
          styles[status] || "bg-gray-600"
        }`}
      >
        {displayStatus}
      </span>
    );
  };

  const getActionColor = (action) => {
    switch (action) {
      case "approved":
        return "text-emerald-300 bg-emerald-900/30 border-emerald-700";
      case "rejected":
        return "text-red-300 bg-red-900/30 border-red-700";
      case "resubmitted":
        return "text-indigo-300 bg-indigo-900/30 border-indigo-700";
      default:
        return "text-gray-300 bg-gray-800 border-gray-700";
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

  const pdfUrl = assignment?.filePath?.startsWith("http")
    ? assignment.filePath
    : `${import.meta.env.VITE_API_URL}${assignment?.filePath}`;

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-lg font-bold text-gray-100">Loading assignment...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-100">Assignment Details</h2>
          <div className="flex gap-3">
            <Link
              to="/student/assignments"
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-bold border border-gray-600 shadow-sm"
            >
              My Assignments
            </Link>
            <Link
              to="/student/dashboard"
              className="btn-primary px-4 py-2.5 text-sm"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 p-4 rounded-xl border-2 font-bold ${getMessageStyles()}`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-100">
                  {assignment.title}
                </h3>
                {getStatusBadge(assignment.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium text-gray-200">{assignment.category}</p>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="font-medium text-gray-200">
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {assignment.currentReviewer && (
                  <div className="col-span-2">
                    <span className="text-gray-500">Current Reviewer:</span>
                    <p className="font-medium text-gray-200">
                      {assignment.currentReviewer.name} ({assignment.currentReviewer.email})
                    </p>
                  </div>
                )}
              </div>

              {assignment.description && (
                <div className="mb-4">
                  <span className="text-gray-500 text-sm">Description:</span>
                  <p className="text-gray-300 mt-1">{assignment.description}</p>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium"
                >
                  View / Download PDF
                </a>
                {assignment.fileOriginalName && (
                  <span className="text-sm text-gray-500">
                    {assignment.fileOriginalName}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-gray-900">
                <h4 className="font-extrabold text-gray-200">Document Preview</h4>
              </div>
              <div className="h-[500px]">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Assignment PDF"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {assignment.status === "draft" && (
              <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
                <h4 className="font-semibold text-gray-200 mb-4">
                  Submit for Review
                </h4>
                <p className="text-sm text-gray-400 mb-4">
                  Select a professor to review your assignment. Once submitted, you cannot edit it.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Professor *
                  </label>
                  <select
                    value={reviewerId}
                    onChange={(e) => setReviewerId(e.target.value)}
                    className="input-strong"
                  >
                    <option value="">-- Choose Professor --</option>
                    {professors.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.departmentId?.name ? `(${p.departmentId.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={!reviewerId}
                  className="btn-primary w-full py-3 disabled:opacity-70"
                >
                  Submit for Review
                </button>
              </div>
            )}

            {assignment.status === "rejected" && (
              <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
                <h4 className="font-semibold text-gray-200 mb-4">
                  Assignment Rejected
                </h4>
                <p className="text-sm text-gray-400 mb-4">
                  Your assignment was rejected. You can resubmit with corrections.
                </p>
                
                {history.filter(h => h.action === "rejected").length > 0 && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-sm font-medium text-red-300">Last rejection reason:</p>
                    <p className="text-sm text-red-400 mt-1">
                      {history.filter(h => h.action === "rejected").pop()?.remark || "No remark provided"}
                    </p>
                  </div>
                )}

                <Link
                  to={`/student/assignments/${id}/resubmit`}
                  className="block w-full px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium text-center"
                >
                  Resubmit Assignment
                </Link>
              </div>
            )}

            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
              <h4 className="font-semibold text-gray-200 mb-4">
                Approval History
              </h4>
              
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm">No history yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border ${getActionColor(h.action)}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">
                          {h.action.toUpperCase()}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(h.date).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-sm mt-1 opacity-90">
                        By: {h.reviewerId?.name || "System"}
                      </p>
                      
                      {h.remark && (
                        <p className="text-sm mt-2 pt-2 border-t border-current/20">
                          <strong>Remark:</strong> {h.remark}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-100 mb-4">
              Confirm Submission
            </h3>
            
            <p className="text-gray-400 mb-4">
              Are you sure you want to submit this assignment for review?
            </p>
            
            <div className="p-3 bg-amber-900/30 border border-amber-700 rounded-lg mb-4">
              <p className="text-sm text-amber-300">
                <strong>Note:</strong> Once submitted, you will not be able to edit this assignment unless it is rejected.
              </p>
            </div>

            <div className="text-sm text-gray-400 mb-4">
              <p><strong className="text-gray-300">Professor:</strong> {professors.find(p => p._id === reviewerId)?.name}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={submitForReview}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
