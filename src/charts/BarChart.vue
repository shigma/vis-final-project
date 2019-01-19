<script>
/**
 * It
 * @author He, Hao
 * @since 2019-01-10
 */

const eventBus = require("../EventBus.js");
const { debounce } = require("throttle-debounce");

const staticOption = {
    grid: {
        left: "3%",
        right: "4%",
        top: 25,
        bottom: "3",
        containLabel: true
    },
    tooltip: {
        trigger: "axis",
        axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow" // 默认为直线，可选为："line' | 'shadow'
        }
    },
    legend: {
        data: ["数量"]
    },
    xAxis: {
        type: "value"
    },
    yAxis: {
        type: "category",
        axisLabel: {
            formatter: "{name|}",
            width: 10,
            rich: {
                name: {
                    width: 10,
                }
            },
        }
    },
    series: {
        name: "邮件数",
        type: "bar",
        label: {
            normal: {
                show: true,
                position: "right",
                formatter: '{b}: {@c}',
                color: 'black',
            },           
        }
    }
};

module.exports = {
    extends: require('.'),
    mounted() {
        this.chart.on(
            "click",
            debounce(100, params => {
                // Emit different type of event according to tag
                if (params.componentType !== "series") return;
                if (this.tag.includes("keyword")) {
                    this.$root.setCard('keyword', { word: this.data[params.dataIndex].name })
                } else if (this.tag.includes("user")) {
                    this.$root.setCard('user', { id: this.data[params.dataIndex].id })
                }
            })
        );
    },
    methods: {
        setOption() {
            if (!this.chart) return;
            let originalData = Array.from(this.data).sort((a, b) => {
                if (a.value > b.value) return 1;
                if (a.value < b.value) return -1;
                return 0;
            });
            this.chart = echarts.init(this.$el);
            let width = this.chart.getWidth();
            let height = this.chart.getHeight();
            let nameList = originalData.map(function(item) {
                return item.name;
            });
            let valueList = originalData.map(function(item) {
                return item.value;
            });
            this.chart.setOption({
                title: {
                    left: "center",
                    text: "Most related " + this.tag,
                    textStyle: {
                        fontSize: 18
                    }
                },
                ...staticOption,
                yAxis: {
                    ...staticOption.yAxis,
                    data: nameList
                },
                series: {
                    ...staticOption.series,
                    data: valueList
                }
            });
        }
    }
};
</script>

<template>
    <div class="bar-chart"/>
</template>

<style lang="scss" scoped>
</style>
