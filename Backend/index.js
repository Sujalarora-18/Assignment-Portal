const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const fs=require("fs");

require("dotenv").config(); 

/* =======================
   IMPORT ROUTES & MODELS
======================= */

const adminDepartments = require("./Routes/adminDepartments");
const adminUsersRoutes = require("./Routes/adminUsers");
const studentRoutes = require("./Routes/student");
const hodRoutes = require("./Routes/hod");
const professorRoutes=require("./Routes/professor");

const User = require("./models/User");
const { generateOTP, sendOTPEmail, sendWelcomeEmail, sendPasswordResetOTP, verifyTransporter } = require("./services/emailService");

/* =======================
   APP INIT
======================= */

const app = express();


app.use(cookieParser());
/* =======================
   CORS (LOCAL + VERCEL)
======================= */
app.use(
  cors({
    origin: true,   // reflect request origin
    credentials: true,
  })
);


app.use(express.json());

/* =======================
   STATIC FILES
======================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =======================
   API ROUTES
======================= */

app.use("/", adminDepartments);
app.use("/admin", adminUsersRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/professor", professorRoutes);


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
  console.error("❌ FATAL ERROR: JWT_SECRET missing");
  process.exit(1);
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
}

/* =======================
   DB CONNECTION
======================= */

if (!process.env.MONGO_URI) {
  console.error("❌ FATAL ERROR: MONGO_URI missing");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    // Verify SMTP config right at startup so you know immediately if email will work
    await verifyTransporter();
  })
  .catch(err => {
    console.error("MongoDB error:", err.message);
    process.exit(1);
  });

/* =======================
   ADMIN OVERVIEW
======================= */

app.get("/api/admin/overview", verifyToken, isAdmin, async (req, res) => {
  try {
    const Department = require("./models/Department");

    const totalDepartments = await Department.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalProfessors = await User.countDocuments({ role: "professor" });
    const totalHODs = await User.countDocuments({ role: "hod" });

    res.json({
      totalDepartments,
      totalUsers,
      totalStudents,
      totalProfessors,
      totalHODs,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   SIGNUP (FIXED PATH) - SEND OTP
======================= */

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long, contain at least one uppercase letter, and at least one unique (special) character" 
      });
    }

    // Check if already registered (and verified)
    const existing = await User.findOne({ email });
    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // ✅ FIX: Send OTP email FIRST — only save user to DB if email succeeds.
    // This prevents orphaned (unverified) user records that block future signups.
    const emailSent = await sendOTPEmail(email, otp, name);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }

    // If there's an existing unverified record (previous failed attempt), update it
    if (existing && !existing.isVerified) {
      existing.password = hashed;
      existing.otp = otp;
      existing.otpExpiry = otpExpiry;
      await existing.save();
    } else {
      const user = new User({
        name,
        email,
        password: hashed,
        role: role || "student",
        otp,
        otpExpiry,
        isVerified: false,
      });
      await user.save();
    }

    res.status(201).json({ 
      message: "User registered successfully. OTP sent to your email.",
      email, 
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   VERIFY OTP
======================= */

app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    // Check OTP expiry
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please signup again." });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark as verified and clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.json({ 
      message: "Email verified successfully. You can now log in.",
      verified: true,
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   RESEND OTP
======================= */

app.post("/api/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name);
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }

    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = app;


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

const resetOtpStore = new Map();

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim())
      return res.status(400).json({ message: "Email is required" });

    const userEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: userEmail });
    if (user) {
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      resetOtpStore.set(userEmail, { otp, expiresAt });

      const emailSent = await sendPasswordResetOTP(user.email, otp, user.name);
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send OTP email" });
      }
    }

    return res.json({
      message: "If this email is registered, you will receive password reset instructions.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password)
      return res.status(400).json({ message: "Email, OTP, and password are required" });

    const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long, contain at least one uppercase letter, and at least one unique (special) character" 
      });
    }

    const userEmail = email.trim().toLowerCase();
    const stored = resetOtpStore.get(userEmail);
    
    if (!stored) {
      return res.status(400).json({ message: "Invalid or expired reset session" });
    }
    
    if (Date.now() > stored.expiresAt) {
      resetOtpStore.delete(userEmail);
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }
    
    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(400).json({ message: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    resetOtpStore.delete(userEmail);

    return res.json({ message: "Password reset successfully. You can now login." });
  } catch (err) {
    console.error("Reset password error:", err);
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
