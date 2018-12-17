<template>
<div></div>
</template>
    
<script>
const IRT = require('./dist/inreplytoTable.json');
module.exports = {
    el: '#MailInReplyTo',
    data: () => ({
        SelectMailID: 2,
        ParentMailID: IRT[this.SelectMailID].p,
        InReplyToMailID: IRT[this.SelectMailID].irt_id,
    }),
    methods: {
        MainMail: function(){
            return this.SelectMailID;
        },
    },
    components: {
        'SelectedMail': () => ({
            template: '<h1> selected mail ID : {{ MainMail() }}</h1>',
        }),
    },
}
</script>

<style>

</style>


