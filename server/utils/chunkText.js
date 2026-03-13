function chunkText(text = "", chunkSize = 800, overlap = 120) {
  const cleaned = String(text).replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const chunks = [];
  let start = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + chunkSize, cleaned.length);
    const chunk = cleaned.slice(start, end).trim();

    if (chunk) chunks.push(chunk);
    if (end >= cleaned.length) break;

    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

module.exports = { chunkText };