import axios from "axios";

export const api = axios.create({
  baseURL: "https://hallucination-guard.onrender.com"
});

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return res.data;
}

export async function indexDocument(fileName, originalName) {
  const res = await api.post("/index", {
    fileName,
    originalName
  });

  return res.data;
}

export async function analyzeResponse(data) {
  const res = await api.post("/analyze", data);
  return res.data;
}

export async function indexText(text) {
  const res = await api.post("/index-text", {
    text
  });

  return res.data;
}