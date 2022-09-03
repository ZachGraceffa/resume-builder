<script lang='ts'>
    import type { Resume } from '../types/Resume'
    export let resumeData: Resume
</script>

<article>
    {#if resumeData}
    <header class='rel'>
        <h1>{resumeData.name}</h1>
        <div class='abs-tr'>
            {#if resumeData.email}
            <p>{resumeData.email}</p>
            {/if}
            {#if resumeData.phone}
            <p>{resumeData.phone}</p>
            {/if}
            {#if resumeData.website}
            <p>{resumeData.website}</p>
            {/if}
        </div>
    </header>
    <main>
        {#if resumeData.bio }
        <h2>Bio</h2>
        <hr />
        <p class='description'>{resumeData.bio}</p>
        {/if}
        {#if resumeData.jobs }
        <h2>Work Experience</h2>
        <hr />
        {/if}
        {#each resumeData.jobs as job}
        <div class='rel'>
            <h3>{job.title}</h3>
            <h4>{job.organization}</h4> - <span>{job.location}</span>
            <span class='abs-tr'>{job.duration}</span>
            <p class='description description-work'>{job.description}</p>
        </div>
        {/each}
        {#if resumeData.education }
        <h2>Education History</h2>
        <hr />
        {/if}
        {#each resumeData.education as institution}
        <div class='rel'>
            <h3>{institution.name}</h3>
            <h4>{institution.degree}</h4> - <span>{institution.location}</span>
            <span class='abs-tr'>{institution.year}</span>
        </div>
        {/each}
    </main>
    {/if}
</article>

<style>
    h1 {
        font-size: 48px;
    }
    h2 {
        margin-bottom: 0px;
    }
    hr {
        margin-top: 2px;
        margin-bottom: 16px;
    }
    h3 {
        margin-bottom: 8px;
    }
    h4 {
        display: inline;
    }
    header > div > p {
        margin: 0;
    }
    .rel {
        position: relative;
    }
    .abs-tr {
        position: absolute;
        top: 0;
        right: 0;
        text-align: right;
    }
    .description {
        margin: 8px 0 24px;
    }
    .description-work {
        width: 85%;
    }
</style>