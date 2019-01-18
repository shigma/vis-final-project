<script>
/**
 * A component that displays important information for a given keyword
 *
 * @author He, Hao
 * @since 2019-1-9
 */

const maildata = require('../dist/mails.json');
const userdata = require('../dist/users.json');
const keywords = require('../dist/keywords.json');
const eventBus = require('./EventBus.js');
const keywordExtraction = require('./Keyword.js');

let keywordMap = new Map();
keywords.forEach(item => {
    keywordMap.set(item.keyword, item);
});

module.exports = {
    components: {
        Card: require('./card.vue'),
        MailList: require('./MailList.vue'),
        WordCloud: require('./WordCloud.vue'),
        LineChart: require('./ActivityPlot.vue'),
        BarChart: require('./SortedBarChart.vue'),
    },
    data: () => ({
        keyword: 'mac',
        beginDate: null,
        endDate: null,
    }),
    computed: {
        // mailIds is an array of numbers
        mailIds: function() {
            return keywordMap.get(this.keyword).mails;
        },
        // activity is an array, each element: [date, number]
        activity: function() {
            return keywordMap.get(this.keyword).activity;
        },
        // users is an array, each element has id, name and value field.
        users() {
            // Use precomputed data
            if (this.beginDate === null && this.endDate === null)
                return keywordMap.get(this.keyword).users;

            // Compute on-the-fly
            let result = [];
            let resultIdMap = new Map();
            this.mailIds.filter(this.filterWithTime).forEach(id => {
                let currUserId = maildata[id].userId;
                if (currUserId === -1) return;
                let resultId = resultIdMap.get(currUserId);
                if (resultId === undefined) {
                    result.push({
                        id: currUserId,
                        name: userdata[currUserId].name,
                        value: 1,
                    });
                    resultIdMap.set(currUserId, result.length - 1);
                } else {
                    result[resultId].value++;
                }
            });
            result.sort((a, b) => {
                if (a.value > b.value) return -1;
                if (a.vaule < b.value) return 1;
                return 0;
            });
            result = result.filter((a, index) => index <= 30);
            return result;
        },
        // relatedKeywords is an array, each element has name and value field
        relatedKeywords() {
            // Use precomputed data
            if (this.beginDate === null && this.endDate === null)
                return keywordMap.get(this.keyword).relatedKeywords;

            // Compute on-the-fly
            let result = [];
            let resultIdMap = new Map();
            this.mailIds.filter(this.filterWithTime).forEach(id => {
                const keys = keywordExtraction.generateKeywords([id]);
                keys.forEach(key => {
                    if (key.name.toLowerCase() === this.keyword) return;
                    const resultId = resultIdMap.get(key.name);
                    if (resultId === undefined) {
                        result.push({ name: key.name, value: 1 });
                        resultIdMap.set(key.name, result.length - 1);
                    } else {
                        result[resultId].value++;
                    }
                });
            });
            result.sort((a, b) => {
                if (a.value > b.value) return -1;
                else if (a.value < b.value) return 1;
                return 0;
            });
            return result.filter((word, index) => index <= 15);
        }
    },
    created: function() {},
    mounted: function() {
        eventBus.$on('date-filter-changed', dateFilter => {
            // this event should not be responded
            if (!dateFilter.tag.includes('KeywordOverview')) {
                return;
            }

            // change date filter data
            this.beginDate = dateFilter.beginDate;
            this.endDate = dateFilter.endDate;
        });
        eventBus.$on('keyword-changed', param => {
            if (this.keyword === param.keyword) return;
            this.keyword = param.keyword;
        });
    },
    methods: {
        filterWithTime(mailId) {
            let flag = true;
            let date = new Date(maildata[mailId].date);
            if (this.beginDate) flag &= date > this.beginDate;
            if (this.endDate) flag &= date < this.endDate;
            return flag;
        },
    },
};
</script>

<template>
    <Card :title="keyword" type="keyword" class="keyword">
        <line-chart :data="activity" tag="KeywordOverview"/>
        <word-cloud :data="users" tag="user"/>
        <mail-list :mails="mailIds" :beginDate="beginDate" :endDate="endDate"/>
        <bar-chart :data="relatedKeywords"/>
    </Card>
</template>

<style lang="scss" scoped>

.card.keyword > .container {
    > .line-chart {
        width: 100%;
        height: 24vh;
    }

    > .word-cloud {
        width: 100%;
        height: 24vh;
    }

    > .mail-list {
        width: 100%;
        height: 24vh;
    }

    > .bar-chart {
        width: 100%;
        height: 24vh;
    }
}

</style>
