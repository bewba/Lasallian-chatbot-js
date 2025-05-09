<script lang="ts">
	import { injectAnalytics } from '@vercel/analytics/sveltekit'
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	
	injectAnalytics({ mode: dev ? 'development' : 'production' });

	injectAnalytics({ mode: dev ? 'development' : 'production' });
	let { children } = $props();
</script>

{@render children()}
