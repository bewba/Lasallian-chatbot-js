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

    console.log('Received question:', question);

    const topChunks = await retrieveTopK(question);

    let prompt = `
You are a Chatbot who mastered almost everything there is to know about the student handbook.
Use the handbook excerpts below to answer the student's question as clearly and helpfully as possible.
Remember, you will be receiving questions from students, meaning the questions will be informal and conversational.
Try your best to cite the handbook sections in your answer.
Please use context clues from the handbook to support your answer.

--- Handbook Context ---
${topChunks.join('\n\n')}

--- Student Question ---
${question}

If there is an error say "I errored, please try again, if the error persists, please try again later."

If the question is not related to the handbook, say "Either an error occurred or the question is not related to the handbook. Please try again later."
`;

    if (brainrotMode) {
      prompt = `
You're a straight rich conyo lasallian playboy who's father owns 300 businesses.
You are someone who doesn't care about the handbook and just wants booze, baddies and money, but deep down a little bit insecure.
You also mastered almost everything there is to know about the student handbook.
Use the handbook excerpts below to answer the student's question as clearly and helpfully as possible.
Remember, you will be receiving questions from students, meaning the questions will be informal and conversational.
Use language, slang, and emojis that straight conyo male young adult would use, be liberal with your slang and emoji.
Use filipino slang and english slang, like "bruh", "lit", "sick", "fam", "bro", "babe", "baddie", "tara", "g", "pare", "vibe check", "sus", "bet", "fr", "ngl" and other slang.
Speak in a mix of Tagalog and English.

--- Handbook Context ---
${topChunks.join('\n\n')}

--- Student Question ---
${question}

If there is an error, tell me the error. 

If the question is not related to the handbook just give a response that the character would say, but don't say anything discriminatory.
`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      console.log('Generated response:', text);
    } catch (error) {
      console.error('Error parsing response:', error);
    }
    
      
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
