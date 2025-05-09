<script lang="ts">
    import { onMount } from 'svelte';
    import { addMessage, messages } from '$lib/stores/chat.js';
    import { isDarkMode, toggleTheme } from '$lib/stores/theme';
    
    let input = '';
    let loading = false;
    let chatContainer: HTMLDivElement;

    const samplePrompts = [
        "What's the dress code policy?",
        "How do I qualify for Latin Honors?",
    ];

    onMount(() => {
        scrollToBottom();
    });

    $: if ($messages) {
        setTimeout(scrollToBottom, 100);
    }

    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    function useSamplePrompt(prompt: string) {
        input = prompt;
    }
  
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

<div class={`min-h-screen flex flex-col transition-colors duration-200 ${$isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
    <header class="bg-[#006937] text-white py-6 px-4 shadow-lg relative">
        <div class="max-w-4xl mx-auto">
            <div class="absolute right-4 top-4">
                <button 
                    on:click={toggleTheme}
                    class="p-2 rounded-lg hover:bg-[#005128] transition-colors duration-200"
                    aria-label="Toggle theme"
                >
                    {#if $isDarkMode}
                        <!-- Sun icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    {:else}
                        <!-- Moon icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    {/if}
                </button>
            </div>
            <h1 class="text-3xl font-bold text-center flex items-center justify-center gap-3">
                <span class="text-4xl">📘</span> Which DLSU rule am I breaking?
            </h1>
            <p class="text-center mt-2 text-green-100 text-sm">Ask me about DLSU's rules and regulations</p>
        </div>
    </header>

    <main class="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        <div 
            bind:this={chatContainer} 
            class={`flex-1 overflow-y-auto mb-6 space-y-4 max-h-[60vh] p-4 rounded-lg shadow-inner
                ${$isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
            {#each $messages as msg}
                <div class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div class={`p-4 rounded-2xl max-w-[80%] shadow-sm
                        ${msg.role === 'user' 
                            ? 'bg-[#006937] text-white ml-auto' 
                            : ($isDarkMode 
                                ? 'bg-gray-700 text-white mr-auto border-2 border-[#00915c]'
                                : 'bg-white border-2 border-[#006937] text-gray-800 mr-auto')}`}>
                        <p class="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{msg.content}</p>
                    </div>
                </div>
            {/each}
            {#if loading}
                <div class="flex justify-start">
                    <div class={`p-4 rounded-2xl shadow-sm animate-pulse ${$isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p class={$isDarkMode ? 'text-gray-300' : 'text-gray-500'}>✍️ Thinking...</p>
                    </div>
                </div>
            {/if}
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
            {#each samplePrompts as prompt}
                <button
                    on:click={() => useSamplePrompt(prompt)}
                    class={`text-sm px-3 py-1.5 rounded-full transition-colors duration-200
                        ${$isDarkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                    {prompt}
                </button>
            {/each}
        </div>

        <form 
            class={`flex flex-col gap-4 p-6 rounded-lg shadow-lg
                ${$isDarkMode ? 'bg-gray-800' : 'bg-white'}`} 
            on:submit|preventDefault={sendMessage}
        >
            <textarea
                class={`w-full p-4 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006937] focus:border-[#006937] min-h-[100px] transition-colors duration-200
                    ${$isDarkMode 
                        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                        : 'bg-gray-50 text-gray-700 border-gray-200 placeholder-gray-500'}`}
                bind:value={input}
                placeholder="Ask something about the student handbook..."
            ></textarea>
            <button
                type="submit"
                class="bg-[#006937] hover:bg-[#005128] text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
                {#if !loading}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                {/if}
            </button>
        </form>
    </main>
</div>