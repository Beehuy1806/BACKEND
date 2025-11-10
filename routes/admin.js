const router = require("express").Router();
const { auth, isAdmin } = require("../middleware/authMiddleware");
const { getStats } = require("../controllers/adminController");

router.get("/stats", auth, isAdmin, getStats);

module.exports = router;
