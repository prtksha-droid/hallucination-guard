const { retrieveTopChunks } = require("../retrievalService");
const { fetchWebEvidence } = require("./webAgent");

async function retrieveEvidence(claim){

  const rag = await retrieveTopChunks(claim,5) || [];

  const web = await fetchWebEvidence(claim);

  const ragNormalized = rag.map(r=>({
    id:r.id,
    text:r.text,
    source:r.originalName || "vector_db",
    similarity:r.similarity || 0,
    type:"rag"
  }));

  return [...ragNormalized,...web];

}

module.exports = { retrieveEvidence };