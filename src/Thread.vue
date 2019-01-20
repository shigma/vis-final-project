<script>

const userdata = require('../dist/users');
const maildata = require('../dist/mails');
const threaddata = require('../dist/threads');
const trie = require('./keywordTrie');
const keyword_top100 = require('../dist/keywords_top100');

module.exports = {
    props: ['data'],
    data: () => ({
        keywordSet: [],
        keywordValue: [],
        DFAtree: [],
    }),
    computed: {
        thread() {
            return threaddata[typeof this.data.id === 'number' ? this.data.id : 2339]
        },
        owner(){
            let fmid = this.thread.mails[0];
            let ownerid = maildata[fmid].userId;
            return userdata[ownerid].name;
        },
        tabledata(){
            let data = [];
            let size = this.thread.mails.length;
            for (let i=0; i<size; i++){
                let mId = this.thread.mails[i];
                let tmp = new Object();
                tmp.date = this.dateTrans(maildata[mId].date);
                tmp.subject = maildata[mId].subject;
                tmp.user = userdata[maildata[mId].userId].name;
                tmp.references = maildata[mId].references
                data.push(tmp);
            }
            return data;
        },
        mailIds(){
            return this.thread.mails;
        },
        relatedUsers(){
            let data = [];
            let users = this.thread.users;
            let size = users.length;
            for (let i=0; i<size; i++){
                data.push({
                    id: users[i].id,
                    value: users[i].mails.length,
                    name: userdata[users[i].id].name,
                });
            }
            data.sort((a, b) => {
                if (a.value > b.value) return 1;
                if (a.value < b.value) return -1;
                return 0;
            })
            return data;
        },
    },
    watch: {
        thread: 'updateKeywordValue',
    },
    created() {
        this.DFAtree = trie.initTree(this.DFAtree);
        let ksize = keyword_top100.length;
        for (let i=0; i<ksize; i++){
            this.keywordSet.push(keyword_top100[i].name);
        }
        let size = this.keywordSet.length;
        for (let i=0; i<size; i++){
            this.DFAtree = trie.insert(this.DFAtree, this.keywordSet[i], i);
        }
        this.DFAtree = trie.BuildSA(this.DFAtree);
        this.updateKeywordValue()
    },
    methods: {
        dateTrans(date){
            let d = new Date(date);
            return d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate();
        },
        getreferences(ref){
            let ret = [];
            if (!ref) return;
            let size = ref.length;
            for (let i=0; i<size; i++){
                let tmp = new Object();
                let mId = tmp.id = ref[i];
                tmp.date = this.dateTrans(maildata[mId].date);
                tmp.subject = maildata[mId].subject;
                tmp.user = userdata[maildata[mId].userId].name;
                ret.push(tmp);
            }
            return ret;
        },
        expandChange(row, expandedRows){
            if (expandedRows.length>1){
                expandedRows.shift()
            }
        },
        sortByDate(data1, data2) {
            if (data1.date < data2.date) {
                return -1;
            } else if (data1.date > data2.date) {
                return 1;
            }
            return 0;
        },
        async updateKeywordValue() {
            let data = [];
            let value = [];
            let size = this.keywordSet.length;
            for (let i=0; i<size; i++){
                value[i] = 0;
            }
            let tsize = this.thread.mails.length;
            for (let i=0; i<tsize; i++){
                const text = await this.getMailText(this.thread.mails[i])
                value = trie.searchDFA(this.DFAtree, text, value);
            }
            for (let i=0; i<size; i++){
                if (value[i]===0) continue;
                let tmp = new Object();
                tmp.name = this.keywordSet[i];
                tmp.value = value[i];
                data.push(tmp);
            }
            this.keywordValue = data
        }
    },
}

</script>

<template>
    <card-view :title="owner" type="thread">
        <mail-list :mails="thread.mails" :mail-id="data.mailId" origin="thread">
            <div slot="general-info">Related Users: {{ thread.users.length }}</div>
            <word-cloud :data="keywordValue" tag="keyword" origin="thread"/>
            <bar-chart :data="relatedUsers" tag="user" origin="thread"/>
        </mail-list>
    </card-view>
</template>

<style lang="scss" scoped>

.card.thread > .container > .mail-list {
    height: 100%;
    
    > .word-cloud, > .bar-chart {
        height: 28vh;
        width: 100%;
        border-top: 1px solid #ebeef5;
    }
}

</style>
