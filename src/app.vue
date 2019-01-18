<script>

Vue.use(require('element-ui'))

const eventBus = require('./EventBus')
const MIN_WIDTH = 0.1

Vue.prototype.dataset = {
    keywords: require('../dist/keywords'),
    mails: require('../dist/mails'),
    threads: require('../dist/threads'),
    users: require('../dist/users'),
}

Vue.prototype.getMailText = function(mailId) {
    const fileIndex = Math.floor(mailId / 100)
    return require('../dist/text/' + fileIndex)[mailId % 100]
}

module.exports = {
    components: {
        User: require('./UserOverview.vue'),
        Keyword: require('./KeywordOverview.vue'),
        Thread: require('./ThreadOverView.vue'),
        Overview: require('./Overview.vue'),
    },

    data: () => ({
        dragging: false,
        cards: [
            {
                type: 'user',
                width: 1,
            },
            {
                type: 'keyword',
                width: 1,
            },
            {
                type: 'thread',
                width: 1,
            },
            {
                type: 'overview',
                width: 1,
            },
        ],
        display: {
            user: {
                show: true,
                width: 0.25,
            },
            keyword: {
                show: true,
                width: 0.25,
            },
            thread: {
                show: true,
                width: 0.25,
            },
            overview: {
                show: true,
                width: 0.25,
            },
        },
    }),

    mounted() {
        addEventListener('resize', () => eventBus.$emit('resize'))

        // dragging events
        addEventListener('mouseup', () => {
            // this.$refs.left.classList.remove('active')
            // this.$refs.right.classList.remove('active')
            this.dragging = null
        }, { passive: true })

        addEventListener('mousemove', event => {
            let left, right
            if (this.dragging === 'left') {
                left = 'user'
                right = 'keyword'
            } else if (this.dragging === 'right') {
                left = 'keyword'
                right = 'thread'
            } else return

            event.stopPropagation()

            const baseWidth = innerWidth / this.totalWidth
            const deltaX = (this.draggingLastX - event.clientX) / baseWidth
            this.draggingLastX = event.clientX
            if (this.display[left].width - deltaX < MIN_WIDTH) {
                this.draggingLastX += (MIN_WIDTH - this.display[left].width + deltaX) * baseWidth
                this.display[right].width += this.display[left].width - MIN_WIDTH
                this.display[left].width = MIN_WIDTH
            } else if (this.display[right].width + deltaX < MIN_WIDTH) {
                this.draggingLastX -= (MIN_WIDTH - this.display[right].width - deltaX) * baseWidth
                this.display[left].width -= MIN_WIDTH - this.display[right].width
                this.display[right].width = MIN_WIDTH
            } else {
                this.display[left].width -= deltaX
                this.display[right].width += deltaX
            }
        })
    },

    methods: {
        startDrag(position, event) {
            this.dragging = position
            this.$refs[position].classList.add('active')
            this.draggingLastX = event.clientX
        },
        getCardStyle(card, index) {
            return {
                left: 100 / this.cards.length * index + '%',
                width: 100 / this.cards.length + '%',
            }
        },
    },
}

</script>

<template>
    <div class="app" :class="{ dragging }">
        <transition-group>
            <component v-for="(card, index) in cards" :key="index" :is="card.type"
                :style="getCardStyle(card, index)"/>
        </transition-group>
        <!-- <div class="border left" ref="left" :style="leftBorderStyle"
            @mousedown.stop="startDrag('left', $event)"/> -->
        <!-- <div class="border right" ref="right" :style="rightBorderStyle"
            @mousedown.stop="startDrag('right', $event)"/> -->
    </div>
</template>

<style lang="scss">

body {
    margin: 0;
    overflow: hidden;
}

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
