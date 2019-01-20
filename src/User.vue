<script>
/**
 * The Vue Module that displays information of one single user
 *
 * @author He, Hao
 * @since  2019-01-02
 */

const userdata = require("../dist/users");
const maildata = require("../dist/mails");
const keywordExtraction = require("./Keyword");

module.exports = {
    props: ['data'],
    data: () => ({
        startDate: null,
        endDate: null,
    }),
    computed: {
        user() {
            return this.dataset.users[typeof this.data.id === 'number' ? this.data.id : 0]
        },
        keywords() {
            // Use precomputed data
            if (this.startDate === null && this.endDate === null)
                return this.user.keywords;

            // Compute on-the-fly
            return keywordExtraction
                .generateKeywords(this.user.mails.filter(this.filterWithTime))
                .filter((word, index) => index <= 50);
        },
        relatedUsers() {
            // Use precomputed data
            if (this.startDate === null && this.endDate === null)
                return this.user.relatedUsers;

            // Compute on-the-fly
            let result = [];
            let resultIdMap = new Map();
            this.user.mails.filter(this.filterWithTime).forEach(currMailId => {
                let mail = maildata[currMailId];
                let currUserIds = [];
                if (mail.inReplyTo)
                    currUserIds.push(maildata[mail.inReplyTo].userId);
                if (mail.replies)
                    mail.replies.forEach(r => {
                        currUserIds.push(maildata[r].userId);
                    });

                currUserIds.forEach(currUserId => {
                    if (currUserId === -1 || currUserId === this.user.id) return;
                    let resultId = resultIdMap.get(currUserId);
                    if (!resultId) {
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
            });
            result.sort((a, b) => {
                if (a.value > b.value) return -1;
                else if (a.value < b.value) return 1;
                return 0;
            });
            return result.filter((user, index) => index <= 15);
        },
    },
    watch: {
        'data.id'() {
            this.startDate = null
            this.endDate = null
            this.$refs.card.showMailList = false
        },
    },
    methods: {
        filterWithTime(mailId) {
            let flag = true;
            let date = maildata[mailId].date;
            if (this.startDate) flag &= date > this.startDate;
            if (this.endDate) flag &= date < this.endDate;
            return flag;
        }
    }
};
</script>

<template>
    <card-view :title="user.name" type="user" envelop ref="card">
        <div class="metadata">Mail Address: {{ user.address }} 
            <br>Total Mails: {{ user.mails.length }}
        </div>
        <line-chart :data="user.activity" tag="UserOverview" origin="user"
            :start-date.sync="startDate" :end-date.sync="endDate"/>
        <word-cloud :data="keywords" tag="keyword" origin="user"/>
        <bar-chart :data="relatedUsers" tag="user" origin="user"/>
        <mail-list slot="mail-list" origin="user-mail-list" trigger-thread
            :mails="user.mails" :startDate="startDate" :endDate="endDate"/>
    </card-view>
</template>

<style lang="scss" scoped>

.card.user > .container > * {
    width: 100%;
    box-sizing: border-box;

    &.metadata {
        font-size: 2.4vh;
        padding: 0.6vh 0.6vw;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &:not(:last-child) {
        border-bottom: 1px solid #ebeef5;
    }

    &.line-chart { height: 20vh }
    &.word-cloud { height: 24vh }
    &.bar-chart { height: 42vh }
}

</style>
