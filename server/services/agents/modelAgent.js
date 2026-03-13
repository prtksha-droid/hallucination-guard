function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectModel({ responseText = "", providerHint = "", metadataModel = "" }) {
  if (metadataModel && metadataModel.trim()) {
    return {
      model: metadataModel.trim(),
      confidence: 100,
      method: "Exact detection from API metadata"
    };
  }

  const text = normalize(`${providerHint} ${responseText}`);
  const rules = [
    { test: /gpt|openai|4o|o1|o3|o4/, model: "Likely OpenAI family" },
    { test: /claude|anthropic|sonnet|haiku|opus/, model: "Likely Claude family" },
    { test: /gemini|google|flash|pro/, model: "Likely Gemini family" },
    { test: /llama|meta/, model: "Likely Llama family" },
    { test: /mistral|mixtral/, model: "Likely Mistral family" },
    { test: /deepseek/, model: "Likely DeepSeek family" }
  ];

  const hit = rules.find((r) => r.test.test(text));

  return {
    model: hit ? hit.model : "Unknown / cannot infer exactly",
    confidence: hit ? 62 : 15,
    method: "Heuristic detection"
  };
}

module.exports = { detectModel };