const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function rerankEvidence(claim, evidenceList = []) {

  if (!evidenceList.length) return [];

  const validEvidence = (evidenceList || []).filter(
  e => e && typeof e.text === "string"
);

if (!validEvidence.length) return [];

// ⚡ Skip LLM if evidence already small
if (validEvidence.length <= 3) {
  return validEvidence.slice(0,3);
}

// limit evidence sent to LLM
const limitedEvidence = validEvidence.slice(0,6);

const formatted = limitedEvidence
  .map((e,i)=>`${i+1}. ${e.text}`)
  .join("\n");

  const prompt = `
Claim:
${claim}

Evidence:
${formatted}

Select the 3 evidence items most useful for verifying the claim.

Return JSON:
{ "indices": [1,2,3] }
`;

  const response = await client.chat.completions.create({
  model:"gpt-4o-mini",
  temperature:0,
  max_tokens:50,
  messages:[
      {role:"system",content:"You rank evidence relevance."},
      {role:"user",content:prompt}
    ]
  });

  let indices = [];

const text = response.choices[0].message.content;

try {

  const json = JSON.parse(text);

  indices = json.indices || [];

} catch(err){

  // extract numbers manually if JSON fails
  const matches = text.match(/\d+/g);

  if(matches){
    indices = matches.map(n => Number(n));
  }

  console.log("RERANK PARSE ERROR — using fallback extraction");
}

 const selected = indices
  .map(i => limitedEvidence[i-1])
  .filter(Boolean);

  if (!selected.length) {
    return validEvidence.slice(0,3);
  }

  return selected;
}

module.exports = { rerankEvidence };