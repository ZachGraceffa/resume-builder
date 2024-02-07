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
        <section>
            <h2>Bio</h2>
            <hr />
            <p class='description'>{resumeData.bio}</p>
        </section>
        {/if}
        {#if resumeData.jobs }
        <section>
            <h2>Work Experience</h2>
            <hr />
            {#each resumeData.jobs as job}
            <div class='rel'>
                <h3>{job.title}</h3>
                <h4>{job.organization}</h4> <span> · {job.location}</span>
                <span class='abs-tr'>{job.duration}</span>
                <ul>
                    {#each job.duties as duty}
                        <li>{duty}</li>
                    {/each}
                </ul>
            </div>
            {/each}
        </section>
        {/if}
        <section>
        {#if resumeData.certifications  && resumeData.certifications.length}
        <h2>Certifications</h2>
        <hr />
        {/if}
        {#each resumeData.certifications as certification}
        <div class="m-b">
            <div class='rel'>
                <h3>{certification.name}</h3>
                <h4>{certification.issuer}</h4>
                <span class='abs-tr'>{certification.duration}</span>
            </div>
        </div>
        {/each}
    </section>
        {#if resumeData.education }
        <section>
            <h2>Education History</h2>
            <hr />
            {#each resumeData.education as institution}
            <div class='rel'>
                <h3 class='inline'>{institution.name}</h3>
                <span> · {institution.location}</span>
                <span class='abs-tr'>{institution.year}</span>
                <h4 class='block mb-1'>{institution.degree}</h4>
                {#if institution.languagePath}
                <span><b>Language Path:</b> {institution.languagePath}</span>
                {/if}
            </div>
            {/each}
        </section>
        {/if}
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
        margin: 0px;
    }
    h4 {
        margin-top: 0;
        font-weight: 450;
        display: inline;
    }
    .block {
        display: block;
    }
    .inline {
        display: inline;
    }
    header > div > p {
        margin: 0;
    }
    section {
        margin-bottom: 32px;
    }
    ul {
        margin: 8px 0 16px;
    }
    li {
        margin: 4px 0;
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
        margin: 12px 0 24px;
    }
    .description-work {
        width: 85%;
    }
    .m-b {
        margin-bottom: 16px;
    }
    .mb-1 {
        margin-bottom: 8px;
    }
</style>