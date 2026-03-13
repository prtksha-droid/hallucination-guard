const express = require("express");
const path = require("path");
const { parseDocument } = require("../utils/parseDocument");
const { chunkText } = require("../utils/chunkText");
const { embedMany } = require("../services/embeddingService");
const { addDocuments } = require("../services/vectorStore");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { fileName, originalName } = req.body || {};

    if (!fileName || !originalName) {
      return res.status(400).json({
        success: false,
        error: "fileName and originalName are required"
      });
    }

    const filePath = path.join(__dirname, "..", "uploads", fileName);
    const text = await parseDocument(filePath, originalName);

    if (!text.trim()) {
      return res.status(400).json({ success: false, error: "No text could be extracted from the document" });
    }

    const chunks = chunkText(text, 800, 120);
    const embeddings = await embedMany(chunks);

    const records = chunks.map((chunk, index) => ({
      id: `${fileName}-chunk-${index + 1}`,
      fileName,
      originalName,
      chunkIndex: index,
      text: chunk,
      embedding: embeddings[index],
      metadata: {
        sourceType: "uploaded_document",
        indexedAt: new Date().toISOString()
      }
    }));

    addDocuments(records);

    res.json({
      success: true,
      indexed: records.length,
      preview: records.slice(0, 2).map((r) => ({ id: r.id, text: r.text.slice(0, 200) }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Indexing failed" });
  }
});

router.post("/text", async (req, res) => {

  try {

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Text is required"
      });
    }

    const { chunkText } = require("../utils/chunkText");
    const { embedMany } = require("../services/embeddingService");
    const { addDocuments } = require("../services/vectorStore");

    const chunks = chunkText(text, 800, 120);
    const embeddings = await embedMany(chunks);

    const records = chunks.map((chunk, index) => ({
      id: `text-chunk-${Date.now()}-${index}`,
      text: chunk,
      embedding: embeddings[index],
      originalName: "manual-input"
    }));

    addDocuments(records);

    res.json({
      success: true,
      indexed: records.length
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

module.exports = router;