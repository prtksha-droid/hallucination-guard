async function filterEvidence(claim, evidenceList = []) {

  if (!evidenceList.length) return [];

  const validEvidence = evidenceList.filter(
    e => e && typeof e.text === "string"
  );

  // limit evidence early to avoid large prompts later
  return validEvidence.slice(0,6);
}

module.exports = { filterEvidence };