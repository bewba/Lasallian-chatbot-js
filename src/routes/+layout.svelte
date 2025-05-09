<script lang="ts">
	import { injectAnalytics } from '@vercel/analytics/sveltekit'
	import '../app.css';

	injectAnalytics({ mode: dev ? 'development' : 'production' });
	let { children } = $props();
</script>

{@render children()}
