<script>

Vue.component('card-view', require('./CardView.vue'))
Vue.component('mail-list', require('./charts/MailList.vue'))
Vue.component('line-chart', require('./charts/LineChart.vue'))
Vue.component('bar-chart', require('./charts/BarChart.vue'))
Vue.component('word-cloud', require('./charts/WordCloud.vue'))

// const MIN_WIDTH = 0.1
const eventBus = Vue.prototype.$eventBus = require('./EventBus')

Vue.prototype.dataset = {
    keywords: require('../dist/keywords'),
    mails: require('../dist/mails'),
    threads: require('../dist/threads'),
    users: require('../dist/users'),
}

Vue.prototype.getMailText = async id => {
    const chunk = await import(`../dist/text/${Math.floor(id / 200)}`)
    return chunk[id % 200]
}

module.exports = {
    components: {
        User: require('./User.vue'),
        Keyword: require('./Keyword.vue'),
        Thread: require('./Thread.vue'),
        Overview: require('./Overview.vue'),
        Draggable: require('vuedraggable'),
    },

    data: () => ({
        dragging: false,
        cards: [{ type: 'overview' }],
    }),

    watch: {
        'cards.length'() {
            this.$nextTick(() => eventBus.$emit('resize'))
        },
    },

    mounted() {
        addEventListener('resize', () => eventBus.$emit('resize'))

        // // dragging events
        // addEventListener('mouseup', () => {
        //     // this.$refs.left.classList.remove('active')
        //     // this.$refs.right.classList.remove('active')
        //     this.dragging = null
        // }, { passive: true })

        // addEventListener('mousemove', event => {
        //     let left, right
        //     if (this.dragging === 'left') {
        //         left = 'user'
        //         right = 'keyword'
        //     } else if (this.dragging === 'right') {
        //         left = 'keyword'
        //         right = 'thread'
        //     } else return

        //     event.stopPropagation()

        //     const baseWidth = innerWidth / this.totalWidth
        //     const deltaX = (this.draggingLastX - event.clientX) / baseWidth
        //     this.draggingLastX = event.clientX
        //     if (this.display[left].width - deltaX < MIN_WIDTH) {
        //         this.draggingLastX += (MIN_WIDTH - this.display[left].width + deltaX) * baseWidth
        //         this.display[right].width += this.display[left].width - MIN_WIDTH
        //         this.display[left].width = MIN_WIDTH
        //     } else if (this.display[right].width + deltaX < MIN_WIDTH) {
        //         this.draggingLastX -= (MIN_WIDTH - this.display[right].width - deltaX) * baseWidth
        //         this.display[left].width -= MIN_WIDTH - this.display[right].width
        //         this.display[right].width = MIN_WIDTH
        //     } else {
        //         this.display[left].width -= deltaX
        //         this.display[right].width += deltaX
        //     }
        // })
    },

    methods: {
        setCard(type, data) {
            const index = this.cards.findIndex(card => card.type === type)
            if (index >= 0) {
                Object.assign(this.cards[index], data)
            } else {
                this.cards.unshift(Object.assign(data, { type }))
            }
        },
        closeCard(type) {
            const index = this.cards.findIndex(card => card.type === type)
            if (index >= 0) this.cards.splice(index, 1)
        },
        startDrag(position, event) {
            // this.dragging = position
            // this.$refs[position].classList.add('active')
            // this.draggingLastX = event.clientX
        },
        getCardStyle() {
            return {
                width: 100 / this.cards.length + 'vw',
            }
        },
        // Tranision Hooks
        beforeTransition(el) {
            el.style.left = el.offsetLeft + 'px'
            el.style.position = 'absolute'
        },
        afterTransition(el) {
            el.style.left = null
            el.style.position = 'relative'
        },
    },
}

</script>

<template>
    <div class="app" :class="{ dragging }">
        <Draggable :list="cards" @start="dragging = true" @end="dragging = false"
            :options="{ animation: 150, ghostClass: 'drag-ghost', handle: '.title' }">
            <transition-group tag="div" name="card" class="cards"
                :move-class="dragging ? 'no-transition' : ''"
                @beforeEnter="beforeTransition" @afterEnter="afterTransition"
                @beforeLeave="beforeTransition" @afterLeave="afterTransition">
                <component v-for="(card, index) in cards" :key="index" :is="card.type"
                    :style="getCardStyle(card, index)" :data="card"/>
            </transition-group>
        </Draggable>
    </div>
</template>

<style lang="scss">

body {
    margin: 0;
    overflow: hidden;
}

.no-transition {
    transition: none !important;
}

.drag-ghost {
    opacity: 0.3;
}

.cards {
    float: left;
    top: 0px;
    height: 100%;
    position: absolute;
    display: flex;
}

.card-enter { opacity: 0; transform: translateX(-100%) }
.card-leave-to { opacity: 0; transform: translateY(-100%) }
.card-enter-active, .card-leave-active { transition: 0.5s ease }

.border {
    position: absolute;
    height: 100%;
    width: 2px;
    z-index: 2;
    opacity: 0;
    user-select: none;
    transition: 0.3s ease;

    &.left {
        left: 0;
        margin-left: -1px;
    }

    &.right {
        right: 0;
        margin-right: -1px;
    }
}

.app.dragging {
    > .view, > .border {
        transition: none !important;
    }
}

</style>
