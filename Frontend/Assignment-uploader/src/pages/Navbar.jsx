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
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
      }}
    >
      {/* LOGO */}
      <Link to={getDashboardPath()} style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="40" height="40" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            {/* Blue rounded square background */}
            <rect x="10" y="10" width="100" height="100" rx="18" fill="#2563eb" />
            
            {/* White arrow icon */}
            <g transform="translate(35, 35)">
              {/* Arrow shaft */}
              <line x1="10" y1="25" x2="40" y2="25" stroke="white" strokeWidth="4" strokeLinecap="round" />
              {/* Arrow head */}
              <polyline points="40,25 35,20 40,25 35,30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </svg>

          <span
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            Campus<span style={{ color: "#2563EB" }}>Flow</span>
          </span>
        </div>
      </Link>
    </header>
  );
};

export default Navbar;
