const axios = require("axios");

const wikiClient = axios.create({
  timeout:3000,
  headers:{
    "User-Agent": "HallucinationGuard/1.0 (AI research)"
  }
});

async function fetchWebEvidence(query){

  const evidence = [];

  let entity = query.split(" ")[0].toLowerCase();

if(entity.endsWith("s")){
  entity = entity.slice(0,-1);
}

try {

  const entitySearch = await wikiClient.get(
    "https://en.wikipedia.org/w/api.php",
    {
      params:{
        action:"opensearch",
        search:entity,
        limit:1,
        namespace:0,
        format:"json"
      }
    }
  );

  const titles = entitySearch.data[1];

  if(titles && titles.length){

    const title = titles[0];

    const page = await wikiClient.get(
      "https://en.wikipedia.org/w/api.php",
      {
        params:{
          action:"query",
          prop:"extracts",
explaintext:1,
          titles:title,
          format:"json"
        }
      }
    );

    const pages = page.data.query.pages;
    const pageObj = Object.values(pages)[0];

    if(pageObj && pageObj.extract){

  const sentences = pageObj.extract
  .split(". ")
  .slice(0,3)
  .join(". ") + ".";

evidence.push({
  id:"wiki",
  text:sentences,
  source:`https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  similarity:0.9,
  type:"web"
});
  // 🚀 stop here if entity page found
  return evidence;

}

  }

} catch(e){
  console.log("ENTITY LOOKUP ERROR:", e.message);
}
  
  

  try {

    const search = await wikiClient.get(
      "https://en.wikipedia.org/w/api.php",
      {
        params:{
          action:"query",
          list:"search",
          srsearch:query,
          format:"json"
        }
      }
    );

    if(!search.data.query.search.length) return [];

    const results = search.data.query.search;

const rankedTitles = results
  .map(r => r.title)
  .sort((a,b)=>{
    const scoreA = titleScore(query,a);
    const scoreB = titleScore(query,b);
    return scoreB - scoreA;
  });

const titles = rankedTitles
  .filter(title => titleScore(query,title) >= 1)
  .slice(0,3);

    // parallel page requests
    const pageRequests = titles.map(title =>
      wikiClient.get(
        "https://en.wikipedia.org/w/api.php",
        {
          params:{
            action:"query",
            prop:"extracts",
explaintext:1,
            titles:title,
            format:"json"
          }
        }
      )
    );

    const pagesData = await Promise.all(pageRequests);

    pagesData.forEach((page,index)=>{

      const title = titles[index];

      const pages = page?.data?.query?.pages;
      if(!pages) return;

      const pageObj = Object.values(pages)[0];
      if(!pageObj) return;

      const extract = pageObj.extract;
      if(!extract) return;

      const sentences = extract
        .split(". ")
        .map(s=>s.trim())
        .filter(s=>s.length > 40);

      const topSentences = sentences.slice(0,2);

      topSentences.forEach(s=>{
        evidence.push({
          id:"wiki",
          text:s + ".",
          source:`https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          similarity:0.7,
          type:"web"
        });
      });

    });

  } catch(err){
    console.log("WEB RETRIEVAL ERROR:", err.message);
  }

  return evidence.slice(0,5);
}

function similarity(a,b){

  const A = a.toLowerCase().split(/\s+/);
  const B = b.toLowerCase();

  let score = 0;

  for(const w of A){
    if(B.includes(w)) score++;
  }

  return score;
}

function titleScore(query,title){

  const qWords = query.toLowerCase().split(/\s+/);
  const t = title.toLowerCase();

  let score = 0;

  for(const w of qWords){
    if(t.includes(w)) score++;
  }

  return score;
}

module.exports = { fetchWebEvidence };