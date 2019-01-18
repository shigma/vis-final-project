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

const eventBus = require('./EventBus')
const { debounce } = require('throttle-debounce')

const staticOptions = {
    visualMap: {
        show: false,
        type: 'continuous',
        seriesIndex: 0,
        min: 0,
    },
    title: {
        left: 'left',
        text: 'Activity',
    },
    legend: {
        left: 'center',
        data: ['邮件数'],
    },
    tooltip: {
        trigger: 'axis',
    },
    toolbox: {
        feature: {
            brush: {
                type: ['lineX', 'clear'],
            },
        },
    },
    brush: {
        xAxisIndex: 'all',
        throttleType: 'debounce',
        throttleDelay: 50000,
        outOfBrush: {
            colorAlpha: 0.1,
        },
    },
    yAxis: {
        splitLine: { show: false },
    },
    series: {
        name: '邮件数',
        type: 'line',
        showSymbol: false,
    },
}

module.exports = {
    data: () => ({
        beginDate: null,
        endDate: null,
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
    watch: {
        data: 'setOption',
    },
    computed: {
        maxValue() {
            return this.data.reduce((total, curr) => {
                return total > curr[1] ? total : curr[1];
            });
        },
    },
    mounted() {
        this.chart = echarts.init(this.$el)
        this.setOption()
        this.chart.on('brush', debounce(100, params => {
            // null if no range is chosen
            this.beginDate = null;
            this.endDate = null;

            if (params.areas[0]) {
                let range = params.areas[0].coordRange;
                if (range[0] > 0 && range[0] < this.data.length) {
                    this.beginDate = new Date(this.data[range[0]][0]);
                }
                if (range[1] > 0 && range[1] < this.data.length) {
                    this.endDate = new Date(this.data[range[1]][0]);
                }
            }

            eventBus.$emit('date-filter-changed', {
                beginDate: this.beginDate,
                endDate: this.endDate,
                tag: this.tag,
            });
        }))
        eventBus.$on('resize', debounce(100, () => {
            if (!this.chart) return
            this.chart.resize()
        }))
    },
    methods: {
        setOption() {
            if (!this.chart) return
            this.chart.setOption({
                ...staticOptions,
                visualMap: {
                    ...staticOptions.visualMap,
                    max: this.maxValue,
                },
                xAxis: {
                    data: this.data.map(item => item[0]),
                },
                series: {
                    ...staticOptions.series,
                    data: this.data.map(item => item[1]),
                },
            });
        },
    },
}

</script>

<template>
    <div></div>
</template>

<style lang="scss" scoped>
</style>
