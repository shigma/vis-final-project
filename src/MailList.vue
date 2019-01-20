<script>

const NeatScroll = require('neat-scroll')

module.exports = {
    props: ['mails', 'startDate', 'endDate', 'triggerThread'],

    computed: {
        filteredMails() {
            return this.mails.filter(id => {
                let d = this.getMail(id).date;
                let flag = true;
                if (this.startDate) flag &= d > this.startDate;
                if (this.endDate) flag &= d < this.endDate;
                //console.log(this.startDate + ';' + d + ',' + this.endDate + ';' + flag);
                return flag;
            }).sort((a, b) => {
                let d1 = this.getMail(a).date;
                let d2 = this.getMail(b).date;
                let ret = 0;
                if (d1>d2) ret = 1;
                if (d1<d2) ret = -1;
                //console.log(d1+':'+d2+':'+ret)
                return ret;
            });
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
        handleClick(id) {
            if (this.triggerThread === undefined) return
            this.$root.setCard('thread', { id: this.getMail(id).threadId })
        },
        handleScroll(event) {
            this.neatScroll.scrollByDelta(event.deltaY)
        },
        getAuthor(id){
            return this.dataset.users[this.getMail(id).userId].name;
        },
        getDate(id){
            const date = this.getMail(id).date
            return date;
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
            <div class="mail" v-for="id in filteredMails" :key="id" @click.left.stop="handleClick(id)">
                <div class="subject">{{ dataset.mails[id].subject }}</div>
                <div class="mail-info">{{ getDate(id) }}, By {{ getAuthor(id) }}</div>
            </div>
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
    user-select: none;

    .mail {
        cursor: pointer;
        font-size: 2vh;
        padding: 0.6vh 0.6vw;
        border-top: 1px solid #ebeef5;

        &:hover {
            background: #f5f7fa;
        }

        > .subject {
            font-size: 2.4vh;
            font-weight: bold;
        }

        > .mail-info {
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
