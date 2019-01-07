<script>

/**
 * The Vue Module that displays information of one single user
 * 
 * @author He, Hao
 * @since  2019-01-02
 */

var echarts = require('echarts');

module.exports = {
    data: () => ({
        id: -1,
        name: '',
        address: '',
        mails: [],
        contacts: [],
        activity: [],
        keywords: [],
    }),
    components: {
        UserActivityPlot: require('./UserActivityPlot.vue'),
        UserKeywordCloud: require('./UserKeywordCloud.vue'),
    },
    created: function () {
        // For test of this module
        userdata = require('../dist/users.json');
        maildata = require('../dist/mails.json');
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
            if (this.contacts.find(
                (x)=>{return x === maildata[id].userId; }) === undefined)
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
                this.activity.push([i + '-' + j, 0]);
            }
        }
        for (let i = 0; i < this.mails.length; ++i) {
            let date = new Date(maildata[this.mails[i]].date);
            let ym = date.getFullYear() + "-" + date.getMonth();

            let activityIndex = this.activity.findIndex((x)=>{return x[0] === ym;});
            if (activityIndex != -1) {
                this.activity[activityIndex][1]++;
            }
        }

        // Keyword Extraction
        for (let i = 0; i < this.mails.length; ++i) {
            let str = maildata[i].subject.replace(/[^a-zA-Z\s]/g, '').split(' ');
            str.forEach((x)=>{
                let id = this.keywords.findIndex((y)=>{
                    return y.name.toUpperCase() === x.toUpperCase();
                });
                if (id === -1) {
                    this.keywords.push({name: x.toLowerCase(), value: 1});
                } else {
                    this.keywords[id].value++;
                }
            });
        }
    },
    mounted: function() {
        this.initActivityPlot();
        this.initWordCloud();
        this.initSocialNetwork();
    },
    methods: {
        initActivityPlot() {
            
            return;
        },
        initWordCloud() {

            return;
        },
        initSocialNetwork() {

            return;
        }
    },
}

</script>

<template>
    <div id="User">
        <div id="UserOverview">
            <h2>用户信息</h2>
            <div id="Info">
                姓名：{{name}}<br>
                邮件地址：{{address}}<br>
            </div>
            <div id="Summary">
                发送邮件数：{{mails.length}}<br>
                联系人数：{{contacts.length}}<br>
            </div>
            <user-activity-plot 
                v-bind:data="this.activity"
                style="width:400px; height:200px;">
            </user-activity-plot>
        </div>
        <div id="WordCloud">
            <user-keyword-cloud
                v-bind:data="this.keywords"
                style="width:400px; height:200px;">
            </user-keyword-cloud>
        </div>
        <div id="MailList">
            
        </div>
    </div>
</template>

<style lang="scss">

#User {
    border-style:solid;
}

</style>
