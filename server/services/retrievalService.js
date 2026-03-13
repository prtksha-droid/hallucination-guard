const fs = require("fs");
const path = require("path");
const { embedText } = require("./embeddingService");

const storePath = path.join(__dirname,"../data/vectorStore.json");

function cosineSimilarity(a,b){

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for(let i=0;i<a.length;i++){
    dot += a[i]*b[i];
    normA += a[i]*a[i];
    normB += b[i]*b[i];
  }

  return dot/(Math.sqrt(normA)*Math.sqrt(normB));
}

async function retrieveTopChunks(query,limit=5){

  const store = JSON.parse(fs.readFileSync(storePath));

  const queryEmbedding = await embedText(query);

  const scored = store.map(item=>({

    ...item,

    similarity: cosineSimilarity(queryEmbedding,item.embedding)

  }));

  // sort highest similarity first
  scored.sort((a,b)=>b.similarity-a.similarity);

  // 🔴 filter weak matches
  const filtered = scored.filter(item => item.similarity > 0.25);

  // return only relevant chunks
  return filtered.slice(0,limit);
}

module.exports = { retrieveTopChunks };