<script>

module.exports = {
    props: ['type', 'title'],
}

</script>

<template>
    <div class="view">
        <div class="title">{{ title }}</div>
        <div class="container"><slot/></div>
    </div>
</template>

<style lang="scss" scoped>

.view {
    height: 100%;
    overflow: hidden;
    overflow-y: hidden;
    position: absolute;

    > .title, > .container {
        position: absolute;
        left: 0;
        width: 100%;
    }

    > .title {
        top: 0;
        height: 6%;
        user-select: none;
        background: #c0c3cc;
        line-height: 6vh;
        font-size: 4vh;
        text-align: center;
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

