<script lang="ts">
  import { onMount } from 'svelte';
  import { addMessage, messages } from '$lib/stores/chat.js';
  import { isDarkMode, toggleTheme } from '$lib/stores/theme.js';
  import { marked } from 'marked';
  import { get } from 'svelte/store';
  import  formatMessages  from '$lib/util/formatHistory.js';

  let input: string = '';
  let loading = false;
  let chatContainer: HTMLDivElement;
  let showModal = false;
  let showModal2 = false;
  let showPromptButtons = true;
  let brainrotMode = true;
  let outOfApiCalls = false;
  

  const samplePrompts = [
    "What's the dress code policy?",
    "How do I qualify for Latin Honors?",
  ];

  onMount(async () => {
    scrollToBottom();

    const check = await fetch('/chat/status');
    const { outOfCalls } = await check.json();
    if (outOfCalls) {
      outOfApiCalls = true;
      return;
    }

    await fetch('/chat/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'ping6969lol', brainrotMode: false })
    });

    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) textarea.focus();
    }, 100);
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
    showPromptButtons = false;
    input = prompt;
    sendMessage(prompt);
  }

  async function sendMessage(garbage?: any) {
    if (input.length < 1) return;

    const history = formatMessages(get(messages));
  

    let messageToSend = input

    showPromptButtons = false;
    addMessage({ role: 'user', content: messageToSend });
    loading = true;
    input = '';

    const res = await fetch('/chat/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: messageToSend, brainrotMode, history })
    });

    const { answer, error } = await res.json();
    loading = false;

    if (error?.includes('out of API calls')) {
      outOfApiCalls = true;
      return;
    }

    addMessage({ role: 'assistant', content: error || answer });
  }

  function toggleBrainrotMode() {
    brainrotMode = !brainrotMode;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
</script>


<svelte:head>
  <title>AnimoAsks</title>
  <meta name="description" content="AnimoAsks - A student made AI-powered chatbot to answer all your student handbook related queries" />
  <meta name="keywords" content="AnimoAsks, DLSU chatbot, DLSU handbook" />
  <link rel="icon" href="/favicon.ico" />

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="AnimoAsks" />
    <meta property="og:description" content="A student-made AI chatbot answering questions from the Lasallian student handbook." />
    <meta property="og:image" content="https://animoasks.vercel.app/chat/preview.png" />
    <meta property="og:url" content="https://animoasks.vercel.app/" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

  <div class={`h-screen w-full flex flex-col transition-colors duration-200 ${$isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
<header class="bg-[#006937] text-white py-4 px-4 shadow-lg">
  <div class="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-y-4">
    <!-- Title -->
    <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold flex items-center gap-3">
      <span class="text-4xl">📘</span> Which DLSU rule am I breaking?
    </h1>

    <!-- Right Side Actions -->
    <div class="flex items-center gap-2 sm:gap-4">
      <!-- Terms -->
      <button on:click={() => showModal = true}
        class="text-sm underline hover:text-green-200 whitespace-nowrap cursor-pointer">
        Terms & Conditions
      </button>

      <!-- Dark Mode Toggle -->
      <button on:click={toggleTheme}
        class="p-2 rounded-lg hover:bg-[#005128] transition-colors duration-200 cursor-pointer"
        aria-label="Toggle theme">
        {#if $isDarkMode}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        {/if}
      </button>

      <!-- Brainrot Toggle -->
      <button on:click={toggleBrainrotMode}
        class="text-sm sm:text-md px-3 py-2 rounded-lg hover:bg-[#005128] transition-colors duration-200 cursor-pointer">
        {#if brainrotMode}
          😎 Switch to Nerd Mode 
        {:else}
          🧠 Switch to Conyo Mode
        {/if}
      </button>

      <button on:click={() => showModal2 = true}
        class="text-sm underline hover:text-green-200 whitespace-nowrap cursor-pointer">
        Contact Me!
      </button>
    </div>
  </div>
</header>


    <main class="flex flex-col flex-1 w-full mx-auto px-12 py-4 gap-4 overflow-hidden">
      <div bind:this={chatContainer} class={`flex-1 w-full overflow-y-auto px-1 py-2 space-y-4 rounded-lg shadow-inner ${$isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {#each $messages as msg}
          <div class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}>
            {#if msg.role === 'assistant'}
              <div class="text-xl pt-1">🤖</div>
            {/if}
            <div class={`p-4 rounded-2xl max-w-[80%] shadow 
              ${msg.role === 'user' 
                ? 'bg-[#006937] text-white' 
                : ($isDarkMode 
                    ? 'bg-gray-700 text-white border border-[#00915c]' 
                    : 'bg-white border border-[#006937] text-gray-800')}`}>
              <div class="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed">
                {@html marked.parse(msg.content)}
              </div>              
            </div>
            {#if msg.role === 'user'}
              <div class="text-xl pt-1">👤</div>
            {/if}
          </div>
        {/each}

        {#if loading}
          <div class="flex justify-start ml-2">
            <div class={`p-4 rounded-2xl shadow-sm animate-pulse ${$isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p class={$isDarkMode ? 'text-gray-300' : 'text-gray-500'}>✍️ Thinking...</p>
            </div>
          </div>
        {/if}
      </div>

      {#if showPromptButtons}
        <div class="flex flex-wrap gap-3 mb-4">
          {#each samplePrompts as prompt}
            <button on:click={() => useSamplePrompt(prompt)} class={`px-4 py-2 rounded-full shadow-sm text-sm font-medium transition-all duration-200
              border border-transparent hover:shadow-md hover:cursor-pointer
              ${$isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-300'}`}>
              {prompt}
            </button>
          {/each}
        </div>
      {/if}

      <div class="sticky bottom-0 bg-inherit z-10 pt-2">
        <form on:submit|preventDefault={sendMessage} class={`flex flex-col gap-4 p-4 rounded-lg shadow-lg ${$isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <textarea
            class={`w-full p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006937] min-h-[100px] resize-none
              transition-colors duration-200 text-base leading-relaxed
              ${$isDarkMode ? 'bg-gray-700 text-white border border-gray-600 placeholder-gray-400' : 'bg-gray-100 text-gray-900 border border-gray-300 placeholder-gray-500'}`}
            bind:value={input}
            placeholder="Ask something about the student handbook..."
            on:keydown={handleKeydown}
          ></textarea>
          <button type="submit" class="bg-[#006937] hover:bg-[#005128] text-white py-3 px-6 rounded-xl font-semibold text-base md:text-lg transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] cursor-pointer">
            {loading ? 'Sending...' : 'Send Message'}
            {#if !loading}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            {/if}
          </button>
        </form>
      </div>
    </main>

  {#if showModal}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-0">
    <div class="bg-white dark:bg-gray-800 w-full max-w-2xl p-6 sm:p-8 rounded-2xl shadow-xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">    
      <button class="absolute top-3 right-4 text-xl font-bold hover:text-red-500 cursor-pointer" on:click={() => showModal = false}>&times;</button>
      <h2 class="text-xl font-bold mb-4">Terms and Conditions</h2>
      <p class="text-sm mb-4">Last updated: May 26, 2025</p>
      <div class="space-y-4 text-sm leading-relaxed">
        <div>
          <h3 class="font-semibold">1. Use of the Service</h3>
          <ul class="list-disc ml-5">
            <li>This Service is intended to provide helpful responses based on the Lasallian student handbook.</li>
            <li>It is <strong>not a substitute</strong> for official guidance from school administration or disciplinary officers.</li>
            <li>You are solely responsible for how you use the information provided.</li>
            <li>By using this Service, you agree to not hold the creator liable for any consequences arising from its use.</li>
            <li>Do not spam the bot with requests</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold">2. Data Handling</h3>
          <ul class="list-disc ml-5">
            <li>No user data is stored or shared. Questions and responses are processed live.</li>
            <li>Chat submissions along with the response generated by the AI are saved to ensure the quality of the AI</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold">3. Intellectual Property</h3>
          <ul class="list-disc ml-5">
            <li>All content generated by this Service is © 2025 Hans Emilio M. Lumagui.</li>
            <li>You may not copy, redistribute, or use this chatbot's content for commercial purposes without written permission.</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold">4. Limitations of Liability</h3>
          <ul class="list-disc ml-5">
            <li>The Service is provided "as is" without warranties of any kind.</li>
            <li>The creator is <strong>not liable</strong> for any actions taken based on the chatbot's output.</li>
            <li>Use at your own discretion.</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold">5. Changes</h3>
          <ul class="list-disc ml-5">
            <li>Terms may be updated at any time. Continued use of the Service means you accept the updated terms.</li>
          </ul>
        </div>
        <p>If you have questions or concerns, contact: <strong>hans_lumagui@dlsu.edu.ph</strong></p>
        <strong class="italic text-xs">Disclaimer: Responses were created by generative AI and responses may be inaccurate.</strong><br>
        <strong class="italic text-xs">Disclaimer: Responses are not representative of the creator.</strong>
        <br>
        <strong class="italic text-xs">Disclaimer: THIS IS NOT AN OFFICIAL DE LA SALLE UNIVERSITY CHATBOT.</strong>
      </div>
    </div>
  </div>
{/if}


{#if showModal2}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-0">
    <div class="bg-white dark:bg-gray-800 w-full max-w-2xl p-6 sm:p-8 rounded-2xl shadow-xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">    
      <button class="absolute top-3 right-4 text-xl font-bold hover:text-red-500 cursor-pointer" on:click={() => showModal2 = false}>&times;</button>
      <h2 class="text-xl font-bold mb-4">Let's build a cool app together!</h2>
      <div class="space-y-4 text-sm leading-relaxed">
        <div>
          <h3><strong>Email:</strong> hans_lumagui@dlsu.edu.ph</h3>
          <h3><strong>Contact Number:</strong> 09270251730</h3>
        </div>
        <p class= "italic">Have an app idea or a suggestion for the website? lmk, i'd love to hear from u!</p>
      </div>
    </div>
  </div>
{/if}

  </div>

  {#if outOfApiCalls}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
    <div class="bg-white dark:bg-gray-800 max-w-md w-full p-6 rounded-2xl shadow-xl relative animate-fadeIn">
      <h2 class="text-xl font-bold mb-4 text-red-600 dark:text-red-400">API Limit Reached</h2>
      <p class="text-sm leading-relaxed">
        We have used up of our available API calls for now. Please try again later, or contact the developer if you believe this is a mistake.
      </p>
      <div class="mt-4 text-right">
        <button class="px-4 py-2 bg-[#006937] text-white rounded hover:bg-[#005128]" on:click={() => outOfApiCalls = false}>
          Close
        </button>
      </div>
    </div>
  </div>
{/if}


  <style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  /* Custom Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #006937;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #004d2d;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  @media (max-width: 640px) {
    textarea {
      font-size: 0.95rem;
    }
  }
  </style>
