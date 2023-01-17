import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		resumeType: 'Base',
		resumeJsonFile: 'optimizely'
	}
});

export default app;