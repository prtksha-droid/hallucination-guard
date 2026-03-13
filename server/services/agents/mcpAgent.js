async function fetchMcpEvidence(claim, mcpSources = []) {

  // Convert string to array if needed
  if (typeof mcpSources === "string") {
    mcpSources = mcpSources.split(",").map(s => s.trim()).filter(Boolean);
  }

  // Ensure it's always an array
  if (!Array.isArray(mcpSources)) {
    mcpSources = [];
  }

  return mcpSources.map((source, index) => ({
    id: `mcp-${source}-${index}`,
    text: `Knowledge retrieved from ${source}`,
    source,
    similarity: 0.3,
    type: "mcp"
  }));

}

module.exports = { fetchMcpEvidence };