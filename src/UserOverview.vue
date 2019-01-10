<script>
/**
 * The Vue Module that displays information of one single user
 *
 * @author He, Hao
 * @since  2019-01-02
 */

const echarts = require("echarts");
const userdata = require("../dist/users.json");
const maildata = require("../dist/mails.json");
const eventBus = require("../src/EventBus.js");
const keywordExtraction = require("../src/Keyword.js");

module.exports = {
    data: () => ({
        // user ID
        id: -1,
        // Filters
        beginDate: null,
        endDate: null
    }),
    components: {
        UserActivityPlot: require("./ActivityPlot.vue"),
        UserKeywordCloud: require("./WordCloud.vue"),
        UserMailList: require("./MailList.vue"),
        UserRelated: require("./SortedBarChart.vue")
    },
    computed: {
        name() {
            return userdata[this.id].name;
        },
        address() {
            return userdata[this.id].address;
        },
        mailIds() {
            return userdata[this.id].mails;
        },
        relatedUsers() {
            let result = [];
            for (let i = 0; i < this.mailIds.length; ++i) {
                let mailId = this.mailIds[i];
                let contactsId = result.findIndex(
                    x => x === maildata[id].userId
                );
                if (contactsId === -1) {
                    result.push({
                        name: userdata[maildata[id].userId].name,
                        value: 1
                    });
                } else {
                    result[contactsId].value++;
                }
            }
            return result;
        },
        activity() {
            let result = [];
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
                    result.push([i + "-" + j, 0]);
                }
            }
            for (let i = 0; i < this.mailIds.length; ++i) {
                let date = new Date(maildata[this.mailIds[i]].date);
                let ym = date.getFullYear() + "-" + date.getMonth();

                let activityIndex = result.findIndex(x => {
                    return x[0] === ym;
                });
                if (activityIndex != -1) {
                    result[activityIndex][1]++;
                }
            }
            return result;
        },
        keywords() {
            let m = [];
            for (let i = 0; i < this.mailIds.length; ++i) {
                let flag = true;
                let date = new Date(maildata[this.mailIds[i]].date);
                if (this.beginDate) {
                    flag &= date > this.beginDate;
                }
                if (this.endDate) {
                    flag &= date < this.endDate;
                }
                if (flag) {
                    m.push(maildata[i]);
                }
            }
            return keywordExtraction
                .generateKeywords(m)
                .filter((word, index) => index <= 50);
        }
    },
    created: function() {
        // For test of this module
        let userId = 0;
        for (let i = 0; i < userdata.length; ++i) {
            if (userdata[i].name === "Michael Jackson") {
                userId = i;
                break;
            }
        }
        // Basic data
        this.id = userdata[userId].id;
    },
    mounted: function() {
        eventBus.$on("date-filter-changed", param => {
            // This event should not be responded
            if (!param.tag.includes("UserOverview")) {
                return;
            }
            // Set the new date filter
            this.beginDate = param.beginDate;
            this.endDate = param.endDate;
        });
        eventBus.$on("user-changed", param => {
            this.id = param.userId;
        });
    },
    methods: {}
};
</script>

<template>
    <div id="User">
        <div id="UserOverview">
            <h3>{{name}}</h3>
            <user-activity-plot
                v-bind:data="this.activity"
                tag="UserOverview"
                style="width:100%; height:200px;"
            ></user-activity-plot>
        </div>
        <div id="WordCloud">
            <user-keyword-cloud
                v-bind:data="this.keywords"
                tag="keyword"
                style="width:100%; height:200px;"
            ></user-keyword-cloud>
        </div>
        <div id="MailList">
            <user-mail-list
                :mailIds="this.mailIds"
                :beginDate="this.beginDate"
                :endDate="this.endDate"
            ></user-mail-list>
        </div>
    </div>
</template>

<style lang="scss">
#User {
    border-style: solid;
    font-family: sans-serif;
}
</style>
