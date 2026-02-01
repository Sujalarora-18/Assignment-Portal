const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const professorRoutes = require("./Routes/professor");


require("dotenv").config({ path: path.join(__dirname, "my.env") });

console.log(`[dotenv] loaded .env from: ${path.join(__dirname, ".env")}`);
console.log("[dotenv] JWT_SECRET present?:", !!process.env.JWT_SECRET);

const adminDepartments = require('./Routes/adminDepartments');
const adminUsersRoutes = require("./Routes/adminUsers");
const studentRoutes = require("./Routes/student");

const User = require("./models/User");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/Uploads", express.static("Uploads"));
app.use("/api/professor", professorRoutes);



const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ FATAL ERROR: JWT_SECRET missing in .env");
  process.exit(1);
}

app.use('/api', adminDepartments);
app.use("/admin", adminUsersRoutes);
app.use("/api/student", studentRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

function isAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden - admins only" });
  next();
}

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/loginDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err.message));

app.get("/api/admin/overview", verifyToken, isAdmin, async (req, res) => {
  try {
    const Department = require("./models/Department");

    const totalDepartments = await Department.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalProfessors = await User.countDocuments({ role: "professor" });
    const totalHODs = await User.countDocuments({ role: "hod" });
    const totalUsers = await User.countDocuments();

    return res.json({
      totalDepartments,
      totalUsers,
      totalStudents,
      totalProfessors,
      totalHODs,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "student",
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user);

    return res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

const distPath = path.join(__dirname, "../Frontend/Assignment-uploader/dist");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  console.warn("⚠ Frontend build not found:", distPath);

  app.get("/", (req, res) => {
    res.send("Backend running. Frontend build not found.");
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
