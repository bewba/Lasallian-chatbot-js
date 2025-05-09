import type { RequestHandler } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { pipeline } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { cosineSimilarity } from '$lib/util/mathisfrickingstupid.js'; 

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Path to the parsed handbook stored in the `$lib/parsed-handbook` folder
const PARSED_HANDBOOK_PATH = path.resolve('src/lib/parsed-handbook/stopreadingthesourcecode.txt');

let handbookChunks: string[] = [];
let handbookEmbeddings: number[][] = [];
let extractor: any;

// Load text chunks from the parsed handbook file
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

async function embedChunks(chunks: string[]): Promise<number[][]> {
  extractor = extractor || (await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'));
  const embeddings: number[][] = [];

  for (const chunk of chunks) {
    const output = await extractor(chunk, { pooling: 'mean', normalize: true });
    embeddings.push(output.data);
  }
  return embeddings;
}

async function retrieveTopK(question: string, k = 3): Promise<string[]> {
  const qEmbedding = (await extractor(question, { pooling: 'mean', normalize: true })).data;
  const similarities = handbookEmbeddings.map((vec) => cosineSimilarity(vec, qEmbedding));  // Use cosine similarity here
  const topKIndices = similarities
    .map((sim, i) => [sim, i] as const)
    .sort((a, b) => b[0] - a[0])  
    .slice(0, k)
    .map(([, i]) => i);  
  return topKIndices.map((i) => handbookChunks[i]); 
}

async function init() {
  if (!handbookChunks.length) {
    handbookChunks = await loadTextChunks();
    handbookEmbeddings = await embedChunks(handbookChunks);
  }
}

export const POST: RequestHandler = async ({ request }) => {
  const { question } = await request.json();

  try {
    await init();
    const topChunks = await retrieveTopK(question); 
    const prompt = `
You are a Lasallian student disciplinary officer.
Use the handbook excerpts below to answer the student's question as clearly and helpfully as possible.
Use hood slang but be factual.

--- Handbook Context ---
${topChunks.join('\n\n')}

--- Student Question ---
${question}
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new Response(JSON.stringify({ answer: text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
