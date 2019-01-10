<script>
/**
 * It
 * @author He, Hao
 * @since 2019-01-10
 */

const echarts = require("echarts");
const eventBus = require("../src/EventBus.js");

module.exports = {
    props: {
        data: {
            required: true,
            type: Object
        },
        tag: {
            type: String
        }
    },
    data: () => ({}),
    mounted: function() {
        this.setEchart();
    },
    watch: {
        originalData: function() {
            this.setEchart();
        }
    },
    computed: {
        originalData() {
            return this.data;
        },
        maxValue() {
            return this.originalData.reduce((total, curr) => {
                return total > curr[1] ? total : curr[1];
            });
        },
        option() {
            let nameList = this.originalData.map(function(item) {
                return item.name;
            });

            let valueList = this.originalData.map(function(item) {
                return item.value;
            });

            let obj = {
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        // 坐标轴指示器，坐标轴触发有效
                        type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                title: {
                    left: "center",
                    text: this.title
                },
                legend: {
                    data: ["邮件数"]
                },
                grid: {
                    left: "3%",
                    right: "4%",
                    bottom: "3%",
                    containLabel: true
                },
                xAxis: {
                    type: "value"
                },
                yAxis: {
                    type: "category",
                    data: nameList
                },
                series: [
                    {
                        name: "邮件数",
                        type: "bar",
                        label: {
                            normal: {
                                show: true,
                                position: "insideRight"
                            }
                        },
                        data: valueList
                    }
                ]
            };
            return obj;
        }
    },
    methods: {
        setEchart() {
            if (this.chart === undefined) {
                let dom = this.$refs.barchart;
                this.chart = echarts.init(dom);
            }
            this.chart.setOption(this.option);
        },
        chartChange() {
            this.chart.setOption(this.option);
        }
    }
};
</script>

<template>
    <div ref="barchart"></div>
</template>

<style lang="scss" scoped>
</style>
