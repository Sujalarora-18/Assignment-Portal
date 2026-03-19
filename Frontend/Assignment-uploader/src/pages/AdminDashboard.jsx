import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState({ users: false, departments: false, mobile: false });
  const navigate = useNavigate();

  const userFromStorage = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const adminName = userFromStorage?.name || "Admin";

  useEffect(() => {
    const user = userFromStorage;
    const token = localStorage.getItem("token");
    if (!user || !token || user.role !== "admin") {
      navigate("/");
      return;
    }

    (async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-lg font-bold">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <aside className="hidden md:flex md:flex-col w-72 bg-white border border-gray-200 p-4 sticky top-4 m-4 rounded-2xl h-[calc(100vh-2rem)] shadow-xl">
        <div className="mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-lg font-extrabold shadow-lg border-2 border-blue-500/50">
              AD
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Admin</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">Assignment Uploader</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 text-sm font-semibold">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
          >
            <span className="w-6 text-center">🏠</span>
            <span className="text-gray-800">Overview</span>
          </Link>

          <div>
            <button
              onClick={() => setNavOpen((s) => ({ ...s, departments: !s.departments }))}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center">🏛️</span>
                <span className="text-gray-800">Departments</span>
              </div>
              <span className="text-gray-500 font-bold">{navOpen.departments ? "▲" : "▼"}</span>
            </button>

            {navOpen.departments && (
              <div className="ml-8 mt-2 space-y-1">
                <Link to="/admin/departments" className="block text-sm text-gray-600 hover:text-gray-900 font-medium">
                  All Departments
                </Link>
                <Link to="/admin/departments/new" className="block text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Create Department
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setNavOpen((s) => ({ ...s, users: !s.users }))}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center">👥</span>
                <span className="text-gray-800">Users</span>
              </div>
              <span className="text-gray-500 font-bold">{navOpen.users ? "▲" : "▼"}</span>
            </button>

            {navOpen.users && (
              <div className="ml-8 mt-2 space-y-1">
                <Link to="/admin/users" className="block text-sm text-gray-600 hover:text-gray-900 font-medium">
                  All Users
                </Link>
                <Link to="/admin/users/new" className="block text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Create User
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="mt-4 border-t border-gray-200 pt-4 px-3">
          <div className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Signed in as</div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-gray-900">{adminName}</div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-bold text-sm border-2 border-red-500/50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setNavOpen((s) => ({ ...s, mobile: !s.mobile }))}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 font-bold shadow-lg"
          aria-label="Toggle menu"
        >
          {navOpen.mobile ? "✕" : "☰"}
        </button>
      </div>

      {navOpen.mobile && (
        <div className="md:hidden fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setNavOpen((s) => ({ ...s, mobile: false }))}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 shadow-2xl p-4">
            <div className="mb-6 px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-900 font-bold">AD</div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Admin</h2>
                  <p className="text-xs text-gray-500 mt-1">Assignment Uploader</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2 text-sm font-semibold">
              <Link
                onClick={() => setNavOpen((s) => ({ ...s, mobile: false }))}
                to="/admin/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-gray-800"
              >
                🏠 Overview
              </Link>
              <Link
                onClick={() => setNavOpen((s) => ({ ...s, mobile: false }))}
                to="/admin/departments"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-gray-800"
              >
                🏛️ Departments
              </Link>
              <Link
                onClick={() => setNavOpen((s) => ({ ...s, mobile: false }))}
                to="/admin/users"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 text-gray-800"
              >
                👥 Users
              </Link>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="mb-2 text-xs font-bold text-gray-500 uppercase">Signed in as</div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-gray-900">{adminName}</div>
                  <button
                    onClick={() => {
                      setNavOpen((s) => ({ ...s, mobile: false }));
                      handleLogout();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-bold border-2 border-red-500/50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </nav>
          </aside>
        </div>
      )}

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Overview</h1>
              <p className="text-sm font-semibold text-gray-500">Welcome, Admin</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-500">
                Signed in as <span className="font-bold text-gray-900">{adminName}</span>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <StatCard title="Total Departments" value={data?.totalDepartments ?? 0} />
            <StatCard title="Total Users" value={data?.totalUsers ?? 0} />
            <StatCard title="Students" value={data?.totalStudents ?? 0} />
            <StatCard title="Professors" value={data?.totalProfessors ?? 0} />
            <StatCard title="HODs" value={data?.totalHODs ?? 0} />

            <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-center shadow-lg">
              <Link to="/admin/departments" className="px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white font-bold rounded-xl shadow border border-gray-900 transition">
                Manage Departments
              </Link>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-gray-900">Quick Actions</h2>
              <div className="text-sm font-semibold text-gray-500">Create or manage entities</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionCard to="/admin/departments/new" title="New Department" description="Add a new academic department." emoji="🏛️" />
              <ActionCard to="/admin/users/new" title="Create User" description="Add staff or students." emoji="➕" />
              <ActionCard to="/admin/users" title="View All Users" description="Manage users and roles." emoji="👥" />
              <ActionCard to="/admin/departments" title="View Departments" description="See all departments." emoji="📚" />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
              <h3 className="text-lg font-extrabold mb-3 text-gray-900">Recent Activity</h3>
              <p className="text-sm font-medium text-gray-500">No activity to show yet.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
              <h3 className="text-lg font-extrabold mb-3 text-gray-900">Shortcuts</h3>
              <div className="flex flex-wrap gap-2">
                <Link to="/admin/departments/new" className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-900 border border-gray-200 transition">New Dept</Link>
                <Link to="/admin/users/new" className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-900 border border-gray-200 transition">New User</Link>
                <Link to="/admin/users" className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-900 border border-gray-200 transition">Users</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-600">{title}</p>
        <div className="w-3 h-3 rounded-full bg-blue-500" />
      </div>

      <p className="mt-4 text-3xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

function ActionCard({ to, title, description, emoji }) {
  return (
    <Link to={to} className="block p-5 border rounded-2xl hover:border-blue-500 hover:shadow-lg transition border-gray-200 bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{emoji}</div>
        <div>
          <p className="font-extrabold text-gray-900">{title}</p>
          <p className="text-xs font-medium text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
}
