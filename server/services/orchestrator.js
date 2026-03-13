const { detectModel } = require("./agents/modelAgent");
const { extractClaims } = require("./agents/claimAgent");
const { retrieveEvidence } = require("./agents/retrievalAgent");
const { rankEvidence } = require("./agents/evidenceAgent");
const { searchEvidence } = require("./agents/searchAgent");
//const { judgeClaim } = require("./agents/contradictionAgent");
const { scoreResults } = require("./agents/riskAgent");
const { judgeClaimWithLLM } = require("./agents/judgeAgent");
const { rerankEvidence } = require("./agents/rerankAgent");
const { rewriteQuery } = require("./agents/queryAgent");
const { filterEvidence } = require("./agents/relevanceAgent");
const { verifyEvidence } = require("./agents/evidenceVerifier");
const { detectContradiction } = require("./agents/contradictionAgent");


async function runVerification({
  responseText = "",
  providerHint = "",
  metadataModel = "",
  mcpSources = []
}) {
  const model = detectModel({ responseText, providerHint, metadataModel });
  const claims = extractClaims(responseText);

  const claimResults = [];

  for (const claim of claims) {

let retryCount = 0;
let queries = await rewriteQuery(claim);

// LIMIT QUERIES
queries = queries.slice(0,2);

let rawEvidence = [];

const searchResults = await Promise.all(
  queries.map(q => {
    console.log("SEARCH QUERY:", q);
    return searchEvidence(q);
  })
);

searchResults.forEach(r => rawEvidence.push(...r));
  

 

const filteredEvidence = await filterEvidence(claim, rawEvidence);

// limit evidence sent to LLM (prevents noise and saves tokens)
const limitedEvidence = filteredEvidence.slice(0, 5);

const rerankedEvidence = limitedEvidence.slice(0,5);

//const verifiedEvidence = await verifyEvidence(claim, rerankedEvidence);
let finalEvidence = rerankedEvidence.slice(0,2);

// Step 2 — retry search if evidence is weak
const evidenceWeak = !finalEvidence || finalEvidence.length === 0;

if(false){
  retryCount++; 

  console.log("WEAK EVIDENCE → RETRY SEARCH");

  const retryQuery = `${claim} taxonomy`;

  const retryRaw = await searchEvidence(retryQuery);

  const retryFiltered = await filterEvidence(claim, retryRaw);

  const retryRank = rankEvidence(claim, retryFiltered);

  const retryRerank = await rerankEvidence(claim, retryRank);

  const retryVerified = await verifyEvidence(claim, retryRerank);

  finalEvidence = (retryVerified.length ? retryVerified : retryRerank).slice(0,2);
}
if (!finalEvidence.length) {
  finalEvidence = rerankedEvidence;
}

const judged = await judgeClaimWithLLM(claim, finalEvidence);

let verdict;

if (!finalEvidence.length) {
  verdict = "hallucinated";
} else if (judged.verdict === "contradicted") {
  verdict = "hallucinated";
} else if (judged.verdict === "supported") {
  verdict = "not hallucinated";
} else {
  verdict = "uncertain";
}

 const sources = finalEvidence.map(e => e.source).filter(Boolean);

claimResults.push({
  claim,
  hallucination: verdict,
  sources,
  correction: judged.correction || null
});

} // ← CLOSE THE for-loop HERE


const summary = scoreResults(claimResults);

return {
  model,
  summary,
  claims: claimResults
};

} // ← CLOSE runVerification FUNCTION

module.exports = { runVerification };