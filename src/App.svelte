<script lang='ts'>
	export let resumeType

	import { onMount } from 'svelte'
	import ResumeTemplateZG from './components/ResumeZG.svelte'
	import ResumeTemplateBase from './components/BaseResume.svelte'
	import LetterPaper from './components/LetterPaper.svelte'
	import type { Resume } from './types/Resume'
	import resumeJson from '../public/resumes/optimizely.json'

	let resumeData = resumeJson as Resume
</script>

<main>
	<LetterPaper>
	{#if resumeType === 'ZG'}
		<ResumeTemplateZG resumeData={resumeData}/>
	{:else if resumeType === 'Base'}
		<ResumeTemplateBase resumeData={resumeData} />
	{/if}
	</LetterPaper>
</main>