<script>

const NeatScroll = require('neat-scroll')

module.exports = {
    props: ['mails', 'startDate', 'endDate', 'triggerThread'],

    data: () => ({
        activeId: null,
        activeIndex: -1,
        activeText: '',
        currentText: '',
    }),

    components: {
        CollapseView: require('./CollapseView.vue'),
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
    },

    watch: {
        filteredMails(value) {
            this.activeIndex = value.indexOf(this.activeId)
            if (this.activeIndex < 0) this.activeId = null
        },
    },

    mounted() {
        this.neatScroll = new NeatScroll(this.$refs.list, {
            speed: 200,
            smooth: 24,
        })
    },

    methods: {
        getMail(id) {
            return this.dataset.mails[id]
        },
        handleClick(id, index) {
            if (this.triggerThread === undefined) {
                if (this.activeIndex === index) {
                    this.activeIndex = -1
                    this.activeId = null
                } else {
                    this.currentText = this.activeText
                    this.activeText = this.getMailText(id)
                    this.activeIndex = index
                    this.activeId = id
                }
            } else {
                this.$root.setCard('thread', { id: this.getMail(id).threadId })
            }
        },
        handleScroll(event) {
            this.neatScroll.scrollByDelta(event.deltaY)
        },
        getAuthor(id) {
            return this.dataset.users[this.getMail(id).userId].name;
        },
        getDate(id) {
            return this.getMail(id).date
        },
    },
}

</script>

<template>
    <div class="mail-list">
        <div class="general-info">
            <div>Total Mails: {{ filteredMails.length }}</div>
        </div>
        <slot/>
        <div ref="list" class="list" @mousewheel.prevent.stop="handleScroll">
            <collapse-view class="mail" v-for="(id, index) in filteredMails" :key="id"
                :open="activeIndex === index" @toggle="handleClick(id, index)">
                <template slot="header">
                    <div class="subject">{{ dataset.mails[id].subject }}</div>
                    <div class="mail-info">{{ getDate(id) }}, by {{ getAuthor(id) }}</div>
                </template>
                {{ activeIndex === index ? activeText : currentText }}
            </collapse-view>
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

    .mail {
        font-size: 2vh;
        padding: 0.6vh 0.6vw;
        transition: 0.3s ease;
        border-top: 1px solid #ebeef5;

        &:hover {
            background: #f5f7fa;
        }

        .subject {
            font-size: 2.4vh;
            font-weight: bold;
        }

        .mail-info {
            color: #606266;
        }
    }

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
