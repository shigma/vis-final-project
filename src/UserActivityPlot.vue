<script>
/**
 * @file UserActivityPlot.vue
 *
 * @brief The components that plot user activity with line gradient
 *
 * The props data should look like:
 *     [["2001-01", 12], ["2001-02", 23], ..., ["2001-12", 23]]
 * Reference:
 *      https://www.jianshu.com/p/7994176fbcc4
 *      http://www.echartsjs.com/examples/editor.html?c=line-gradient
 *
 * @author He, Hao
 * @since 2019-01-07
 */
var echarts = require("echarts");

module.exports = {
    data: () => ({
        chart: {}
    }),
    props: {
        data: {
            required: true,
            type: Object
        }
    },
    mounted: function() {
        this.setEchart();
    },
    updated: function() {
        if (!this.chart) {
            this.setEchart();
        }
        this.chartChange();
    },
    computed: {
        originalData() {
            return this.data;
        },
        maxValue() {
            return this.data.reduce((total, curr) => {
                return total > curr[1] ? total : curr[1];
            });
        },
        option() {
            let that = this;

            var dateList = this.data.map(function(item) {
                return item[0];
            });

            var valueList = this.data.map(function(item) {
                return item[1];
            });

            let obj = {
                // Make gradient line here
                visualMap: {
                    show: false,
                    type: "continuous",
                    seriesIndex: 0,
                    min: 0,
                    max: this.maxValue
                },
                title: {
                    left: "center",
                    text: "Activity"
                },
                tooltip: {
                    trigger: "axis"
                },
                xAxis: {
                    data: dateList
                },
                yAxis: {
                    splitLine: { show: false }
                },
                series: {
                    type: "line",
                    showSymbol: false,
                    data: valueList
                }
            };
            return obj;
        }
    },
    methods: {
        setEchart() {
            let dom = this.$refs.activityplot;
            this.chart = echarts.init(dom);
            this.chart.setOption(this.option);
        },
        chartChange() {
            // this function will be called if the chart is changed
        }
    }
};
</script>

<template>
    <div ref="activityplot"></div>
</template>

<style>
.echarts {
    width: 100%;
    height: 100%;
}
</style>