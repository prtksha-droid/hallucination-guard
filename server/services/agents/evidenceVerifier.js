const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function verifyEvidence(claim, evidenceList = []) {

  const verified = [];

  for (const e of evidenceList) {

    const prompt = `
Claim:
${claim}

Evidence:
${e.text}

Determine if this evidence can logically prove or disprove the claim.

Accept ONLY if the evidence:
• states a definition
• states taxonomy or classification
• identifies the family/genus/species
• directly supports or contradicts the claim

Reject if the evidence only describes:
• physical traits
• diseases
• habitats
• behaviour
• history or breeding

Answer ONLY: YES or NO
`;

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: "You check evidence relevance." },
        { role: "user", content: prompt }
      ]
    });

    const answer = res.choices[0].message.content.trim().toUpperCase();

    if(answer.trim().toUpperCase().startsWith("YES")){
   verified.push(e);
}

  }

  return verified;
}

module.exports = { verifyEvidence };