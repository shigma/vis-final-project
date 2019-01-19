<script>

const keyword_100data = require('../dist/keywords_top100.json');
const usercountdata = require('../dist/users_countByMonth.json');
const activityData = require('../dist/overviewActivityData.json');

module.exports = {
    props: ['data'],
    data: () => ({
        startDate: null,
        endDate: null,
        vertical: false,
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
        activity() {
            return activityData;
        },
    },
    watch: {
        vertical() {
            this.$nextTick(() => this.$eventBus.$emit('resize', 'overview'))
        },
    },
    mounted() {
        this.checkLayout()
        this.$eventBus.$on('resize', origin => {
            if (origin) return
            this.checkLayout()
        })
    },
    methods: {
        checkLayout() {
            this.vertical = this.$el.offsetHeight / this.$el.offsetWidth > 1
        },
    },
}
</script>

<template>
    <card-view title="Overview" type="overview" uncloseable>
        <line-chart :data="activity" tag="overview" hide-title
            :start-date.sync="startDate" :end-date.sync="endDate"/>
        <word-cloud :data="keywordclouddata" tag="keyword" origin="overview"/>
        <word-cloud :data="userclouddata" tag="user" origin="overview"/>
    </card-view>
</template>

<style lang="scss">

.card.overview > .container > * {
    width: 100%;
    box-sizing: border-box;

    &:not(:last-child) {
        border-bottom: 1px solid #ebeef5;
    }

    &.line-chart { height: 30vh }
    &.word-cloud.keyword { height: 32vh }
    &.word-cloud.user { height: 32vh }
}

// .card.overview > .container > * {
//     position: absolute;
// }

// .card.overview.vertical > .container > * {
//     left: 0;
//     width: 100%;

//     &.line-chart {
//         top: 0;
//         height: 30vh;
//     }

//     &.word-cloud {
//         height: 30vh;

//         &.user { top: 32vh }
//         &.keyword { top: 62vh }
//     }
// }

// .card.overview:not(.vertical) > .container > * {
//     &.line-chart {
//         top: 2vh;
//         left: 4%;
//         height: 40vh;
//         width: 92%;
//     }

//     &.word-cloud {
//         width: 44%;
//         top: 46vh;
//         height: 42vh;

//         &.user {
//             left: 3%;
//         }

//         &.keyword {
//             right: 3%;
//         }
//     }
// }

</style>
