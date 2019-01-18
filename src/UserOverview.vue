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
        endDate: null,
    }),
    components: {
        Card: require('./card.vue'),
        MailList: require('./MailList.vue'),
        LineChart: require('./ActivityPlot.vue'),
        WordCloud: require('./WordCloud.vue'),
        BarChart: require('./SortedBarChart.vue'),
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
                return userdata[this.id].relatedUsers.reverse();

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
            return result.filter((user, index) => index <= 15).reverse();
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
    <Card :title="name" type="user" class="user">
        <line-chart :data="activity" tag="UserOverview"/>
        <word-cloud :data="keywords" tag="keyword"/>
        <mail-list :mails="mailIds" :beginDate="beginDate" :endDate="endDate"/>
        <bar-chart :data="relatedUsers" style="width:100%; height:200px;"/>
    </Card>
</template>

<style lang="scss" scoped>

.card.user > .container {
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
