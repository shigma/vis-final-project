<script>
/**
 * The Vue Module that displays information of one single user
 *
 * @author He, Hao
 * @since  2019-01-02
 */

const userdata = require('../dist/users');
const maildata = require('../dist/mails');
const eventBus = require('./EventBus');
const keywordExtraction = require('./Keyword');

module.exports = {
    data: () => ({
        // user ID
        id: -1,
        // Filters
        beginDate: null,
        endDate: null
    }),
    components: {
        Card: require('./card.vue'),
        UserActivityPlot: require('./ActivityPlot.vue'),
        UserKeywordCloud: require('./WordCloud.vue'),
        UserMailList: require('./MailList.vue'),
        UserRelated: require('./SortedBarChart.vue')
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
        activity() {
            return userdata[this.id].activity;
        },
        keywords() {
            // Use precomputed data
            if (this.beginDate === null && this.endDate === null)
                return userdata[this.id].keywords;

            // Compute on-the-fly
            return keywordExtraction
                .generateKeywords(this.mailIds.filter(this.filterWithTime))
                .filter((word, index) => index <= 50);
        },
        relatedUsers() {
            // Use precomputed data
            if (this.beginDate === null && this.endDate === null)
                return userdata[this.id].relatedUsers;

            // Compute on-the-fly
            let result = [];
            let resultIdMap = new Map();
            this.mailIds.filter(this.filterWithTime).forEach(currMailId => {
                let mail = maildata[currMailId];
                let currUserIds = [];
                if (mail.inReplyTo)
                    currUserIds.push(maildata[mail.inReplyTo].userId);
                if (mail.replies)
                    mail.replies.forEach(r => {
                        currUserIds.push(maildata[r].userId);
                    });

                currUserIds.forEach(currUserId => {
                    if (currUserId === -1 || currUserId === this.id) return;
                    let resultId = resultIdMap.get(currUserId);
                    if (!resultId) {
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
            });
            result.sort((a, b) => {
                if (a.value > b.value) return -1;
                else if (a.value < b.value) return 1;
                return 0;
            });
            return result.filter((user, index) => index <= 15);
        }
    },
    created() {
        // For test of this module
        let userId = 0;
        for (let i = 0; i < userdata.length; ++i) {
            if (userdata[i].name === 'Michael Jackson') {
                userId = i;
                break;
            }
        }
        // Basic data
        this.id = userdata[userId].id;

        eventBus.$on('date-filter-changed', param => {
            // This event should not be responded
            if (!param.tag.includes('UserOverview')) {
                return;
            }
            // Set the new date filter
            this.beginDate = param.beginDate;
            this.endDate = param.endDate;
        });
        window.foo=eventBus
        eventBus.$on('user-changed', param => {
            this.beginDate = null;
            this.endDate = null;
            this.id = param.userId;
        });
    },
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
    <Card :title="name">
        <div id="UserOverview">
            <user-activity-plot
                :data="activity"
                tag="UserOverview"
                style="width:100%; height:200px;"
            ></user-activity-plot>
        </div>
        <div id="WordCloud">
            <user-keyword-cloud :data="keywords" tag="keyword" style="width:100%; height:200px;"></user-keyword-cloud>
        </div>
        <div id="MailList">
            <user-mail-list :mailIds="mailIds" :beginDate="beginDate" :endDate="endDate"></user-mail-list>
        </div>
        <div id="SortedBarChart">
            <user-related :data="relatedUsers" style="width:100%; height:200px;"/>
        </div>
    </Card>
</template>

<style lang="scss">
</style>
