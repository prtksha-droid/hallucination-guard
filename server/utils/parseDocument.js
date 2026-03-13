const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function parsePdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const result = await pdfParse(buffer);
  return result.text || "";
}

async function parseDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || "";
}

async function parseTxt(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

async function parseDocument(filePath, originalName = "") {
  const ext = path.extname(originalName || filePath).toLowerCase();

  if (ext === ".pdf") return parsePdf(filePath);
  if (ext === ".docx") return parseDocx(filePath);
  if (ext === ".txt") return parseTxt(filePath);

  throw new Error(`Unsupported file type: ${ext}. Use PDF, DOCX, or TXT.`);
}

module.exports = {
  parseDocument,
  parsePdf,
  parseDocx,
  parseTxt
};