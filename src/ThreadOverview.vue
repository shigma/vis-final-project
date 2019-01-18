<script>

const userdata = require('../dist/users.json');
const maildata = require('../dist/mails.json');
const threaddata = require('../dist/threads.json');
const eventBus = require('./EventBus.js');
const trie = require('./keywordTrie.js');
const keyword_top100 = require('../dist/keywords_top100.json');

module.exports = {
    props: ['data'],
    data: () => ({
        id: -1,
        keywordSet: [],
        DFAtree: [],
    }),
    components: {
        Card: require('./card.vue'),
        ThreadKeywordCloud: require('./WordCloud.vue'),
        UserRelated: require('./SortedBarChart.vue'),
    },
    computed: {
        thread() {
            return threaddata[typeof this.data.id === 'number' ? this.data.id : 2339]
        },
        involvedMailNum(){
            return this.thread.mails.length;
        },
        involvedUserNum(){
            return this.thread.users.length;
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
                tmp.references = maildata[mId].references;
                //console.log(tmp.references)
                data.push(tmp);
            }
            return data;
        },
        keywordvalue(){
            let data = [];
            let value = [];
            let size = this.keywordSet.length;
            for (let i=0; i<size; i++){
                value[i] = 0;
            }
            let tsize = this.thread.mails.length;
            for (let i=0; i<tsize; i++){
                //value = trie.searchDFA(this.DFAtree, maildata[this.thread.mails[i]].subject, value)
                value = trie.searchDFA(this.DFAtree, this.getMailText(this.thread.mails[i]), value);
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
    },
    mounted() {
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
    },
}
/*
*/
</script>

<template>
    <Card :title="owner" type="thread">
        <div id="BasicInfo">
            <h3>涉及用户数:{{involvedUserNum}}</h3>
            <h3>涉及邮件数:{{involvedMailNum}}</h3>
        </div>
        <div id="WordCloud">
            <thread-keyword-cloud :data="keywordvalue" tag="keyword" style="width:100%; height:200px;"></thread-keyword-cloud>
        </div>
        <div id="SortedBarChart">
            <user-related :data="relatedUsers" tag="user" style="width:100%; height:200px;"/>
        </div>
        <div id="Table">
            <el-table
            :data="tabledata"
            style="width: 100%"
            @expand-change="expandChange"
            stripe
            height="400"
            heightlight-cur-row>
            <el-table-column type="expand" label="回复链表">
                <template slot-scope="props">
                    <el-table
                    :data="getreferences(props.row.references)"
                    style="width: 100%"
                    stripe>
                    <el-table-column
                        prop="id"
                        label="引用ID">
                    </el-table-column>
                    <el-table-column
                        prop="date"
                        label="时间">
                    </el-table-column>
                    <el-table-column
                        prop="user"
                        label="用户">
                    </el-table-column>
                    </el-table>
                </template>
            </el-table-column>
            <el-table-column
                prop="date"
                label="日期"
                sortable
                :sort-method="sortByDate">
            </el-table-column>
            <el-table-column
                prop="subject"
                label="主题">
            </el-table-column>
            <el-table-column
                prop="user"
                label="用户">
            </el-table-column>
            </el-table>
    </Card>
</template>

<style lang="scss" scoped>
</style>


