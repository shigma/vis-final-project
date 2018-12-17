<template>

</template>
    
<script>
    const IRT = require('./dist/inreplytoTable.json');
    module.exports = {
        el : '#MailInReplyTo',
        data: () => ({
            SelectMailID : 2,
            ParentMailID : IRT[SelectMailID].p,
            InReplyToMailID : IRT[SelectMailID].irt_id
        }),
        methods: {
            MainMail : function(){
                return SelectMailID;
            }
        },
        components: {
            'SelectedMail': () => ({
                template: '<h1> selected mail ID : {{ MainMail() }}</h1>'
            })
        }
    }
</script>

<style>

</style>


