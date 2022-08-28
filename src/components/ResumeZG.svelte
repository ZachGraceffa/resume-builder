<script>
    export let resumeData
</script>

<article>
    <header>
        <h1>{resumeData.name}</h1>
        <p>{resumeData.email}</p>
        <p>{resumeData.phone}</p>
        <p>{resumeData.website}</p>
    </header>
    <main>
        {#each resumeData.jobs as job, i}
        <div>
            <h2>{job.title}</h2>
        </div>
        {/each}
    </main>
</article>