<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
  
	// Only run this in the browser
	if (typeof window !== 'undefined') {
	  import('@vercel/analytics/sveltekit').then(({ injectAnalytics }) => {
		injectAnalytics({ mode: dev ? 'development' : 'production' });
	  });
	}
  </script>
  
  <slot />
  