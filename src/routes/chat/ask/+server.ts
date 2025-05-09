import type { RequestHandler } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { cosineSimilarity } from '$lib/util/mathisfrickingstupid.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const PARSED_HANDBOOK_PATH = path.resolve('src/lib/parsed-handbook/stopreadingthesourcecode.txt');

let handbookChunks: string[] = [];
let handbookEmbeddings: number[][] = [];
let extractor: any;

// Load and chunk the handbook into 500-word pieces
async function loadTextChunks(): Promise<string[]> {
  if (fs.existsSync(PARSED_HANDBOOK_PATH)) {
    const fullText = fs.readFileSync(PARSED_HANDBOOK_PATH, 'utf-8');
    const words = fullText.split(/\s+/);
    const maxWords = 500;
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += maxWords) {
      chunks.push(words.slice(i, i + maxWords).join(' '));
    }

    return chunks;
  } else {
    throw new Error(`Parsed handbook file not found at ${PARSED_HANDBOOK_PATH}`);
  }
}

// Generate embeddings using transformers
async function embedChunks(chunks: string[]): Promise<number[][]> {
  extractor = extractor || (await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'));
  const embeddings: number[][] = [];

  for (const chunk of chunks) {
    const output = await extractor(chunk, { pooling: 'mean', normalize: true });
    embeddings.push(output.data);
  }

  return embeddings;
}

// Retrieve the top-k most relevant chunks for the given question
async function retrieveTopK(question: string, k = 3): Promise<string[]> {
  const qEmbedding = (await extractor(question, { pooling: 'mean', normalize: true })).data;
  const similarities = handbookEmbeddings.map((vec) => cosineSimilarity(vec, qEmbedding));
  const topKIndices = similarities
    .map((sim, i) => [sim, i] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, k)
    .map(([, i]) => i);

  return topKIndices.map((i) => handbookChunks[i]);
}

// Load chunks and embeddings once
async function init() {
  if (!handbookChunks.length) {
    handbookChunks = await loadTextChunks();
    handbookEmbeddings = await embedChunks(handbookChunks);
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { question, brainrotMode } = await request.json();

    // Special health-check ping
    if (question === 'ping6969lol') {
      return new Response(JSON.stringify({ answer: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await init();
    const topChunks = await retrieveTopK(question);

    let prompt = `
You are a Lasallian student disciplinary officer.
Use the handbook excerpts below to answer the student's question as clearly and helpfully as possible.
Be factual.

--- Handbook Context ---
${topChunks.join('\n\n')}

--- Student Question ---
${question}

If there is an error say "I errored, please try again, if the error persists, please try again later."
`;

    if (brainrotMode) {
      prompt = `
You are a Lasallian student disciplinary officer.
Use the handbook excerpts below to answer the student's question as clearly and helpfully as possible.
Please use context clues from the handbook to support your answer.
Make the response ghetto or from da hood.

--- Handbook Context ---
${topChunks.join('\n\n')}

--- Student Question ---
${question}

If there is an error say "sorry homie, an error happened, try now, try later, idrc."
`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new Response(JSON.stringify({ answer: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('RAG Handler Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
