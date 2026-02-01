const mongoose = require("mongoose");

/**
 * History schema
 * Stores complete approval / rejection / resubmission timeline
 */
const historySchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  action: {
    type: String,
    enum: ["submitted", "approved", "rejected", "resubmitted", "forwarded"],
    required: true
  },
  remark: {
    type: String
  },
  signature: {
    type: String // hash or image path (future safe)
  },
  oldFilePath: {
    type: String // stores old file path on resubmission
  },
  date: {
    type: Date,
    default: Date.now
  }
});

/**
 * Main Assignment schema
 */
const assignmentSchema = new mongoose.Schema(
  {
    // Student who uploaded (using 'student' as alias for consistency with routes)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Basic info
    title: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    category: {
      type: String,
      enum: ["Assignment", "Thesis", "Report"],
      required: true
    },

    // File storage info
    filePath: {
      type: String,
      required: true
    },

    fileOriginalName: {
      type: String
    },

    fileSize: {
      type: Number
    },

    // Assignment workflow status
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected", "forwarded"],
      default: "draft"
    },

    // Assigned professor (initial reviewer)
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Current reviewer (for workflow tracking)
    currentReviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Department
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    },

    // Approval & resubmission timeline
    history: [historySchema]
  },
  {
    timestamps: true // createdAt & updatedAt
  }
);

// Virtual to keep backward compatibility with 'studentId' references
assignmentSchema.virtual('studentId').get(function() {
  return this.student;
});

module.exports = mongoose.model("Assignment", assignmentSchema);
