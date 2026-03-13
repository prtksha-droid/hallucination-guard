const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function detectContradiction(claim, evidenceList = []) {

  if (!evidenceList.length) return { contradiction:false };

  const evidenceText = evidenceList
    .map(e => "- " + e.text)
    .join("\n");

  const prompt = `
Claim:
${claim}

Evidence:
${evidenceText}

Determine the relationship.

Rules:
- If evidence contradicts the claim → result: "contradicted"
- If evidence supports the claim → result: "supported"
- If evidence is unrelated → result: "insufficient"

Return JSON:
{
 "result": "supported | contradicted | insufficient",
 "correction": "correct statement if contradicted"
}
`;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages:[
      {role:"system",content:"You detect factual contradictions."},
      {role:"user",content:prompt}
    ]
  });

  const text = res.choices[0].message.content;

  try {
    let parsed;

try {
  parsed = JSON.parse(text);
} catch {
  parsed = { result: "insufficient" };
}

return {
  result: parsed.result || "insufficient",
  correction: parsed.correction || null
};
  } catch {
    return { result:"insufficient" };
  }
}

module.exports = { detectContradiction };