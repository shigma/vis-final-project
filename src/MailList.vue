<script>
const maildata = require('../dist/mails.json');
const userdata = require('../dist/users.json');
module.exports = {
    props: ['mails', 'startDate', 'endDate', 'triggerThread'],
    computed: {
    },
    methods: {
        mailFilter() {
            return this.mails.filter(id => {
                let d = maildata[id].date;
                let flag = true;
                if (this.startDate) flag &= d > this.startDate;
                if (this.endDate) flag &= d < this.endDate;
                console.log(this.startDate + ';' + d + ',' + this.endDate + ';' + flag);
                return flag;
            }).sort((a, b) => {
                let d1 = maildata[a].date;
                let d2 = maildata[b].date;
                let ret = 0;
                if (d1>d2) ret = 1;
                if (d1<d2) ret = -1;
                //console.log(d1+':'+d2+':'+ret)
                return ret;
            });
        },
        onClick(id) {
            if (this.triggerThread === undefined) return
            this.$root.setCard('thread', { id: this.dataset.mails[id].threadId })
        },
        writer(id){
            return userdata[maildata[id].userId].name;
        },
        subject(id){
            return maildata[id].subject;
        },
        date(id){
            return maildata[id].date;
        },
    },
}

</script>

<template>
    <div class="mail-list">
        <div v-for="(mail, index) in mailFilter()" :key="index" @click="onClick(mail)">
            Date: {{ date(mail) }} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Writer: {{ writer(mail) }} <br> Subject: {{ subject(mail) }}
        </div>
    </div>
</template>

<style lang="scss">

.mail-list {
    overflow-x: hidden;
    overflow-y: scroll;
}

</style>
