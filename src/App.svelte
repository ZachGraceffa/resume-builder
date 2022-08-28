<script lang="ts">
	export let resumeType: string
	import ResumeTemplateZG from './components/ResumeZG.svelte'
	import type { Resume } from './types/iResume'
	let fs = require('fs')

	let resumeData: Resume
	fs.readFile('../public/resumes/general-back-end.json', (err, data) =>{
		resumeData = JSON.parse(data.toString())
	})
</script>

<main>
	{#if resumeType === 'ZG'}
		<ResumeTemplateZG resumeData={resumeData} />
	{/if}
</main>