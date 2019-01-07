<script>

/**
 * The Vue Module that displays information of one single user
 * 
 * @author He, Hao
 * @since  2019-01-02
 */

module.exports = {
    data: () => ({
        id: -1,
        name: '',
        address: '',
        mails: [],
        contacts: [],
        activity: [],
        wordCloud: [],
    }),
    components: {
        UserActivityPlot: require("./UserActivityPlot.vue"),
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
        this.id = userdata[userId].id;
        this.name = userdata[userId].name;
        this.address = userdata[userId].address;
        this.mails = userdata[userId].mails;
        for (let i = 0; i < this.mails.length; i++) {
            let id = this.mails[i];
            if (this.contacts.find(
                (x)=>{return x === maildata[id].userId; }) === undefined)
                this.contacts.push(maildata[id].userId);
        }
    },
    mounted: function() {
        this.initActivityPlot();
        this.initWordCloud();
        this.initSocialNetwork();
    },
    methods: {
        initActivityPlot() {
            var echarts = require('echarts');

            let dom = this.$refs.ActivityPlot;
            var myChart = echarts.init(dom);

            // specify chart configuration item and data
            var option = {
                title: {
                    text: 'ECharts entry example'
                },
                tooltip: {},
                legend: {
                    data:['Sales']
                },
                xAxis: {
                    data: ["shirt","cardign","chiffon shirt","pants","heels","socks"]
                },
                yAxis: {},
                series: [{
                    name: 'Sales',
                    type: 'bar',
                    data: [5, 20, 36, 10, 10, 20]
                }]
            };

            // use configuration item and data specified to show chart
            myChart.setOption(option);

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
            <div id="Activity" ref="ActivityPlot" style="width:200px; height:150px;">
            </div>
        </div>
        <div id="SocialNetwork">
            
        </div>
        <div id="WordCloud">

        </div>
        <div id="MailList">
            
        </div>
        <user-activity-plot/>
    </div>
</template>

<style lang="scss">

#UserOverview {
    border-style:solid;
}

#Info {
    border-style:none;
}

#Summary {
    border-style:none;
}


</style>
