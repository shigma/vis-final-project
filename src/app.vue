<script>

Vue.use(require('element-ui'))

const MIN_WIDTH = 0.1

Vue.prototype.dataset = {
    keywords: require('../dist/keywords'),
    mails: require('../dist/mails'),
    threads: require('../dist/threads'),
    users: require('../dist/users'),
}

module.exports = {
    components: {
        UserOverview: require('./UserOverview.vue'),
        KeywordOverview: require('./KeywordOverview.vue'),
        ThreadOverview: require('./ThreadOverView.vue'),
    },

    data: () => ({
        dragging: false,
        display: {
            user: {
                show: true,
                width: 0.3,
            },
            keyword: {
                show: true,
                width: 0.3,
            },
            thread: {
                show: true,
                width: 0.4,
            },
        },
    }),

    computed: {
        leftBorderStyle() {
            return {}
        },
        rightBorderStyle() {
            return {}
        },
        userStyle() {
            return {
                left: '0',
                width: this.display.user.width * 100 + '%',
            }
        },
        keywordStyle() {
            return {
                left: this.display.user.width * 100 + '%',
                width: this.display.keyword.width * 100 + '%',
            }
        },
        threadStyle() {
            return {
                right: '0',
                width: this.display.thread.width * 100 + '%',
            }
        },
    },

    mounted() {
        addEventListener('mouseup', () => {
            this.$refs.left.classList.remove('active')
            this.$refs.right.classList.remove('active')
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
    },
}

</script>

<template>
    <div class="app" :class="{ dragging }">
        <div class="view" :style="userStyle"><user-overview/></div>
        <div class="border left" ref="left" :style="leftBorderStyle"
            @mousedown.stop="startDrag('left', $event)"/>
        <div class="view" :style="keywordStyle"><keyword-overview/></div>
        <div class="border right" ref="right" :style="rightBorderStyle"
            @mousedown.stop="startDrag('right', $event)"/>
        <div class="view" :style="threadStyle"><thread-overview/></div>
    </div>
</template>

<style lang="scss">

body {
    margin: 0;
    overflow: hidden;
}

.view, .border {
    position: absolute;
    height: 100%;
}

.view {
    overflow-y: scroll;
}

.border {
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
