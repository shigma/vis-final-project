<script>

const echarts = require('echarts');
const userdata = require('../dist/users.json');
const maildata = require('../dist/mails.json');
const threaddata = require('../dist/threads.json');
const eventBus = require('../src/EventBus.js');
const trie = require('../src/keywordTrie.js');
const keyworddata = require('../dist/keywords.json')

module.exports = {
    data: () => ({
        StartDate: Date('Wed, 7 Nov 2001 02:09:35 +0100'),
        EndDate: Date('Sat, 29 Sep 2018 17:12:30 +0000'),
        startid: 0,
        endid: 10,
        keywordSet: [],
        DFAtree: [],
        userSet: [],
    }),
    components: {
        OverviewKeywordCloud: require('./WordCloud.vue'),
    },
    computed: {
        keywordclouddata(){
            let data = [];
            let value = [];
            let size = this.keywordSet.length;
            for (let i=0; i<size; i++){
                value[i] = 0;
            }
            for (let i=this.startid; i<this.endid; i++){
                value = trie.searchDFA(this.DFAtree, maildata[i].subject, value)
            }
            for (let i=0; i<size; i++){
                if (value[i]===0) continue;
                let tmp = new Object();
                tmp.name = this.keywordSet[i];
                tmp.value = value[i];
                data.push(tmp);
            }
            //console.log(JSON.stringify(data));
            return data;
        },
        userclouddata(){
            let data = [];
            let size = userdata.length;
            for (let i=0; i<size; i++){
                this.userSet[i].value = 0;
            }
            for (let i=this.startid; i<=this.endid; i++){
                let uid = maildata[i].userId;
                this.userSet[uid].value++;
            }
            for (let i=0; i<size; i++){
                if (this.userSet[i].value===0) continue;
                let tmp = new Object();
                tmp.name = this.userSet[i].name;
                tmp.value = this.userSet[i].value;
                data.push(tmp);
            }
            //console.log(JSON.stringify(data));
            return data;

        },
    },
    created() {
        this.DFAtree = trie.initTree(this.DFAtree);
        let ksize = keyworddata.length;
        for (let i=0; i<ksize; i++){
            this.keywordSet.push(keyworddata[i].keyword);
        }
        let size = this.keywordSet.length;
        for (let i=0; i<size; i++){
            this.DFAtree = trie.insert(this.DFAtree, this.keywordSet[i], i);
        }
        this.DFAtree = trie.BuildSA(this.DFAtree);

        this.userSet = [];
        let usize = userdata.length;
        for (let i=0; i<usize; i++){
            let tmp = new Object();
            tmp.name = userdata[i].name;
            tmp.value = 0;
            this.userSet.push(tmp);
        }
    },
    mounted() {
    },
    methods: {
    },
}
</script>
<template>
    <div>
        <div id="BasicInfo">
            <h3>Overview</h3>
            <h3>time_start:{{StartDate}}</h3>
            <h3>time_end:{{EndDate}}</h3>
        </div>
        <div id="WordCloud">
            <overview-keyword-cloud :data="keywordclouddata" tag="keyword" style="width:100%; height:200px;"></overview-keyword-cloud>
        </div>
        <div id="UserCloud">
            <overview-keyword-cloud :data="userclouddata" tag="user" style="width:100%; height:200px;"></overview-keyword-cloud>
        </div>
    </div>
</template>
<style lang="scss" scoped>
</style>

