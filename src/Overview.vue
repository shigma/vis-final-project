<script>

const eventBus = require('./EventBus.js');
const keyword_100data = require('../dist/keywords_top100.json');
const usercountdata = require('../dist/users_countByMonth.json');
const activityData = require('../dist/overviewActivityData.json');

module.exports = {
    data: () => ({
        startDate: null,
        endDate: null,
    }),
    computed: {
        startYM(){
            if (this.startDate===null){
                return {
                    'y': 0, m: 11,
                }
            }
            let d = new Date(this.startDate);
            return {
                'y': d.getFullYear() - 2001,
                'm': d.getMonth() + 1,
            };
        },
        endYM(){
            if (this.endDate===null){
                return {
                    'y': 17, m: 9,
                }
            }
            let date = new Date(this.endDate);
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
                data.push({
                    id: keyword_100data[i].oid,
                    name: keyword_100data[i].name,
                    value: value[i],
                });
            }
            return data;
        },
        userclouddata(){
            let data = [];
            let value = [];
            let size = usercountdata.length;
            for (let i=0; i<size; i++){
                value[i] = 0;
                let y = this.startYM.y;
                let m = this.startYM.m;
                for (let j=m; j<=12; j++){
                    value[i] += usercountdata[i].count[y][j];
                }
                for (let j=y+1; j<this.endYM.y; j++){
                    value[i] += usercountdata[i].count[j][0];
                }
                for (let j=1; j<=this.endYM.m; j++){
                    value[i] += usercountdata[i].count[this.endYM.y][j];
                }
            }
            for (let i=0; i<size; i++){
                if (value[i]===0) continue;
                data.push({
                    id: usercountdata[i].id,
                    name: usercountdata[i].name,
                    value: value[i],
                });
            }
            return data;
        },
        activity(){
            return activityData;
        },
    },
}
</script>

<template>
    <card-view title="Overview" type="overview" uncloseable>
        <line-chart :data="activity" tag="overview"
            style="width:100%; height:200px;"
            :start-date.sync="startDate" :end-date.sync="endDate"/>
        <div ref="wordCloud">
            <word-cloud :data="keywordclouddata" tag="keyword" style="width:100%; height:200px;" origin="overview"/>
        </div>
        <div ref="userCloud">
            <word-cloud :data="userclouddata" tag="user" style="width:100%; height:200px;" origin="overview"/>
        </div>
    </card-view>
</template>

<style lang="scss" scoped>
</style>
