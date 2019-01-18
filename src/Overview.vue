<script>

const echarts = require('echarts');
const userdata = require('../dist/users.json');
const maildata = require('../dist/mails.json');
const threaddata = require('../dist/threads.json');
const eventBus = require('../src/EventBus.js');
const trie = require('../src/keywordTrie.js');
const keyworddata = require('../dist/keywords.json');
const keyword_100data = require('../dist/keywords_top100.json');
const activityData = require('../dist/overviewActivityData.json');

const keywordMap = new Map();
keyworddata.forEach(item => {
    keywordMap.set(item.keyword, item);
});

module.exports = {
    data: () => ({
        StartDate: null,
        EndDate: null,
        startid: 0,
        endid: 42852,
        keywordSet: [],
        DFAtree: [],
        userSet: [],
    }),
    components: {
        WordCloud: require('./WordCloud.vue'),
        MailsActivityPlot: require('./ActivityPlot.vue'),
    },
    computed: {
        startYM(){
            if (this.StartDate===null){
                return {
                    'y': 0, m: 11,
                }
            }
            let d = new Date(this.StartDate);
            return {
                'y': d.getFullYear() - 2001,
                'm': d.getMonth() + 1,
            };
        },
        endYM(){
            if (this.EndDate===null){
                return {
                    'y': 17, m: 9,
                }
            }
            let date = new Date(this.EndDate);
            return {
                'y': date.getFullYear() - 2001,
                'm': date.getMonth() + 1,
            };
        },
        
        keywordclouddata(){
            let data = [];
            let value = [];
            let size = keyword_100data.length;
            for (let i=0; i<size; i++){
                value[i] = 0;
                let y = this.startYM.y;
                let m = this.startYM.m;
                for (let j=m; j<=12; j++){
                    value[i] += keyword_100data[i].count[y][j];
                }
                for (let j=y+1; j<this.endYM.y; j++){
                    value[i] += keyword_100data[i].count[j][0];
                }
                for (let j=1; j<=this.endYM.m; j++){
                    value[i] += keyword_100data[i].count[this.endYM.y][j];
                }
            }
            for (let i=0; i<size; i++){
                if (value[i]===0) continue;
                let tmp = new Object();
                tmp.name = this.keywordSet[i];
                tmp.value = value[i];
                data.push({
                    id: keyword_100data[i].oid,
                    name: keyword_100data[i].name,
                    value: value[i],
                });
            }
            //console.log(JSON.stringify(data));
            return data;
        },
        userclouddata(){
            //console.log(JSON.stringify(this.userSet));
            return this.userSet;
            /*
            let data = [];
            let size = userdata.length;
            for (let i=0; i<size; i++){
                this.userSet[i].name = userdata[i].name;
                this.userSet[i].value = 0;
            }
            for (let i=this.startid; i<=this.endid; i++){
                let uid = maildata[i].userId;
                if (uid>=0) this.userSet[uid].value++;
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
            */

        },
        activity(){
            return activityData;
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
            tmp.value = userdata[i].mails.length;
            tmp.id = i;
            this.userSet.push(tmp);
        }
    },
    mounted() {
        eventBus.$on('date-filter-changed', dateFilter => {
            // this event should not be responded
            if (!dateFilter.tag.includes('overview')) {
                return;
            }
            // change date filter data
            this.StartDate = dateFilter.beginDate;
            this.EndDate = dateFilter.endDate;
            console.log(this.StartDate);
            console.log(JSON.stringify(this.startYM));
        });
    },
    methods: {
    },
}
</script>

<template>
    <div>
        <!-- <div id="BasicInfo">
            <h3>Overview</h3>
            <h3>time_start:{{StartDate}}</h3>
            <h3>time_end:{{EndDate}}</h3>
        </div> -->
        <mails-activity-plot
            :data="activity"
            tag="overview"
            style="width:100%; height:200px;"
        ></mails-activity-plot>
        <div ref="wordCloud">
            <word-cloud :data="keywordclouddata" tag="keyword" style="width:100%; height:200px;"/>
        </div>
        <div ref="userCloud">
            <word-cloud :data="userclouddata" tag="user" style="width:100%; height:200px;"/>
        </div>
    </div>
</template>

<style lang="scss" scoped>
</style>
