function tokenize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .filter(Boolean);
}

function similarity(a, b) {
  const aTokens = new Set(tokenize(a));
  const bTokens = new Set(tokenize(b));

  let overlap = 0;

  for (const t of aTokens) {
    if (bTokens.has(t)) overlap++;
  }

  return overlap / (aTokens.size || 1);
}

function splitEvidence(text) {
  return text
    .split(/[.?!]/)
    .map(s => s.trim())
    .filter(Boolean);
}

function rankEvidence(claim, evidenceList){

  const keywords = claim.toLowerCase().split(/\s+/);

  return evidenceList
    .filter(e => e && e.text)
    .map(e => {

      const text = e.text.toLowerCase();
      let score = 0;

      // keyword match
      keywords.forEach(k => {
        if (text.includes(k)) score += 1;
      });

      // taxonomy boost
      if (
        text.includes("family") ||
        text.includes("genus") ||
        text.includes("species") ||
        text.includes("classification") ||
        text.includes("felidae")
      ){
        score += 5;
      }

      // penalty for disease / medical pages
      if (
        text.includes("disease") ||
        text.includes("virus") ||
        text.includes("infection") ||
        text.includes("distemper")
      ){
        score -= 5;
      }

      return { ...e, score };

    })
    .sort((a,b)=>b.score-a.score)
    .slice(0,6);
}

module.exports = { rankEvidence };