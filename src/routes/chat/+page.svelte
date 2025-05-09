<script lang="ts">
    import { onMount } from 'svelte';
    import { addMessage, messages } from '$lib/stores/chat.js';
    let input = '';
    let loading = false;
  
    async function sendMessage() {
      if (!input.trim()) return;
      addMessage({ role: 'user', content: input });
      loading = true;
      const res = await fetch('/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      });
      const { answer, error } = await res.json();
      loading = false;
      addMessage({ role: 'assistant', content: error || answer });
      input = '';
    }
  </script>
  
  <h1 class="text-3xl font-bold mb-6 text-center">📘 Which DLSU rule am I breaking?
  </h1>
  
  <div class="space-y-4 mb-6">
    {#each $messages as msg}
      <div class={`p-4 rounded-xl max-w-xl ${msg.role === 'user' ? 'bg-green-100 self-end ml-auto' : 'bg-blue-100 self-start mr-auto'}`}>
        <p class="whitespace-pre-wrap">{msg.content}</p>
      </div>
    {/each}
  </div>
  
  <form class="flex flex-col gap-4" on:submit|preventDefault={sendMessage}>
    <textarea
      class="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
      bind:value={input}
      placeholder="Ask something about the student handbook..."
    ></textarea>
    <button
      type="submit"
      class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl disabled:opacity-50"
      disabled={loading}>
      Send
    </button>
  </form>
  
  {#if loading}
    <p class="mt-4 text-gray-500 text-center">✍️ Thinking...</p>
  {/if}
  