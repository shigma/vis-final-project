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

const echarts = require("echarts");
const eventBus = require("../src/EventBus.js");

module.exports = {
    data: () => ({
        chart: {},
        beginDate: Date,
        endDate: Date
    }),
    props: {
        data: {
            required: true,
            type: Object,
        },
        tag: {
            type: String,
        },
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

            let dateList = this.data.map(function(item) {
                return item[0];
            });

            let valueList = this.data.map(function(item) {
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
                toolbox: {
                    feature: {
                        brush: {
                            type: ["lineX", "clear"]
                        }
                    }
                },
                brush: {
                    xAxisIndex: "all",
                    throttleType: "debounce",
                    throttleDelay: 50000,
                    outOfBrush: {
                        colorAlpha: 0.1
                    }
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
    watch: {},
    methods: {
        setEchart() {
            let dom = this.$refs.activityplot;
            this.chart = echarts.init(dom);
            this.chart.setOption(this.option);
            this.chart.on("brush", params => {
                // null if no range is chosen
                this.beginDate = null;
                this.endDate = null;
                //console.log(params);

                if (params.areas[0]) {
                    let range = params.areas[0].coordRange;
                    if (range[0] > 0 && range[0] < this.data.length) {
                        this.beginDate = new Date(this.data[range[0]][0]);
                    }
                    if (range[1] > 0 && range[1] < this.data.length) {
                        this.endDate = new Date(this.data[range[1]][0]);
                    }
                }

                eventBus.$emit("date-filter-changed", {
                    beginDate: this.beginDate,
                    endDate: this.endDate,
                    tag: this.tag,
                });
            });
        },
        chartChange() {
            this.chart.setOption(this.option);
        }
    }
};
</script>

<template>
    <div ref="activityplot">{{data}}</div>
</template>

<style lang="scss" scoped>
.echarts {
    width: 100%;
    height: 100%;
}
</style>