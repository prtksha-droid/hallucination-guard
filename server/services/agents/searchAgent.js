const { retrieveTopChunks } = require("../retrievalService");
const { fetchWebEvidence } = require("./webAgent");

async function searchEvidence(claim) {

  const evidence = [];

  try {

    // 🔥 RUN BOTH SEARCHES IN PARALLEL
    const [webResults, vectorResults] = await Promise.all([
      fetchWebEvidence(claim),
      retrieveTopChunks(claim, 3)
    ]);

    if (webResults) evidence.push(...webResults);
    if (vectorResults) evidence.push(...vectorResults);

  } catch (e) {
    console.log("SEARCH ERROR:", e.message);
  }

  // 🔥 LIMIT TOTAL EVIDENCE
  return evidence.slice(0,5);
}

module.exports = { searchEvidence };