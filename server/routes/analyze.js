const express = require("express");
const { runVerification } = require("../services/orchestrator");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const result = await runVerification(req.body || {});
    res.json({ success: true, ...result });
  }catch (error) {

  console.error("ANALYZE ERROR:", error);

  res.status(500).json({
    success: false,
    error: error.message,
    stack: error.stack
  });

}
});

module.exports = router;