import { json } from '@sveltejs/kit';

// hello stop stealing my source code
export const GET = async () => {
  const outOfCalls = false;
  return json({ outOfCalls });
};
