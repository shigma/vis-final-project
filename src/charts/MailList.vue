<script>

const NeatScroll = require('neat-scroll')

module.exports = {
    props: ['mails', 'startDate', 'endDate', 'triggerThread', 'origin', 'mailId'],

    data: () => ({
    }),

    components: {
        MailView: require('./MailView.vue'),
    },

    computed: {
        filteredMails() {
            return this.mails.filter(id => {
                let d = this.getMail(id).date;
                let flag = true;
                if (this.startDate) flag &= d > this.startDate;
                if (this.endDate) flag &= d < this.endDate;
                return flag;
            }).sort((a, b) => {
                const d1 = this.getMail(a).date;
                const d2 = this.getMail(b).date;
                return d1 > d2 ? 1 : d1 < d2 ? -1 : 0;
            });
        },
        isThread() {
            return this.triggerThread === undefined
        },
    },

    mounted() {
        this.neatScroll = new NeatScroll(this.$refs.list, {
            speed: 200,
            smooth: 18,
        })
    },

    methods: {
        getMail(id) {
            return this.dataset.mails[id]
        },
        handleClick(id) {
            this.$root.setCard('thread', {
                id: this.getMail(id).threadId,
                mailId: this.isThread && this.mailId === id ? null : id,
            })
        },
        handleScroll(event) {
            this.neatScroll.scrollByDelta(event.deltaY)
        },
    },
}

</script>

<template>
    <div class="mail-list">
        <div class="general-info">
            <div>Total Mails: {{ filteredMails.length }}</div>
            <slot name="general-info"/>
        </div>
        <slot/>
        <div ref="list" class="list" @mousewheel.prevent.stop="handleScroll">
            <mail-view v-for="id in filteredMails" :key="id" :mail="dataset.mails[id]"
                :open="mailId === id" @toggle="handleClick(id)" :show-text="isThread" @navigate="handleClick"/>
        </div>
    </div>
</template>

<style lang="scss">

.mail-list {
    display: flex;
    flex-direction: column;
}

.general-info {
    font-size: 2.4vh;
    padding: 0.6vh 0.6vw;
}

.list {
    overflow-x: hidden;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 0.6em;
        height: 0.4em;
    }

    &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.2);
        border-radius: 0.6em;
    }

    &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 0.6em;
    }
    
    &::-webkit-scrollbar-track:hover {
        -box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
    }

    &::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.3);
    }
}

</style>
