<script>
/**
 * A component that displays important information for a given keyword
 *
 * @author He, Hao
 * @since 2019-1-9
 */

const maildata = require("../dist/mails.json");
const userdata = require("../dist/users.json");
const eventBus = require("../src/EventBus.js");
const keywordExtraction = require("../src/Keyword.js");

module.exports = {
    components: {
        KeywordUserCloud: require("./WordCloud.vue"),
        KeywordPopularity: require("./ActivityPlot.vue"),
        KeywordMailList: require("./MailList.vue"),
        KeywordRelated: require("./SortedBarChart.vue")
    },
    data: () => ({
        keyword: "cmake",
        beginDate: null,
        endDate: null
    }),
    computed: {
        // mailIds is an array of numbers
        mailIds: function() {
            let result = [];
            for (let i = 0; i < maildata.length; ++i) {
                if (maildata[i].subject.toLowerCase().includes(this.keyword)) {
                    result.push(maildata[i].id);
                }
            }
            return result;
        },
        // activity is an array, each element: [date, number]
        activity: function() {
            let result = [];
            let resultIdMap = new Map();

            if (this.mailIds.length === 0) return result;

            // set date values
            let minDate = new Date(maildata[this.mailIds[0]].date);
            let maxDate = new Date(maildata[this.mailIds[0]].date);
            for (let i = 0; i < this.mailIds.length; ++i) {
                let date = new Date(maildata[this.mailIds[i]].date);
                if (date < minDate) minDate = date;
                if (date > maxDate) maxDate = date;
            }
            for (
                let i = minDate.getFullYear();
                i <= maxDate.getFullYear();
                ++i
            ) {
                for (let j = 1; j <= 12; ++j) {
                    let ym = i + "-" + j;
                    result.push([ym, 0]);
                    resultIdMap.set(ym, result.length - 1);
                }
            }

            // compute activity values
            for (let i = 0; i < this.mailIds.length; ++i) {
                let date = new Date(maildata[this.mailIds[i]].date);
                let ym = date.getFullYear() + "-" + date.getMonth();

                let resultId = resultIdMap.get(ym);
                if (resultId != undefined) {
                    result[resultId][1]++;
                }
            }
            return result;
        },
        // users is an array, each element has id, name and value field.
        users() {
            let result = [];
            let resultIdMap = new Map();
            this.mailIds
                .filter(this.filterWithTime)
                .forEach(id => {
                    let currUserId = maildata[id].userId;
                    if (currUserId === -1) return;
                    let resultId = resultIdMap.get(currUserId);
                    if (resultId === undefined) {
                        result.push({
                            id: currUserId,
                            name: userdata[currUserId].name,
                            value: 1
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
            let result = [];
            let resultIdMap = new Map();
            this.mailIds.filter(this.filterWithTime).forEach(id => {
                keys = keywordExtraction.generateKeywords([id]);
                keys.forEach(key => {
                    if (key.name.toLowerCase() === this.keyword) return;
                    resultId = resultIdMap.get(key.name);
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
        eventBus.$on("date-filter-changed", dateFilter => {
            // this event should not be responded
            if (!dateFilter.tag.includes("KeywordOverview")) {
                return;
            }

            // change date filter data
            this.beginDate = dateFilter.beginDate;
            this.endDate = dateFilter.endDate;
        });
        eventBus.$on("keyword-changed", param => {
            this.beginDate = null;
            this.endDate = null;
            this.keyword = param.keyword;
        });
    },
    updated: function() {},
    methods: {
        filterWithTime(mailId) {
            let flag = true;
            let date = new Date(maildata[mailId].date);
            if (this.beginDate) flag &= date > this.beginDate;
            if (this.endDate) flag &= date < this.endDate;
            return flag;
        }
    }
};
</script>

<template>
    <div id="keyword-overview">
        <h2>{{keyword}}</h2>
        <keyword-popularity
            :data="activity"
            tag="KeywordOverview"
            style="width:100%; height:200px;"
        />
        <keyword-user-cloud :data="users" tag="user" style="width:100%; height:200px;"/>
        <keyword-mail-list :mailIds="mailIds" :beginDate="beginDate" :endDate="endDate"/>
        <keyword-related :data="relatedKeywords" style="width:100%; height:200px;"/>
    </div>
</template>

<style>
#keyword-overview {
    border-style: solid;
    font-family: sans-serif;
}
</style>
