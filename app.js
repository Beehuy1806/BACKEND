// app.js — giữ nguyên cấu trúc, chỉ bổ sung phần cần thiết

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

/* =========================
 * 1) Middleware cơ bản
 * ========================= */
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS: cho phép FE Next.js ở localhost:3000 gọi sang

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


// Static (nếu bạn có thư mục public/uploads…)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
 * 2) Kết nối MongoDB
 * ========================= */
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ MONGO_URI chưa được thiết lập trong .env");
  process.exit(1);
}

// Lưu ý: các option useNewUrlParser/useUnifiedTopology đã deprecated trên driver v4+.
// Không cần thiết, mình giữ tối giản và ổn định.
mongoose
  .connect(process.env.MONGO_URI, { dbName: "DB_DATN" })
  .then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));


/* =========================
 * 3) Routes
 * ========================= */
// Giữ nguyên cách mount như dự án của bạn:
const productsRouter = require("./routes/products");
const categoriesRouter = require("./routes/categories");
const brandsRouter = require("./routes/brands");
const userRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const { auth, isAdmin } = require("./middleware/authMiddleware");


// Prefix KHÔNG có /api vì BE của bạn đang dùng /products, /categories, /brands
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/brands", brandsRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);


// (Optional) landing route
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

/* =========================
 * 4) Error handler đơn giản
 * ========================= */
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* =========================
 * 5) Export app & Listen an toàn
 * ========================= */
// Giữ export để bin/www có thể require('.. /app')
module.exports = app;

// 🔰 Chỉ tự mở cổng khi chạy trực tiếp: `node app.js`
// Nếu bạn chạy qua `bin/www` (npm run dev) thì block này KHÔNG chạy → tránh double listen.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Express listening on port ${PORT}`);
  });
}
console.log("✅ MONGO_URI hiện tại:", process.env.MONGO_URI);
