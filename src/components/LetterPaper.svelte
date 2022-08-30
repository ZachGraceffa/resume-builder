<script lang='ts'>
    /// Component that represents a Letter size paper (8.5" x 11") with .75" margins
</script>

<div>
    <slot />
</div>

<style>
    div {
        height: 1056px; /* 11"  */
        width: 816px; /* 8.5" */
        padding: 72px; /* .75" margins */
    }
</style>