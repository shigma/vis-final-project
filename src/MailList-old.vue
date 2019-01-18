<script>
/**
 * @file UserMailList.vue
 *
 * @brief The component that displays a mail list.
 *
 * @author He, Hao
 * @since 2019-01-07
 */

const maildata = require("../dist/mails.json");
const eventBus = require('./EventBus.js');

module.exports = {
    props: {
        mailIds: {
            required: true,
            type: Object
        },
        beginDate: {
            required: true,
            type: Date,
        },
        endDate: {
            required: true,
            type: Date,
        },
    },
    data: function() {
        return {
            mailData: [],
            search: "", // For the text search box
        };
    },
    watch: {
        mailIds: function(newData, oldData) {
            let result = [];
            this.mailIds.forEach(id => {
                result.push(maildata[id]);
            });
            for (let i = 0; i < result.length; ++i) {
                result[i].date = new Date(result[i].date);
            }
            this.mailData = result;
        },
    },
    computed: {
        displayedMailData() {
            displayedMailData = this.mailData.filter(data => {
                let flag = true;
                let date = new Date(data.date);
                if (this.search.trim() != "")
                    flag &= data.subject.toUpperCase().includes(this.search.toUpperCase());
                if (this.beginDate != null)
                    flag &= date > this.beginDate;
                if (this.endDate != null) 
                    flag &= date < this.endDate;
                return flag;
            });
        },
    },
    mounted: function() {},
    methods: {
        spanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 2) {
                return [1, 2]; // first rowspan, second column span
            } else if (columnIndex === 1) {
                return [1, 1];
            }
        },
        sortByDate(data1, data2) {
            if (data1.date < data2.date) {
                return -1;
            } else if (data1.date > data2.date) {
                return 1;
            }
            return 0;
        }
    }
};
</script>

<template>
    <div id="MailList">
        <el-table
            :data="displayedMailData"
            :span-method="spanMethod"
            ref="filterTable"
            stripe
            style="width: 100%"
            height="250"
        >
            <el-table-column type="expand">
                <template slot-scope="props">
                    <p>邮件ID：{{ props.row.id }}</p>
                    <p>日期：{{ props.row.date.toLocaleDateString() }}</p>
                    <p>主题：{{ props.row.subject }}</p>
                    <div v-if="props.row.inReplyTo != undefined">
                        <p>回复：{{ props.row.inReplyTo }}</p>
                    </div>
                    <div v-if="props.row.replies != undefined">
                        <p>被回复：{{ props.row.replies}}</p>
                    <div v-if="props.row.references != undefined">
                        <p>引用： {{ props.row.references }}</p>
                    </div>
                    <div v-if="props.row.citations != undefined">
                        <p>被引用：{{ props.row.citations }}</p>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                label="日期"
                props="date"
                width="100"
                sortable
                :sort-method="sortByDate">
                <template slot-scope="scope">
                    {{ scope.row.date.toLocaleDateString() }}
                </template>
            </el-table-column>
            <el-table-column label="主题" prop="subject"></el-table-column>
            <el-table-column>
                <template slot="header" slot-scope="scope">
                    <el-input
                        v-model="search"
                        align="right"
                        size="mini"
                        placeholder="Type to search"
                    />
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<style lang="scss" scoped>
#MailList {
    will-change: transform;
}
</style>
