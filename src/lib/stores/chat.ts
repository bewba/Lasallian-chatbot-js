import { writable } from 'svelte/store';

export const messages = writable<{ role: 'user' | 'assistant'; content: string }[]>([]);

export function addMessage(message: { role: 'user' | 'assistant'; content: string }) {
  messages.update((msgs) => {
    return [...msgs, message];
  });
}
