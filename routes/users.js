const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const router = express.Router();

/* ===============================
 * 🧑‍💻 TẠO ADMIN TẠM THỜI
 * =============================== */
router.post("/create-admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin đã tồn tại" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      firstName: "Super",
      lastName: "Admin",
      email,
      password: hashed,
      role: "admin",
    });

    await newAdmin.save();
    res.status(201).json({ message: "Tạo admin thành công", admin: newAdmin });
  } catch (err) {
    console.error("❌ Lỗi tạo admin:", err);
    res.status(500).json({ message: "Lỗi server khi tạo admin" });
  }
});

/* ===============================
 * 👤 ĐĂNG KÝ USER THƯỜNG
 * =============================== */
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // kiểm tra email trùng
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã được đăng ký" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashed,
      role: "user",
    });

    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (err) {
    console.error("❌ Lỗi đăng ký:", err);
    res.status(500).json({ message: "Lỗi server khi đăng ký" });
  }
});

/* ===============================
 * 🔑 ĐĂNG NHẬP
 * =============================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Sai mật khẩu" });

    // tạo token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
});

module.exports = router;
