<script lang='ts'>
	export let resumeType
	import ResumeTemplateZG from './components/ResumeZG.svelte'
	import ResumeTemplateBase from './components/BaseResume.svelte'
	import LetterPaper from './components/LetterPaper.svelte'
	import type { Resume } from './types/Resume'
	import resumeJson from '../public/resumes/general-back-end.json'

	let resumeData = resumeJson as Resume
</script>

<main>
	<LetterPaper>
	{#if resumeType === 'ZG'}
		<ResumeTemplateZG resumeData={resumeData} />
	{:else if resumeType === 'Base'}
		<ResumeTemplateBase resumeData={resumeData} />
	{/if}
	</LetterPaper>
</main>