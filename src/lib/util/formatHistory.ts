import type { Writable } from 'svelte/store';  

import { writable } from 'svelte/store';
export default function formatMessages(
  messageList: { role: 'user' | 'assistant'; content: string }[]
): { user: string; assistant: string }[] {
  const history: { user: string; assistant: string }[] = [];

  for (let i = 0; i < messageList.length; i++) {
    const msg = messageList[i];
    if (msg.role === 'user') {
      history.push({ user: msg.content, assistant: '' });
    } else if (msg.role === 'assistant' && history.length > 0) {
      history[history.length - 1].assistant = msg.content;
    }
  }

  return history;
}
