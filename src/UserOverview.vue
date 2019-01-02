
<script>

module.exports = {
    data: () => ({
        Name: '',
        MailAddress: '',
        MailSent: [],
        MailReceived: [],
        Contacts: []
    }),
    created: function () {
        userdata = require('../dist/user.json');
        let userId = 0;
        for (let i = 0; i < userdata.length; ++i) {
            if (userdata[i].Name === "Michael Jackson") {
                userId = i;
                break;
            }
        }
        this.Name = userdata[userId].Name;
        this.MailAddress = userdata[userId].MailAddress;
        this.MailReceived = userdata[userId].MailReceived;
        this.Contacts = userdata[userId].Contacts;
    }
    methods: {
        
    }
}

</script>

<template>
    <div id="User">
        <div id="UserOverview">
            <h2>用户信息</h2>
            <div id="Info">
                姓名：{{Name}}<br>
                邮件地址：{{MailAddress}}<br>
            </div>
            <div id="Summary">
                发送邮件数：{{MailSent.length}}<br>
                接收邮件数：{{MailReceived.length}}<br>
                联系人数：{{Contacts.length}}<br>
            </div>
            <div id="Activity">
                <svg id="ActivityPlot">

                </svg>
            </div>

        </div>
        <div id="WordCloud">

        </div>
        <div id="MailList">

        </div>
        <div id="SocialNetwork">

        </div>
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
