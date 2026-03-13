const fs = require("fs");
const path = require("path");

const STORE_PATH = path.join(__dirname, "../data/vectorStore.json");

function loadVectorStore() {

  if (!fs.existsSync(STORE_PATH)) {
    return [];
  }

  const raw = fs.readFileSync(STORE_PATH, "utf8");

  if (!raw) {
    return [];
  }

  return JSON.parse(raw);
}

function saveVectorStore(data) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  loadVectorStore,
  saveVectorStore
};