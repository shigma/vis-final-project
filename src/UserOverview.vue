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
        name: "",
        address: "",
        mails: [],
        contacts: [],
        activity: [],
        keywords: []
    }),
    components: {
        UserActivityPlot: require("./UserActivityPlot.vue"),
        UserKeywordCloud: require("./UserKeywordCloud.vue"),
        UserMailList: require("./UserMailList.vue")
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
        this.name = userdata[userId].name;
        this.address = userdata[userId].address;
        this.mails = userdata[userId].mails;

        // Compute contacts data
        for (let i = 0; i < this.mails.length; ++i) {
            let id = this.mails[i];
            if (
                this.contacts.find(x => {
                    return x === maildata[id].userId;
                }) === undefined
            )
                this.contacts.push(maildata[id].userId);
        }

        // Compute activity data
        let minDate = new Date(maildata[this.mails[0]].date);
        let maxDate = new Date(maildata[this.mails[0]].date);
        for (let i = 0; i < this.mails.length; ++i) {
            let date = new Date(maildata[this.mails[i]].date);
            if (date < minDate) minDate = date;
            if (date > maxDate) maxDate = date;
        }
        for (let i = minDate.getFullYear(); i <= maxDate.getFullYear(); ++i) {
            for (let j = 1; j <= 12; ++j) {
                this.activity.push([i + "-" + j, 0]);
            }
        }
        for (let i = 0; i < this.mails.length; ++i) {
            let date = new Date(maildata[this.mails[i]].date);
            let ym = date.getFullYear() + "-" + date.getMonth();

            let activityIndex = this.activity.findIndex(x => {
                return x[0] === ym;
            });
            if (activityIndex != -1) {
                this.activity[activityIndex][1]++;
            }
        }

        // Keyword Extraction
        let m = [];
        for (let i = 0; i < this.mails.length; ++i) {
            m.push(maildata[i]);
        }
        this.keywords = keywordExtraction.generateKeywords(m);
    },
    mounted: function() {
        // handle events for UserKeywordCloud
        eventBus.$on("date-filter-changed", param => {
            let m = [];
            for (let i = 0; i < this.mails.length; ++i) {
                let flag = true;
                let date = new Date(maildata[this.mails[i]].date);
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
            <h2>用户信息</h2>
            <div id="Info">
                姓名：{{name}}
                <br>
                邮件地址：{{address}}
                <br>
                发送邮件数：{{mails.length}}
                <br>
                联系人数：{{contacts.length}}
                <br>
            </div>
            <user-activity-plot v-bind:data="this.activity" style="width:100%; height:200px;"></user-activity-plot>
        </div>
        <div id="WordCloud">
            <user-keyword-cloud v-bind:data="this.keywords" style="width:100%; height:200px;"></user-keyword-cloud>
        </div>
        <div id="MailList">
            <h2>邮件列表</h2>
            <user-mail-list v-bind:mailIds="this.mails"></user-mail-list>
        </div>
    </div>
</template>

<style lang="scss">
#User {
    border-style: solid;
    font-family: sans-serif;
}
</style>
