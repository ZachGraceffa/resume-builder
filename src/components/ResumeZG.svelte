<script lang='ts'>
    import type { Resume } from '../types/Resume'
    export let resumeData: Resume
</script>

<article>
    <header>
        <h1>{resumeData.name}</h1>
        <p>{resumeData.email}</p>
        <p>{resumeData.phone}</p>
        <p>{resumeData.website}</p>
    </header>
    <main>
        {#if resumeData.jobs }
        <h2>Work Experience</h2>
        {/if}
        {#each resumeData.jobs as job}
        <div>
            <h3>{job.title}</h3>
            <span>{job.organization} - {job.location}</span>
            <span>{job.duration}</span>
            <p>{job.description}</p>
        </div>
        {/each}
        {#if resumeData.education }
        <h2>Education History</h2>
        {/if}
        {#each resumeData.education as institution}
        <div>
            <h3>{institution.name}</h3>
            <span>{institution.location}</span>
            <span>{institution.degree}</span>
            <span>{institution.year}</span>
        </div>
        {/each}
    </main>
</article>

<style>
    article {
        border: 1px solid black;
    }

    header > p {
        margin: 0;
    }
</style>