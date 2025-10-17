// Backend/config/multer.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📂 Directory for CV uploads
const uploadDir = path.join(__dirname, "..", "uploads", "cvs");

// ✅ Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created uploads directory:", uploadDir);
}

// 🎯 Define storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// 🧾 File filter (optional, for security)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF or Word documents are allowed"), false);
  }
  cb(null, true);
};

// 🎯 Create multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

module.exports = upload;