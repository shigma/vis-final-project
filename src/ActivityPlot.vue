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
        beginDate: null,
        endDate: null
    }),
    props: {
        data: {
            required: true,
            type: Object
        },
        tag: {
            type: String
        }
    },
    mounted: function() {
        this.setEchart();
    },
    watch: {
        data: function(newData, oldData) {
            this.setEchart();
        }
    },
    computed: {},
    methods: {
        setEchart() {
            let originalData = Array.from(this.data);
            let maxValue = originalData.reduce((total, curr) => {
                return total > curr[1] ? total : curr[1];
            });
            let dom = this.$refs.activityplot;
            let chart = echarts.init(dom);
            chart.off("brush");
            chart.on("brush", params => {
                // null if no range is chosen
                this.beginDate = null;
                this.endDate = null;

                if (params.areas[0]) {
                    let range = params.areas[0].coordRange;
                    if (range[0] > 0 && range[0] < originalData.length) {
                        this.beginDate = new Date(originalData[range[0]][0]);
                    }
                    if (range[1] > 0 && range[1] < originalData.length) {
                        this.endDate = new Date(originalData[range[1]][0]);
                    }
                }

                eventBus.$emit("date-filter-changed", {
                    beginDate: this.beginDate,
                    endDate: this.endDate,
                    tag: this.tag
                });
            });
            let dateList = originalData.map(function(item) {
                return item[0];
            });

            let valueList = originalData.map(function(item) {
                return item[1];
            });

            let obj = {
                // Make gradient line here
                visualMap: {
                    show: false,
                    type: "continuous",
                    seriesIndex: 0,
                    min: 0,
                    max: maxValue
                },
                title: {
                    left: "left",
                    text: "Activity"
                },
                grid: {
                    top: 30,
                    bottom: 20,
                },
                legend: {
                    left: "center",
                    data: ["邮件数"]
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
                    name: "邮件数",
                    type: "line",
                    showSymbol: false,
                    data: valueList
                }
            };
            chart.setOption(obj);
        }
    }
};
</script>

<template>
    <div id="activityplot" ref="activityplot"></div>
</template>

<style lang="scss" scoped>
#activityplot {
    will-change: transform;
}
</style>