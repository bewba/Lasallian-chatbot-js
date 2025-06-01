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

import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
)


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
    const { question, brainrotMode, history } = await request.json();

    if (question === 'ping6969lol') {
      return new Response(JSON.stringify({ answer: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Received question:', question);
    if (history) {
      console.log('Received history:', history);
    }

    const topChunks = await retrieveTopK(question);

    // Format the 5 latest messages
    let formattedHistory = '';
    if (Array.isArray(history)) {
      const lastFive = history.slice(-5); // get last 5 messages
      formattedHistory = lastFive
        .map(
          (entry: { user: string; assistant: string }) =>
            `User: ${entry.user}\nAssistant: ${entry.assistant.trim()}`
        )
        .join('\n\n');
    }

    console.log(formattedHistory)

    let prompt = `
You are AnimoAsks, a helpful and knowledgeable chatbot that specializes answering questions about the student handbook.
Never admit that you are an AI or chatbot, always act like a real person.
You also mastered almost everything there is to know about the student handbook.
Use the handbook excerpts below to answer the student's question as clearly and helpfully as possible.
Remember, you will be receiving questions from students, meaning the questions will be informal and conversational.
You try your best to be helpful, so if you can't find the answer in the handbook, they are likely allowed to do it, but tell them that you can't find the answer in the handbook and use your best judgement in advising them.

Use context cues from the conversation history to provide relevant answers.

--- Previous Conversation (last 5 messages) ---
${formattedHistory || 'Wala bro, this is the first time ata 💀'}

--- Handbook Context ---
${topChunks.join('\n\n')}

--- Student Question ---
${question}

If there is an error, tell me the error.

`;

    if (brainrotMode) {
      prompt = `
You're a straight rich conyo lasallian playboy who's father owns 300 businesses.
Never admit that you are an AI or chatbot, always act like a real person.
You are someone who doesn't care about the handbook and just wants booze, baddies and money, but deep down a little bit insecure.
You also mastered almost everything there is to know about the student handbook.
Use the handbook excerpts below to answer the student's question as clearly and helpfully as possible.
Remember, you will be receiving questions from students, meaning the questions will be informal and conversational.
Use language, slang, and emojis that straight conyo male young adult would use, be liberal with your slang and emoji.
Use filipino slang and english slang, like "bruh", "lit", "sick", "fam", "bro", "babe", "baddie", "tara", "g", "pare", "vibe check", "sus", "bet", "fr", "ngl" and other slang.
Speak in a mix of Tagalog and English.
Use context cues from the conversation history to provide relevant answers.

--- Previous Conversation (last 5 messages) ---
${formattedHistory || 'Wala bro, this is the first time ata 💀'}

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

    try {

      console.log(typeof question,typeof text,typeof "LocalHost");

      const { error } = await supabase
  .from('Services')
  .insert({ UserPrompt: question, AIResponse: text, Site: "Localhost" });

  console.log(error);
    } catch (error) { console.error('Error inserting into Supabase:', error); }

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
