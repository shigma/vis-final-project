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
        let stopwords = [
            "a",
            "able",
            "about",
            "across",
            "after",
            "all",
            "almost",
            "also",
            "am",
            "among",
            "an",
            "and",
            "any",
            "are",
            "as",
            "at",
            "be",
            "because",
            "been",
            "but",
            "by",
            "can",
            "cannot",
            "could",
            "dear",
            "did",
            "do",
            "does",
            "either",
            "else",
            "ever",
            "every",
            "for",
            "from",
            "get",
            "got",
            "had",
            "has",
            "have",
            "he",
            "her",
            "hers",
            "him",
            "his",
            "how",
            "however",
            "i",
            "if",
            "in",
            "into",
            "is",
            "it",
            "its",
            "just",
            "least",
            "let",
            "like",
            "likely",
            "may",
            "me",
            "might",
            "most",
            "must",
            "my",
            "neither",
            "no",
            "nor",
            "not",
            "of",
            "off",
            "often",
            "on",
            "only",
            "or",
            "other",
            "our",
            "own",
            "rather",
            "said",
            "say",
            "says",
            "she",
            "should",
            "since",
            "so",
            "some",
            "than",
            "that",
            "the",
            "their",
            "them",
            "then",
            "there",
            "these",
            "they",
            "this",
            "tis",
            "to",
            "too",
            "twas",
            "us",
            "wants",
            "was",
            "we",
            "were",
            "what",
            "when",
            "where",
            "which",
            "while",
            "who",
            "whom",
            "why",
            "will",
            "with",
            "would",
            "yet",
            "you",
            "your",
            "ain't",
            "aren't",
            "can't",
            "could've",
            "couldn't",
            "didn't",
            "doesn't",
            "don't",
            "hasn't",
            "he'd",
            "he'll",
            "he's",
            "how'd",
            "how'll",
            "how's",
            "i'd",
            "i'll",
            "i'm",
            "i've",
            "isn't",
            "it's",
            "might've",
            "mightn't",
            "must've",
            "mustn't",
            "shan't",
            "she'd",
            "she'll",
            "she's",
            "should've",
            "shouldn't",
            "that'll",
            "that's",
            "there's",
            "they'd",
            "they'll",
            "they're",
            "they've",
            "wasn't",
            "we'd",
            "we'll",
            "we're",
            "weren't",
            "what'd",
            "what's",
            "when'd",
            "when'll",
            "when's",
            "where'd",
            "where'll",
            "where's",
            "who'd",
            "who'll",
            "who's",
            "why'd",
            "why'll",
            "why's",
            "won't",
            "would've",
            "wouldn't",
            "you'd",
            "you'll",
            "you're",
            "you've"
        ];
        for (let i = 0; i < this.mails.length; ++i) {
            let str = maildata[i].subject
                .replace(/[^a-zA-Z\s]/g, "")
                .split(" ");
            str.forEach(x => {
                x = x.toLowerCase();
                if (x.length <= 2) return;
                if (stopwords.includes(x)) return;
                let id = this.keywords.findIndex(y => {
                    return y.name === x;
                });
                if (id === -1) {
                    this.keywords.push({ name: x, value: 1 });
                } else {
                    this.keywords[id].value++;
                }
            });
        }
    },
    mounted: function() {},
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
