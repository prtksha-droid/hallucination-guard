require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const uploadRoute = require("./routes/upload");
const indexRoute = require("./routes/index");
const analyzeRoute = require("./routes/analyze");

const app = express();
const PORT = process.env.PORT || 4000;

const uploadsDir = path.join(__dirname, "uploads");
const dataDir = path.join(__dirname, "data");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => {
  res.send("Hallucination Guard API is running");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "hallucination-guard-server" });
});

app.use("/upload", uploadRoute);
app.use("/index", indexRoute);
app.use("/analyze", analyzeRoute);



app.listen(PORT, () => {
  console.log(`✅ Hallucination Guard server running on port ${PORT}`);
});