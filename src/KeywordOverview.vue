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
        <h2>关键词信息</h2>
        <keyword-user-cloud></keyword-user-cloud>
    </div>
</template>

<style>
#keyword-overview {
    border-style: solid;
    font-family: sans-serif;
}
</style>
