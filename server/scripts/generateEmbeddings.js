const fs = require("fs");
const path = require("path");
const { embedText } = require("../services/embeddingService");

const file = path.join(__dirname,"../data/vectorStore.json");

async function run(){

  const data = JSON.parse(fs.readFileSync(file));

  for(const item of data){

    console.log("Embedding:",item.text);

    item.embedding = await embedText(item.text);
  }

  fs.writeFileSync(file,JSON.stringify(data,null,2));

}

run();