import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../Api/api";

export default function ReviewAssignment() {
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
      const res = await api.request(`/api/professor/assignments/${id}/review`);
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
      await api.request(`/api/professor/assignments/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          remark,
          signature,
          skipOtp: true,
        }),
      });
      setMsg("Assignment approved successfully!");
      setMsgType("success");
      setTimeout(() => nav("/professor/dashboard"), 1000);
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
      await api.request(`/api/professor/assignments/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ remark: trimmed }),
      });
      setMsg("Assignment rejected");
      setMsgType("success");
      setShowRejectModal(false);
      setRejectRemark("");
      setTimeout(() => nav("/professor/dashboard"), 1000);
    } catch (err) {
      setMsg(err?.message || err?.data?.message || "Rejection failed");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  const msgStyles = {
    success: { bg: "#064e3b", border: "#10b981", color: "#6ee7b7" },
    error:   { bg: "#7f1d1d", border: "#f87171", color: "#fca5a5" },
    info:    { bg: "#1e3a5f", border: "#60a5fa", color: "#93c5fd" },
  };

  if (!assignment) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div className="ra-spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
          <p style={{ color: "#94a3b8", fontWeight: 600 }}>Loading assignment...</p>
        </div>
      </div>
    );
  }

  const pdfUrl = assignment.filePath?.startsWith("http")
    ? assignment.filePath
    : `${import.meta.env.VITE_API_URL}${assignment.filePath}`;

  const currentStyles = msgStyles[msgType] || msgStyles.info;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }

        .ra-page { min-height: 100vh; background: #0f172a; padding: 24px; }
        .ra-container { max-width: 1280px; margin: 0 auto; }

        .ra-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .ra-title { font-size: 26px; font-weight: 800; color: #f1f5f9; margin: 0; }

        .back-btn { 
          padding: 10px 20px; background: #1e293b; border: 1.5px solid #334155; 
          border-radius: 12px; color: #cbd5e1; font-weight: 600; font-size: 14px;
          text-decoration: none; transition: all 0.2s; cursor: pointer;
        }
        .back-btn:hover { background: #334155; border-color: #818cf8; color: #818cf8; }

        .ra-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 900px) { .ra-grid { grid-template-columns: 1fr; } }

        .ra-card { background: #1e293b; border-radius: 20px; border: 1.5px solid #334155; box-shadow: 0 4px 24px rgba(0,0,0,0.3); overflow: hidden; }

        .card-header { padding: 16px 20px; border-bottom: 1.5px solid #334155; background: #0f172a; display: flex; align-items: center; justify-content: space-between; }
        .card-header h3 { margin: 0; font-size: 15px; font-weight: 700; color: #e2e8f0; }
        .card-body { padding: 24px; }

        /* PDF panel */
        .pdf-frame { width: 100%; height: 550px; border: none; }
        .pdf-footer { padding: 12px 16px; background: #0f172a; border-top: 1.5px solid #334155; }
        .pdf-link { color: #818cf8; text-decoration: none; font-size: 13px; font-weight: 600; }
        .pdf-link:hover { text-decoration: underline; }

        /* Assignment info */
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .info-item label { display: block; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .info-item p { margin: 0; font-size: 14px; font-weight: 600; color: #e2e8f0; }

        /* Plagiarism badge */
        .plag-card { margin-top: 16px; padding: 16px; border-radius: 14px; border: 1.5px solid #334155; background: #0f172a; }
        .plag-title { font-size: 13px; font-weight: 700; color: #cbd5e1; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .plag-score-high { font-size: 28px; font-weight: 800; color: #f87171; }
        .plag-score-mid  { font-size: 28px; font-weight: 800; color: #fbbf24; }
        .plag-score-low  { font-size: 28px; font-weight: 800; color: #4ade80; }

        /* History */
        .history-wrap { max-height: 150px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .history-item { padding: 10px 14px; background: #0f172a; border-radius: 10px; border: 1.5px solid #334155; font-size: 13px; color: #cbd5e1; }
        .h-approved { color: #4ade80; font-weight: 700; }
        .h-rejected  { color: #f87171; font-weight: 700; }
        .h-forwarded { color: #a78bfa; font-weight: 700; }
        .h-submitted { color: #60a5fa; font-weight: 700; }
        .h-date { color: #64748b; margin-left: 8px; }

        /* Divider */
        .divider { border: none; border-top: 1.5px solid #334155; margin: 20px 0; }

        /* Form */
        .form-label { display: block; font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; }
        .form-textarea { 
          width: 100%; padding: 12px 16px; border: 1.5px solid #334155; border-radius: 12px; 
          font-size: 14px; font-family: 'Inter', sans-serif; resize: vertical;
          transition: border-color 0.2s; background: #0f172a; color: #e2e8f0;
        }
        .form-textarea:focus { outline: none; border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,0.2); }
        .form-input { 
          width: 100%; padding: 10px 16px; border: 1.5px solid #334155; border-radius: 12px; 
          font-size: 14px; font-family: 'Inter', sans-serif;
          transition: border-color 0.2s; background: #0f172a; color: #e2e8f0;
        }
        .form-input:focus { outline: none; border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,0.2); }

        /* Buttons */
        .btn { padding: 12px 20px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-approve { background: linear-gradient(135deg, #16a34a, #15803d); color: white; flex: 1; }
        .btn-approve:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,0.35); }
        .btn-reject  { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; flex: 1; }
        .btn-reject:hover:not(:disabled)  { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(220,38,38,0.35); }
        .btn-cancel  { background: #334155; color: #cbd5e1; flex: 1; }
        .btn-cancel:hover  { background: #475569; }
        .btn-confirm-reject { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; flex: 1; }
        .btn-confirm-reject:hover:not(:disabled) { transform: translateY(-1px); }

        /* Spinner */
        .ra-spinner { 
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid #334155;
          border-top-color: #818cf8;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; }
        .modal-box { background: #1e293b; border-radius: 20px; padding: 28px; width: 100%; max-width: 480px; box-shadow: 0 25px 60px rgba(0,0,0,0.5); border: 1.5px solid #334155; }
        .modal-title { font-size: 20px; font-weight: 800; color: #f1f5f9; margin: 0 0 8px; }
        .modal-sub { font-size: 13px; color: #94a3b8; margin: 0 0 16px; }
        .char-hint { font-size: 12px; color: #64748b; margin-bottom: 16px; }
        .modal-actions { display: flex; gap: 10px; }

        /* Alert messages */
        .alert-msg { margin-bottom: 16px; padding: 14px 18px; border-radius: 14px; font-weight: 600; font-size: 14px; border: 1.5px solid; }

        .section-title { font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }

        .form-group { margin-bottom: 16px; }
        .action-row { display: flex; gap: 12px; padding-top: 8px; }
      `}</style>

      <div className="ra-page">
        <div className="ra-container">

          {/* Header */}
          <div className="ra-header">
            <h1 className="ra-title">📋 Review Assignment</h1>
            <Link to="/professor/dashboard" className="back-btn">← Back to Dashboard</Link>
          </div>

          {/* Alert */}
          {msg && (
            <div className="alert-msg" style={{ background: currentStyles.bg, borderColor: currentStyles.border, color: currentStyles.color }}>
              {msgType === "success" ? "✅ " : msgType === "error" ? "⚠️ " : "ℹ️ "}{msg}
            </div>
          )}

          <div className="ra-grid">
            {/* LEFT: PDF */}
            <div className="ra-card">
              <div className="card-header">
                <h3>📄 Document Preview</h3>
              </div>
              <iframe src={pdfUrl} className="pdf-frame" title="Assignment PDF" />
              <div className="pdf-footer">
                <a href={pdfUrl} target="_blank" rel="noreferrer" className="pdf-link">↗ Open in new tab / Download</a>
              </div>
            </div>

            {/* RIGHT: Review panel */}
            <div className="ra-card">
              <div className="card-header">
                <h3>🔍 Assignment Details</h3>
              </div>
              <div className="card-body">

                {/* Assignment info */}
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", margin: "0 0 14px" }}>{assignment.title}</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Student</label>
                    <p>{assignment.student?.name}</p>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <p style={{ fontSize: 12 }}>{assignment.student?.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Category</label>
                    <p>{assignment.category}</p>
                  </div>
                  <div className="info-item">
                    <label>Submitted</label>
                    <p>{new Date(assignment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {assignment.description && (
                  <div style={{ marginTop: 12 }}>
                    <label className="form-label" style={{ color: "#64748b" }}>Description</label>
                    <p style={{ fontSize: 14, color: "#cbd5e1", margin: 0 }}>{assignment.description}</p>
                  </div>
                )}

                {/* Plagiarism */}
                {assignment.plagiarismScore !== undefined && (
                  <div className="plag-card">
                    <div className="plag-title">🔬 Plagiarism Report</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div className={assignment.plagiarismScore > 30 ? "plag-score-high" : assignment.plagiarismScore > 15 ? "plag-score-mid" : "plag-score-low"}>
                        {assignment.plagiarismScore}%
                      </div>
                      {assignment.plagiarismMatch && assignment.plagiarismScore > 0 && (
                        <div style={{ fontSize: 13, color: "#94a3b8", borderLeft: "2px solid #334155", paddingLeft: 14 }}>
                          <p style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px" }}>Highest match with</p>
                          <p style={{ fontWeight: 700, margin: "0 0 2px", color: "#e2e8f0" }}>{assignment.plagiarismMatch.title}</p>
                          <p style={{ margin: 0, fontSize: 12 }}>by {assignment.plagiarismMatch.student?.name || "Unknown"}</p>
                        </div>
                      )}
                      {assignment.plagiarismScore === 0 && (
                        <p style={{ fontSize: 13, color: "#4ade80", fontWeight: 600, margin: 0 }}>✅ No matching assignments found</p>
                      )}
                    </div>
                  </div>
                )}

                {/* History */}
                {assignment.history?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div className="section-title">History</div>
                    <div className="history-wrap">
                      {assignment.history.map((h, i) => (
                        <div key={i} className="history-item">
                          <span className={`h-${h.action}`}>{h.action.toUpperCase()}</span>
                          <span className="h-date">{new Date(h.date).toLocaleString()}</span>
                          {h.remark && <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 12 }}>{h.remark}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="divider" />

                {/* APPROVAL REMARK */}
                <div className="form-group">
                  <label className="form-label" htmlFor="approval-remark-area">
                    Remarks (Optional)
                  </label>
                  <textarea
                    id="approval-remark-area"
                    rows={3}
                    placeholder="Add your review remarks..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="form-textarea"
                    disabled={loading}
                  />
                </div>

                {/* SIGNATURE */}
                <div className="form-group">
                  <label className="form-label">Digital Signature *</label>
                  <input
                    type="text"
                    placeholder="Enter your name as signature"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                {/* ACTION BUTTONS */}
                <div className="action-row">
                  <button
                    onClick={approve}
                    disabled={loading || !signature.trim()}
                    className="btn btn-approve"
                  >
                    {loading ? "Processing..." : "✅ Approve"}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={loading}
                    className="btn btn-reject"
                  >
                    ❌ Reject
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Reject Assignment</h3>
            <p className="modal-sub">
              Provide feedback for the student. This will be sent to them and shown in the resubmission form.
            </p>

            <textarea
              rows={5}
              placeholder="Enter rejection feedback (min 10 characters)..."
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              className="form-textarea"
              autoFocus
            />
            <p className="char-hint">{rejectRemark.length}/10 characters minimum</p>

            <div className="modal-actions">
              <button
                onClick={() => { setShowRejectModal(false); setRejectRemark(""); }}
                className="btn btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={reject}
                disabled={loading || !rejectRemark.trim() || rejectRemark.trim().length < 10}
                className="btn btn-confirm-reject"
              >
                {loading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
