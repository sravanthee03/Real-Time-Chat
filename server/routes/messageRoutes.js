const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const router = express.Router();

// existing GET /:userId etc...

// mark messages from :userId as seen
router.post("/seen/:userId", protect, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const myId = req.user._id;

    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: myId,
        status: { $ne: "seen" },
      },
      { $set: { status: "seen" } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("MARK SEEN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
