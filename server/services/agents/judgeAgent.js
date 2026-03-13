const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function judgeClaimWithLLM(claim, evidenceList = []) {

  if(!evidenceList || evidenceList.length === 0){
    return {
      verdict: "unknown",
      reason: "No evidence retrieved",
      confidence: 0
    };
  }

  const evidenceText = evidenceList
    .slice(0,5)
    .map((e,i)=>`${i+1}. ${e.text}`)
    .join("\n");

  const prompt = `
You are a strict factual verification judge.

Claim:
${claim}

Evidence:
${evidenceText}

Rules:
- Use ONLY the evidence
- Scientific classification counts as support
- If evidence states that the subject belongs to a family/genus/species related to the claim, treat it as supported
- If evidence contradicts claim → contradicted
- If evidence reasonably implies the claim → supported
- If truly unclear → unknown

Return ONLY valid JSON.

{
 "verdict": "supported | contradicted | unknown",
 "reason": "short explanation",
 "confidence": 0.0
}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: "You are a precise factual verification judge." },
      { role: "user", content: prompt }
    ]
  });

  const text = response.choices[0].message.content;

  try{
    return JSON.parse(text);
  }catch(err){

    console.log("JUDGE PARSE ERROR:", text);

    return {
      verdict:"unknown",
      reason:"LLM returned invalid JSON",
      confidence:0
    };
  }
}

module.exports = { judgeClaimWithLLM };