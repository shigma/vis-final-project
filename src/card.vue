<script>

module.exports = {
    props: ['type', 'title', 'envelop'],

    data: () => ({
        showMailList: false,
    }),

    methods: {
        handleClose() {
            this.$root.closeCard(this.type)
        },
        triggerMailList() {
            if (this.envelop === undefined) return
            this.showMailList = !this.showMailList
        },
    },
}

</script>

<template>
    <div class="card">
        <div class="title" @mousedown.middle.prevent.stop="handleClose">
            <i v-if="envelop !== undefined" @click.left.stop="triggerMailList"
                class="icon-envelop" :class="{ active: showMailList }"/>
            {{ title }}
            <i class="icon-close" @click.left.stop="handleClose"/>
        </div>
        <div class="mail-list-container" :class="{ active: showMailList }">
            <slot name="mail-list"/>
        </div>
        <div class="container"><slot/></div>
    </div>
</template>

<style lang="scss">

.card {
    height: 100%;
    overflow: hidden;
    transition: 0.5s ease;
    display: inline-block;
    position: relative;

    > .title, > .container, > .mail-list-container {
        position: absolute;
        left: 0;
        width: 100%;
    }

    > .title {
        top: 0;
        height: 6vh;
        user-select: none;
        cursor: -webkit-grab;
        background: #c0c4cc;
        line-height: 6vh;
        font-size: 4vh;
        text-align: center;
        z-index: 10;

        i {
            color: #909399;
            cursor: pointer;
            line-height: 4vh;
            transition: 0.3s ease;

            &:hover { color: #606266 }

            &.active { color: #303133 }

            &.icon-envelop {
                float: left;
                font-size: 3vh;
                padding: 1vh 1.6vh;
            }

            &.icon-close {
                float: right;
                font-size: 2vh;
                padding: 1vh 1.6vh;
            }
        }
    }

    > .mail-list-container {
        top: -88vh;
        height: 94vh;
        z-index: 3;
        overflow: hidden;
        transition: 0.3s ease;
        background: white;

        > .mail-list {
            height: 100%;
        }

        &.active { top: 6vh }
    }

    > .container {
        top: 6vh;
        bottom: 0;
        z-index: 0;
        overflow: hidden;
    }

    ::-webkit-scrollbar {
        width: 0.6em;
        height: 0.4em;
    }

    ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.2);
        border-radius: 0.6em;
    }

    ::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 0.6em;
    }
    
    ::-webkit-scrollbar-track:hover {
        -box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.3);
    }
}

</style>

