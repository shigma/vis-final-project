<script>
const maildata = require('../dist/mails.json');
const userdata = require('../dist/users.json');
module.exports = {
    props: ['mails', 'startDate', 'endDate'],
    computed: {
    },
    methods: {
        onClick(id) {
            this.$root.setCard('thread', { id: this.dataset.mails[id].threadId })
        },
        writer(id){
            return userdata[maildata[id].userId].name;
        },
        subject(id){
            return maildata[id].subject;
        },
        date(id){
            let d = new Date(maildata[id].date);
            return d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate();
        },
    },
}

</script>

<template>
    <div class="mail-list">
        <div v-for="(mail, index) in mails" :key="index" @click="onClick(mail)">
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
