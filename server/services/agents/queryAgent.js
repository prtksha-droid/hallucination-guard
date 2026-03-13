async function rewriteQuery(claim) {

  const text = claim.toLowerCase();

  // basic entity extraction
  const words = text.split(" ");

  const entity = words[0]; // e.g. "dogs"

  return [
    entity,
    `${entity} classification`
  ];
}

module.exports = { rewriteQuery };