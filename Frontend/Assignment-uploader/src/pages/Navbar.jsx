import { Link } from "react-router-dom";

const Navbar = () => {
  const getDashboardPath = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const role = String(user.role || "").toLowerCase();
      if (role === "admin") return "/admin/dashboard";
      if (role === "student") return "/student/dashboard";
      if (role === "professor") return "/professor/dashboard";
      if (role === "hod") return "/hod/dashboard";
    } catch (err) {
      console.error(err);
    }
    return "/"; // fallback if no valid role
  };

  return (
    <header
      style={{
        height: "63px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid #334155",
        backgroundColor: "#1e293b",
      }}
    >
      {/* LOGO */}
      <Link to={getDashboardPath()} style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="38" height="38" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            {/* Purple gradient rounded square background */}
            <defs>
              <linearGradient id="navbg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed"/>
                <stop offset="100%" stopColor="#6366f1"/>
              </linearGradient>
            </defs>
            <rect x="5" y="5" width="110" height="110" rx="22" fill="url(#navbg)" />
            
            {/* CF monogram */}
            <text x="60" y="78" fontSize="56" fontWeight="900" fontFamily="Arial, sans-serif" fill="white" textAnchor="middle" letterSpacing="-2">CF</text>
          </svg>

          <span
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#f1f5f9",
            }}
          >
            Campus<span style={{ color: "#a78bfa" }}>Flow</span>
          </span>
        </div>
      </Link>
    </header>
  );
};

export default Navbar;
