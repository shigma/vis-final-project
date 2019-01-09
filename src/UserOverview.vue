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
        id: -1,
    }),
    components: {
        UserActivityPlot: require("./UserActivityPlot.vue"),
        UserKeywordCloud: require("./KeywordCloud.vue"),
        UserMailList: require("./UserMailList.vue")
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
        contacts() {
            let result = [];
            for (let i = 0; i < this.mailIds.length; ++i) {
                let id = this.mailIds[i];
                if (
                    result.find(x => {
                        return x === maildata[id].userId;
                    }) === undefined
                )
                    result.push(maildata[id].userId);
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
                m.push(maildata[i]);
            }
            return keywordExtraction.generateKeywords(m);
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
        // handle events for UserKeywordCloud
        eventBus.$on("date-filter-changed", param => {
            let m = [];
            for (let i = 0; i < this.mailIds.length; ++i) {
                let flag = true;
                let date = new Date(maildata[this.mailIds[i]].date);
                if (param[0]) {
                    flag &= date > param[0];
                }
                if (param[1]) {
                    flag &= date < param[1];
                }
                if (flag) {
                    m.push(maildata[i]);
                }
            }
            this.keywords = keywordExtraction.generateKeywords(m);
        });
    },
    methods: {}
};
</script>

<template>
    <div id="User">
        <div id="UserOverview">
            <h3>{{name}}</h3>
            {{address}}
            <user-activity-plot v-bind:data="this.activity" style="width:100%; height:200px;"></user-activity-plot>
        </div>
        <div id="WordCloud">
            <user-keyword-cloud v-bind:data="this.keywords" style="width:100%; height:200px;"></user-keyword-cloud>
        </div>
        <div id="MailList">
            <h2>邮件列表</h2>
            <user-mail-list v-bind:mailIds="this.mailIds"></user-mail-list>
        </div>
    </div>
</template>

<style lang="scss">
#User {
    border-style: solid;
    font-family: sans-serif;
}
</style>
