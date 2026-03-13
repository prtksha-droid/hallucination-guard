import { useState } from "react";
import { analyzeResponse } from "./api";

export default function App() {

  const [responseText, setResponseText] = useState("");
  const [providerHint, setProviderHint] = useState("OpenAI");
  const [metadataModel, setMetadataModel] = useState("gpt-4o");
 const [result, setResult] = useState(null);
const [loading, setLoading] = useState(false);

  async function handleAnalyze() {

  setLoading(true);
  setResult(null);

  const res = await analyzeResponse({
    providerHint,
    metadataModel,
    responseText
  });

  setResult(res);
  setLoading(false);
}

  return (
    <div style={{ padding: 40 }}>

      <h1>Hallucination Guard</h1>

      <h3>Provider</h3>
      <input
        value={providerHint}
        onChange={(e) => setProviderHint(e.target.value)}
        style={{ width: "100%" }}
      />

      <h3>Model</h3>
      <input
        value={metadataModel}
        onChange={(e) => setMetadataModel(e.target.value)}
        style={{ width: "100%" }}
      />

      <h3>AI Response</h3>

      <textarea
        rows={6}
        style={{ width: "100%" }}
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
      />

      <br /><br />

      <button onClick={handleAnalyze}>
  Analyze Response
</button>

<hr />

{loading && (
  <div style={{marginTop:20}}>
    🔍 Verifying claims and retrieving evidence...
  </div>
)}

      <hr />

      {result && (
        <div>

          <h2>Trust Score</h2>
          {result.summary?.trustScore}

          <h2>Claims</h2>

          {result.claims?.map((c, i) => (
            <div
              key={i}
              style={{
                border: "1px solid gray",
                padding: 10,
                marginBottom: 10
              }}
            >

              <b>Claim:</b> {c.claim} <br/>

              <b>Hallucination:</b>{" "}
              <span
                style={{
                  color: c.hallucination === "hallucinated" ? "red" : "green"
                }}
              >
                {c.hallucination}
              </span>

              <br/>

              <b>Source:</b>

              {c.sources && c.sources.length > 0 ? (
                c.sources.map((s, i) => (
                  <div key={i}>
                    <a href={s} target="_blank" rel="noopener noreferrer">
                      {s}
                    </a>
                  </div>
                ))
              ) : (
                <div>No source found</div>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}