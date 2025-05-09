import { json } from '@sveltejs/kit';

export const GET = async () => {
  const outOfCalls = false;
  return json({ outOfCalls });
};
