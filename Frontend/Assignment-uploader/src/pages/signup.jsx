// import { Link } from "react-router-dom";

// export default function Signup() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
//         <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
//           Sign Up
//         </h1>

//         <form method="POST" className="flex flex-col gap-4">
//           <input
//             type="text"
//             placeholder="Name"
//             className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
//           />
//           <input
//             type="email"
//             placeholder="Email"
//             className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
//           />
//           <button
//             type="submit"
//             className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition duration-200"
//           >
//             Sign Up
//           </button>
//         </form>

//         <p className="text-center text-gray-600 mt-6">
//           Already have an account?{" "}
//           <Link
//             to="/"
//             className="text-green-600 font-medium hover:underline hover:text-green-800 transition"
//           >
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/signup", form);
      alert(res.data.message);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border-2 border-slate-200">
        <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2">
          Sign Up
        </h1>
        <p className="text-center text-slate-600 font-medium mb-6">Create your account to get started</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            type="text"
            placeholder="Full Name"
            className="input-strong"
            required
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="Email address"
            className="input-strong"
            required
          />

          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            className="input-strong"
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="input-strong"
          >
            <option value="student">Student</option>
            <option value="professor">Professor</option>
            <option value="hod">HOD</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-slate-600 font-semibold mt-6">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-bold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
