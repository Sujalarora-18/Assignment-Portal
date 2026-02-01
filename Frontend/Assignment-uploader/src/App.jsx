import "./App.css";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Home from "./pages/home";
import CreateDepartment from "./pages/CreateDepartment";
import DepartmentList from "./pages/DepartmentsList";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDepartments from "./pages/AdminDepartments";
import EditDepartment from './pages/EditDepartment';
import CreateUser from "./pages/CreateUser";
import UsersList from "./pages/UsersList";
import EditUser from "./pages/EditUser";
import StudentDashboard from "./pages/StudentDashboard";
import UploadAssignment from "./pages/UploadAssignment";
import BulkUpload from "./pages/BulkUpload";
import MyAssignments from "./pages/MyAssignments";

import PrivateRoute from "./components/PrivateRoute";

import AssignmentDetails from "./pages/AssignmentDetails";
import ResubmitAssignment from "./pages/ResubmitAssignment";


import ProfessorDashboard from "./pages/ProfessorDashboard";
import ReviewAssignment from "./pages/ReviewAssignment";


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />    
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/departments" element={<DepartmentList />} />
        <Route path="/admin/departments/new" element={<CreateDepartment />} />
        <Route path="/admin/manage-departments" element={<AdminDepartments />} />
        <Route path="/admin/departments/:id/edit" element={<EditDepartment />} />
        <Route path="/admin/users/new" element={<CreateUser />} />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/users/:id/edit" element={<EditUser />} />
        <Route path="/student/dashboard" element={<PrivateRoute requiredRole="student"><StudentDashboard/></PrivateRoute>} />
        <Route path="/student/upload" element={<PrivateRoute requiredRole="student"><UploadAssignment/></PrivateRoute>} />
        <Route path="/student/bulk-upload" element={<PrivateRoute requiredRole="student"><BulkUpload/></PrivateRoute>} />
        <Route path="/student/assignments" element={<PrivateRoute requiredRole="student"><MyAssignments/></PrivateRoute>} />
        <Route
  path="/student/assignments/:id"
  element={
    <PrivateRoute requiredRole="student">
      <AssignmentDetails />
    </PrivateRoute>
  }
/>

<Route
  path="/student/assignments/:id/resubmit"
  element={
    <PrivateRoute requiredRole="student">
      <ResubmitAssignment />
    </PrivateRoute>
  }
/>

<Route
  path="/professor/dashboard"
  element={
    <PrivateRoute requiredRole="professor">
      <ProfessorDashboard />
    </PrivateRoute>
  }
/>

<Route
  path="/professor/review/:id"
  element={
    <PrivateRoute requiredRole="professor">
      <ReviewAssignment />
    </PrivateRoute>
  }
/>

      </Routes>
    </Router>
    </>

  )
}

export default App;
