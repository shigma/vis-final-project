// 这个文件的作用是将 vue 组件转译成 js 文件
// 这部分我已经写好并抽象成一个库了
// 可以参考 https://github.com/sfc2js/sfc2js
// 不过不想了解其中的原理也完全没有关系的~~

const { fullPath } = require('./utilities')
const sfc2js = require('sfc2js')

module.exports = sfc2js
    .install(require('@sfc2js/sass'))
    .transpile({
        baseDir: fullPath(),
        srcDir: 'src',
        outDir: 'temp',
        filter: ['index.html'],
        outCSSFile: 'index.css',
        enterance: process.argv[0].endsWith('electron.exe') ? 'app.vue' : '',
    })
