function scoreResults(results = []) {
  const total = results.length || 1;
  const supported = results.filter((r) => r.verdict === "supported").length;
  const maybe = results.filter((r) => r.verdict === "possible_hallucination").length;
  const unsupported = results.filter((r) => r.verdict === "unsupported").length;

  const trustScore = Math.max(
    0,
    Math.min(100, Math.round((supported / total) * 100 - maybe * 8 - unsupported * 18))
  );

  return {
    supported,
    possibleHallucinations: maybe,
    unsupported,
    trustScore,
    flagged: maybe + unsupported > 0
  };
}

module.exports = { scoreResults };