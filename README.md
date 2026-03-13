# Hallucination Guard

## What this MVP does
- Detects the likely model used for a response
- Uses exact model metadata if available
- Splits output into claims
- Compares each claim against provided RAG evidence
- Flags likely hallucinations, unsupported claims, and numeric conflicts
- Shows which MCP-connected systems are treated as trusted sources

## Run backend
```bash
cd server
npm install
copy .env.example .env
npm run dev