<script>

// 结构上请统一保持 script + template + style
// 不同的快之间空一行
// template 内部正常缩进，不用有行
// script 和 style 内的文本不缩进，但是开始和结束时各留一个空行

// 保证 script 中有一个 module.exports
// 其中的内容为你要输出的 Vue 组件
module.exports = {
    // 不用写 el，transpile 会全权处理相关的事情

    // data 请使用函数式
    // 这或许不是必要的，但是有助于规避潜在的问题
    // 深层次的原因可以参考 Vue 文档
    data: () => ({
        message: 'Hello World',
    }),
}

</script>

<template>
    <div class="message">{{ message }}</div>
</template>

<style lang="scss" scoped>

// scoped 的作用是限制这个 style 仅在当前组件内生效
// scss 是 css 语法的超集，如果需要使用相关语法可以写
// 你甚至可以写多个 style，可以拥有不同的 scope 和 lang
// 转译会处理好这些事情，不必担心

.message {
    color: blueviolet;
    transition: 0.3s ease;

    // 父组件选择器 &
    // 相当于 .message:hover
    &:hover {
        color: deepskyblue;
    }
}

</style>
