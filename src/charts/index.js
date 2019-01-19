const eventBus = require('../EventBus');
const { debounce } = require('throttle-debounce');

module.exports = {
    props: {
        data: Object,
        tag: String,
        origin: String,
    },
    watch: {
        data: 'setOption',
    },
    mounted() {
        this.chart = echarts.init(this.$el);
        this.setOption()
        eventBus.$on('resize', debounce(100, origin => {
            if (!this.chart || origin && origin !== this.origin) return
            this.chart.resize()
        }));
    },
}
