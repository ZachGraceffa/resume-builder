<script>
	export let resumeType
	import ResumeTemplateZG from './components/ResumeZG.svelte'
	import resumeData from '../public/resumes/general-back-end.json'
</script>

<main>
	{#if resumeType === 'ZG'}
		<ResumeTemplateZG resumeData={resumeData} />
	{/if}
</main>