<script>
/**
 * A component that displays important information for a given keyword
 *
 * @author He, Hao
 * @since 2019-1-9
 */

const maildata = require("../dist/mails.json");
const userdata = require("../dist/users.json");
const eventbus = require("../src/EventBus.js");

module.exports = {
    components: {
        KeywordUserCloud: require("./UserCloud.vue"),
        KeywordPopularity: require("./UserActivityPlot.vue"),
        KeywordMailList: require("./UserMailList.vue"),
        KeywordRelated: require("./KeywordCloud.vue")
    },
    data: () => ({
        keyword: 'cmake',
    }),
    computed: {
        mailIds: function() {
            let result = [];
            for (let i = 0; i < maildata.length; ++i) {
                if (maildata[i].subject.toLowerCase().includes(this.keyword)) {
                    result.push(maildata[i].id);
                }
            }
            return result;
        },
        activity: function() {
            let result = [];
            if (this.mailIds.length === 0)
                return result;
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
        }
    },
    created: function() {},
    mounted: function() {
        eventbus.$on("keyword-changed", (keyword)=>{
            this.keyword = keyword;
        });
    },
    updated: function() {},
    methods: {}
};
</script>

<template>
    <div id="keyword-overview">
        <h2>{{keyword}}</h2>
        <keyword-popularity v-bind:data="this.activity" style="width:100%; height:200px;"></keyword-popularity>
        <keyword-mail-list v-bind:mailIds="this.mailIds"></keyword-mail-list>
        <keyword-related></keyword-related>
    </div>
</template>

<style>
#keyword-overview {
    border-style: solid;
    font-family: sans-serif;
}
</style>
