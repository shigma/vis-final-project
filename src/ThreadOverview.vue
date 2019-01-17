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
        id: -1,
        keywordSet: [],
        DFAtree: [],
    }),
    components: {
        ThreadKeywordCloud: require('./WordCloud.vue'),
    },
    computed: {
        involvedMailNum(){
            return threaddata[this.id].mails.length;
        },
        involvedUserNum(){
            return threaddata[this.id].users.length;
        },
        owner(){
            let fmid = threaddata[this.id].mails[0];
            let ownerid = maildata[fmid].userId;
            return userdata[ownerid].name;
        },
        tabledata(){
            let data = [];
            let size = threaddata[this.id].mails.length;
            for (let i=0; i<size; i++){
                let mId = threaddata[this.id].mails[i];
                let tmp = new Object();
                tmp.date = this.dateTrans(maildata[mId].date);
                tmp.subject = maildata[mId].subject;
                tmp.user = userdata[maildata[mId].userId].name;
                tmp.references = maildata[mId].references;
                //console.log(tmp.references)
                data.push(tmp);
            }
            return data
        },
        keywordvalue(){
            let data = [];
            let value = [];
            let size = this.keywordSet.length;
            for (let i=0; i<size; i++){
                value[i] = 0;
            }
            let tsize = threaddata[this.id].mails.length;
            for (let i=0; i<tsize; i++){
                value = trie.searchDFA(this.DFAtree, maildata[threaddata[this.id].mails[i]].subject, value)
            }
            for (let i=0; i<size; i++){
                let tmp = new Object();
                tmp.name = this.keywordSet[i];
                tmp.value = value[i];
                data.push(tmp);
            }
            //console.log(JSON.stringify(data));
            return data;
        },
    },
    created() {
        this.id = 2339;
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
    },
    mounted() {

    },
    methods: {
        dateTrans(date){
            let tmp = date.split(/ |,|-/);
            switch (tmp[1]){
                case 'Jur': 
                    tmp[0] = '01';
                    break;
                case 'Feb': 
                    tmp[0] = '02';
                    break;
                case 'Mar': 
                    tmp[0] = '03';
                    break;
                case 'Apr': 
                    tmp[0] = '04';
                    break;
                case 'May': 
                    tmp[0] = '05';
                    break;
                case 'Jun': 
                    tmp[0] = '06';
                    break;
                case 'Jul': 
                    tmp[0] = '07';
                    break;
                case 'Aug': 
                    tmp[0] = '08';
                    break;
                case 'Sep': 
                    tmp[0] = '09';
                    break;
                case 'Oct': 
                    tmp[0] = '10';
                    break;
                case 'Nov': 
                    tmp[0] = '11';
                    break;
                case 'Dec': 
                    tmp[0] = '12';
                    break;
            }
            return tmp[5]+'/'+tmp[0]+'/'+tmp[3]+' '+tmp[4];
        },
        getreferences(ref){
            let ret = [];
            if (!ref) return;
            let size = ref.length;
            for (let i=0; i<size; i++){
                let tmp = new Object();
                let mId = tmp.id = ref[i];
                tmp.date = maildata[mId].date;
                tmp.subject = maildata[mId].subject;
                tmp.user = userdata[maildata[mId].userId].name;
                ret.push(tmp);
            }
            return ret;
        },
        expandChange(row,expandedRows){
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
        }
    },
}
/*
*/
</script>

<template>
    <div>
        <div id="BasicInfo">
            <h3>版主:{{owner}}</h3>
            <h3>涉及用户数:{{involvedUserNum}}</h3>
            <h3>涉及邮件数:{{involvedMailNum}}</h3>
        </div>
        <div id="WordCloud">
            <thread-keyword-cloud :data="keywordvalue" tag="thread" style="width:100%; height:200px;"></thread-keyword-cloud>
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
    </div>
</template>

<style lang="scss" scoped>
</style>


