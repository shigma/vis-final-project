<script>

module.exports = {
    props: ['type', 'title'],
}

</script>

<template>
    <div class="card">
        <div class="title"
            @mousedown.middle.prevent.stop="$root.closeCard(type)">
            <i class="icon-envelop" @click.stop=""/>
            {{ title }}
            <i class="icon-close" @click.stop="$root.closeCard(type)"/>
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

    > .title, > .container {
        position: absolute;
        left: 0;
        width: 100%;
    }

    > .title {
        top: 0;
        height: 6%;
        user-select: none;
        cursor: -webkit-grab;
        background: #c0c3cc;
        line-height: 6vh;
        font-size: 4vh;
        text-align: center;

        i {
            color: #909399;
            cursor: pointer;
            line-height: 4vh;
            transition: 0.3s ease;
        }

        i:hover { color: #606266 }

        i.icon-envelop {
            float: left;
            font-size: 3vh;
            padding: 1vh 1.6vh;
        }

        i.icon-close {
            float: right;
            font-size: 2vh;
            padding: 1vh 1.6vh;
        }
    }

    > .container {
        top: 6%;
        bottom: 0;
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

