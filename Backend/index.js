const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

/* =======================
   IMPORT ROUTES & MODELS
======================= */

const adminDepartments = require("./Routes/adminDepartments");
const adminUsersRoutes = require("./Routes/adminUsers");
const studentRoutes = require("./Routes/student");
const hodRoutes = require("./Routes/hod");
const User = require("./models/User");

/* =======================
   APP INIT
======================= */

const app = express();

/* =======================
   CORS (ALLOW ALL – SAFE HERE)
======================= */

app.use(cors());
app.options("*", cors());

app.use(express.json());

/* =======================
   STATIC FILES (uploads only)
======================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =======================
   API ROUTES
======================= */

app.use("/api/admin/departments", adminDepartments);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/hod", hodRoutes);

/* =======================
   HEALTH CHECK
======================= */

app.get("/api", (req, res) => {
  res.json({ message: "API running 🚀" });
});

/* =======================
   JWT HELPERS
======================= */

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET missing");
  process.exit(1);
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* =======================
   DATABASE
======================= */

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("MongoDB error:", err.message);
    process.exit(1);
  });

/* =======================
   AUTH ROUTES (ALL UNDER /api)
======================= */

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "student",
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   PASSWORD RESET
======================= */

const resetTokenStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const token = crypto.randomBytes(32).toString("hex");
      resetTokenStore.set(token, {
        userId: user._id,
        expires: Date.now() + 15 * 60 * 1000,
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      await transporter.sendMail({
        to: user.email,
        subject: "Password Reset",
        html: `<a href="${resetUrl}">Reset Password</a>`,
      });
    }

    res.json({
      message: "If email exists, reset instructions were sent",
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    const data = resetTokenStore.get(token);

    if (!data || Date.now() > data.expires) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(data.userId);
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    resetTokenStore.delete(token);

    res.json({ message: "Password reset successful" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   START SERVER
======================= */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
