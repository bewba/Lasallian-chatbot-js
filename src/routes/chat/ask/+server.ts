import type { RequestHandler } from '@sveltejs/kit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { pipeline } from '@xenova/transformers';
import dotenv from 'dotenv';
import { cosineSimilarity } from '$lib/util/mathisfrickingstupid.js';

// Load chunks and embeddings
import handbookChunks from '$lib/chunks/chunks.json' with { type: 'json' };
import tralaleroTralala from '$lib/embeddings/embeddings.json' with { type: 'json' };

// Type the handbookEmbeddings after import
const handbookEmbeddings: number[][] = tralaleroTralala as number[][];

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
let extractor: any;

async function retrieveTopK(question: string, k = 3): Promise<string[]> {
  extractor = extractor || (await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'));

  const output = await extractor(question, { pooling: 'mean', normalize: true });

  const qEmbedding = Array.isArray(output.data)
    ? output.data.flat()
    : Array.from(output.data);

  const similarities = handbookEmbeddings.map((vec) => cosineSimilarity(vec, qEmbedding));
  const topKIndices = similarities
    .map((sim, i) => [sim, i] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, k)
    .map(([, i]) => i);

  console.log(topKIndices.map((i) => handbookChunks[i]))

  return topKIndices.map((i) => handbookChunks[i]);
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { question, brainrotMode } = await request.json();

    if (question === 'ping6969lol') {
      return new Response(JSON.stringify({ answer: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const topChunks = await retrieveTopK(question);

    let prompt = `
You are a Lasallian student disciplinary officer.
Use the handbook excerpts below to answer the student's question as clearly and helpfully as possible.
Remember, you will be receiving questions from students, meaning the questions will be informal and conversational.
Please use context clues from the handbook to support your answer.

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
Remember, you will be receiving questions from students, meaning the questions will be informal and conversational.
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
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
