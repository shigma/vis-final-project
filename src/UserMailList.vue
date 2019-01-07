<script>
/**
 * @file UserMailList.vue
 *
 * @brief The component that displays a mail list that was sent by one user.
 *
 * @author He, Hao
 * @since 2019-01-07
 */

Vue.use(require("element-ui"));

module.exports = {
    props: {
        mailIds: {
            required: true,
            type: Object
        }
    },
    data: function() {
        return {
            mailData: []
        };
    },
    computed: {
        
    },
    mounted: function() {
        const maildata = require('../dist/mails.json');
        this.mailIds.forEach((id)=>{
            this.mailData.push(maildata[id]);
        });
        this.mailData.forEach((data)=>{
            data.date = this.strYearMonthDate(data.date);
        });
    },
    methods: {
        strYearMonthDate(dateStr) {
            let date = new Date(dateStr);
            return date.getFullYear() +'-'+ date.getMonth() +'-'+ date.getDay();
        },
    }
};
</script>

<template>
    <div>
        <el-table :data="mailData" ref="filterTable" stripe style="width: 100%" height="250">
            <el-table-column type="expand">
                <template slot-scope="props">
                    <p>Date: {{ props.row.date }}</p>
                    <p>Subject: {{ props.row.subject }}</p>
                </template>
            </el-table-column>
            <el-table-column label="Date" prop="date" width="100"></el-table-column>
            <el-table-column label="Subject" prop="subject"></el-table-column>
        </el-table>
    </div>
</template>

<style lang="scss">
</style>
