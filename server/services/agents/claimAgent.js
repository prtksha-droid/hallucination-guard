function extractClaims(text = "") {

  if (!text) return [];

  const sentences = text
    .split(/[.?!]/)
    .map(s => s.trim())
    .filter(Boolean);

  return sentences;
}

module.exports = { extractClaims };