<script>

module.exports = {
    props: ['open', 'mail'],

    data: () => ({
        text: '',
    }),

    components: {
        CollapseView: require('./CollapseView.vue'),
    },

    async created() {
        this.text = await this.getMailText(this.mail.id)
    },
}

</script>

<template>
    <collapse-view class="mail-view" :open="open" @toggle="$emit('toggle')">
        <template slot="header">
            <div class="subject">{{ mail.subject }}</div>
            <div class="mail-info">{{ mail.date }}, by {{ dataset.users[mail.userId].name }}</div>
        </template>
        <pre v-html="text"/>
    </collapse-view>
</template>

<style lang="scss">

.mail-view {
    font-size: 2vh;
    padding: 0.6vh 0.6vw;
    transition: 0.3s ease;
    border-top: 1px solid #ebeef5;

    &:hover {
        background: #f5f7fa;
    }

    pre {
        margin: 1vh 0;
        font-family: inherit;
        white-space: pre-wrap;
    }

    .subject {
        font-size: 2.4vh;
        font-weight: bold;
    }

    .mail-info {
        color: #606266;
    }
}

</style>
