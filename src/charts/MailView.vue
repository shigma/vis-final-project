<script>

module.exports = {
    props: ['open', 'mail', 'showText'],

    data: () => ({
        text: '',
    }),

    components: {
        CollapseView: require('./CollapseView.vue'),
    },

    async created() {
        this.text = this.showText ? await this.getMailText(this.mail.id) : ''
    },

    methods: {
        getUserName(id) {
            return this.dataset.users[id].name
        },
    },
}

</script>

<template>
    <collapse-view class="mail-view" :open="open" @toggle="$emit('toggle')">
        <template slot="header">
            <div class="subject">{{ mail.subject }}</div>
            <div class="mail-info">{{ mail.date }}, by {{ getUserName(mail.userId) }}</div>
        </template>
        <pre v-html="text"/>
        <div class="further" v-if="mail.inReplyTo">
            <span class="header">In reply to: </span>
            <a @click="$emit('navigate', mail.inReplyTo)">{{ getUserName(dataset.mails[mail.inReplyTo].userId) }}</a>
        </div>
        <div class="further" v-if="mail.replies">
            <span class="header">Replied by: </span>
            <ul>
                <li v-for="id in mail.replies" :key="id"
                    @click="$emit('navigate', id)">{{ getUserName(dataset.mails[id].userId) }}</li>
            </ul>
        </div>
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

    .further {
        margin: 1vh 0;

        span.header {
            font-size: 2.2vh;
            font-weight: bold;
        }

        ul {
            margin: 1vh 0;
        }

        a, li {
            line-height: 1;
            color: blue;
            cursor: pointer;

            &:hover {
                text-decoration: underline;
            }
        }
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
