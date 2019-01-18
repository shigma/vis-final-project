<script>
/**
 * It
 * @author He, Hao
 * @since 2019-01-10
 */

const eventBus = require('./EventBus.js');
const { debounce } = require('throttle-debounce');

const staticOption = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为："line' | 'shadow'
        },
    },
    title: {
        left: 'center',
        text: 'Most Related',
    },
    legend: {
        data: ['数量'],
    },
    grid: {
        left: '3%',
        right: '4%',
        top: 30,
        bottom: '3%',
        containLabel: true,
    },
    xAxis: {
        type: 'value',
    },
    yAxis: {
        type: 'category',
    },
    series: {
        name: '邮件数',
        type: 'bar',
        label: {
            normal: {
                show: true,
                position: 'insideRight',
            },
        },
    },
};

module.exports = {
    data: () => ({}),
    props: {
        data: {
            required: true,
            type: Object,
        },
        tag: {
            type: String,
        },
    },
    watch: {
        data: 'setOption',
    },
    computed: {
    },
    mounted() {
        this.chart = echarts.init(this.$el);
        this.setOption();
        this.chart.on('click', debounce(100, params => {
            // Emit different type of event according to tag
            if (params.componentType !== 'series') return
            if (this.tag.includes('keyword')) {
                eventBus.$emit('keyword-changed', {
                    keyword: this.data[params.dataIndex].name,
                    tag: this.tag,
                })
            } else if (this.tag.includes('user')) {
                eventBus.$emit('user-changed', {
                    userId: this.data[params.dataIndex].id,
                    tag: this.tag,
                })
            }
        }))
        eventBus.$on('resize', debounce(100, () => {
            if (!this.chart) return
            this.chart.resize()
        }))
    },
    methods: {
        setOption() {
            if (!this.chart) return;
            let originalData = Array.from(this.data);
            let dom = this.$refs.barchart;
            this.chart = echarts.init(dom);
            let nameList = originalData.map(function(item) {
                return item.name;
            });

            let valueList = originalData.map(function(item) {
                return item.value;
            });
            this.chart.setOption({
                ...staticOption,
                yAxis: {
                    ...staticOption.yAxis,
                    data: nameList,
                },
                series: {
                    ...staticOption.series,
                    data: valueList,
                }
            });
        },
    }
};
</script>

<template>
    <div class="bar-chart" ref="barchart"></div>
</template>

<style lang="scss" scoped>
</style>
