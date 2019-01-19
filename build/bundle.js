// 这个文件的作用是打包生成最终的代码文件，平常调试可以不用运行
const { fullPath, depPath } = require('./utilities')
const webpack = require('webpack')
const program = require('commander')
const html = require('minify-html')
const path = require('path')
const fs = require('fs')

program
    .option('-d, --dev')
    .option('-p, --prod')
    .parse(process.argv)

const env = program.prod ? 'production' : 'development'

fs.copyFileSync(depPath('vue/dist/vue.runtime.min.js'), fullPath('out/vue.runtime.min.js'))
fs.copyFileSync(depPath('echarts/dist/echarts-en.min.js'), fullPath('out/echarts-en.min.js'))
fs.copyFileSync(depPath('echarts-wordcloud/dist/echarts-wordcloud.min.js'), fullPath('out/echarts-wordcloud.min.js'))

require('./transpile').then(() => {
    const compiler = webpack({
        target: 'web',
        mode: env,
        entry: fullPath('temp/app.vue.js'),
        output: {
            path: fullPath('out'),
            filename: 'index.js',
            chunkFilename: '[name].chunk.js',
            library: 'app',
            libraryTarget: 'umd',
        },
    })
    
    new webpack.ProgressPlugin().apply(compiler)
    
    compiler.run((error, stat) => {
        if (error) {
            console.log(error)
            process.exit(1)
        } else if (stat.compilation.errors.length) {
            console.log(stat.compilation.errors.join('\n'))
            process.exit(1)
        }
    })
    
    fs.copyFileSync(fullPath('temp/index.css'), fullPath('out/index.css'))
    
    fs.writeFileSync(
        fullPath('out/index.html'),
        html.minify(
            fs.readFileSync(fullPath('src/index.html'), 'utf8')
                .replace('<!-- stylesheet -->', () => '<link href=index.css rel=stylesheet>')
                .replace('<!-- javascript -->', () => '<script src=index.js></script>'),
            { collapseWhitespace: true }
        )
            .replace(/<script>[\s\S]*<\/script>/, () => '<script>new Vue(app).$mount(\'#app\')</script>')
            .replace(/(<script src=")([^"]+)("><\/script>)/g, (_, $1, $2, $3) => {
                const filename = path.basename($2)
                // fs.copyFileSync(fullPath('temp', $2), fullPath('dist', filename))
                return $1 + filename + $3
            })
    )
})
    
