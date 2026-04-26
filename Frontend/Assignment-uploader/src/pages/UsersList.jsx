import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { listDepartments } from "../Api/departments";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const PAGE_LIMIT = 20;

  useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const data = await listDepartments({
        page: 1,
        limit: 1000,
        search: "",
        type: "All",
      });

      if (data && data.ok) {
        setDepartments(data.departments || []);
      } else {
        setMessage((data && data.message) || "Failed to load departments");
      }
    } catch (err) {
      console.error("Failed to load departments", err);
      setMessage(err?.message || "Failed to load departments");
    }
  };

  fetchDepartments();
}, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const params = {
          page,
          limit: PAGE_LIMIT,
        };
        if (roleFilter) params.role = roleFilter;
        if (departmentFilter) params.departmentId = departmentFilter;
        if (search.trim() !== "") params.search = search.trim();

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
          params,
        });

        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || "Failed to load users";
        setMessage(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, roleFilter, departmentFilter, search]);

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleResetFilters = () => {
    setRoleFilter("");
    setDepartmentFilter("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-100">All Users</h1>
          <button
            onClick={() => navigate("/admin/users/new")}
            className="btn-primary px-5 py-2.5 text-sm"
          >
            + Create User
          </button>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setPage(1);
                setRoleFilter(e.target.value);
              }}
              className="input-strong py-2"
            >
              <option value="">All Roles</option>
              <option value="Student">Student</option>
              <option value="Professor">Professor</option>
              <option value="HOD">HOD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Filter by Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setPage(1);
                setDepartmentFilter(e.target.value);
              }}
              className="input-strong py-2"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} ({dept.type})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">
              Search by Name or Email
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Type name or email..."
              className="input-strong py-2"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Link to="/admin/dashboard" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">← Back to Dashboard</Link>
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-gray-500 hover:text-gray-300"
          >
            Reset filters
          </button>
          {message && (
            <span className="text-sm font-bold text-red-400">{message}</span>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-700">
          {loading ? (
            <p className="p-6 font-bold text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="p-6 font-bold text-gray-500">No users found.</p>
          ) : (
            <table className="min-w-full text-sm table-strong">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const deptName = user.department?.name || "N/A";
                  return (
                    <tr key={user._id}>
                      <td className="font-semibold text-gray-100">{user.name}</td>
                      <td className="text-gray-300">{user.email}</td>
                      <td className="text-gray-300">{user.role}</td>
                      <td className="text-gray-300">{deptName}</td>
                      <td className="text-gray-300">{user.status}</td>
                      <td className="text-center">
                        <button
                          onClick={() => navigate(`/admin/users/${user._id}/edit`)}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-600 text-slate-900 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-xs px-3 py-1.5 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 font-bold text-gray-400">
          <span>Page {page} of {totalPages}</span>
          <div className="space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-4 py-2 rounded-xl border font-bold ${
                page <= 1 ? "opacity-50 cursor-not-allowed border-gray-700" : "border-gray-600 hover:bg-gray-700 text-gray-300"
              }`}
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`px-4 py-2 rounded-xl border font-bold ${
                page >= totalPages ? "opacity-50 cursor-not-allowed border-gray-700" : "border-gray-600 hover:bg-gray-700 text-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
