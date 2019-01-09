<script>

/**
 * 
 */

module.exports = {
    props: {
        keyword: {
            required: true,
            type: String,
        }
    },
    components: {
        KeywordUserCloud: require('./KeywordUserCloud.vue'),
    },
    data: () => ({
        
    }),
    computed: {},
    mounted: function() {},
    updated: function() {},
    methods: {},
}

</script>

<template>
    <div id="keyword-overview">
        ASDF
        <keyword-user-cloud></keyword-user-cloud>
    </div>
</template>

<style>

</style>
