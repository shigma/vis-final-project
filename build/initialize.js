const { performance } = require('perf_hooks')
const readline = require('readline')
const path = require('path')
const fs = require('fs')

const startTime = performance.now()
const outDir = path.resolve(__dirname, '../dist')
const baseDir = path.resolve(__dirname, '../assets')

// 如果 dist 文件夹不存在先创建之
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

/**
 * 将字符串转换成 camelCase
 * @param {string} source 原字符串
 */
function toCamelCase(source) {
    return source.split(/-/g).map((part, index) => {
        return index
            ? part[0].toUpperCase() + part.slice(1).toLowerCase()
            : part.toLowerCase()
    }).join('')
}

/** 显示进度 */
const progress = new class {
    restart() {
        this._percentage = 0
    }

    inspect(progress, callback) {
        const percentage = Math.floor(progress * 100)
        if (percentage > this._percentage) {
            this._percentage = percentage
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0)
            callback()
            if (percentage !== 100) {
                process.stdout.write(percentage + '%')
            }
        }
    }
}()

// 第一个文件是空邮件, 无意义
let mailIndex = -2
let userIndex = 0
/** 全部邮件字典 */
const mails = new Map()
/** 全部用户字典 */
const users = new Map()
progress.restart()

const metaMacro = '(?:From|Date|Subject|Message-ID|In-Reply-To|References): .+(?:\\r?\\n[ \\t].+)*'
const metaRegExp = new RegExp('^' + metaMacro, 'gmi')
const headingRegExp = new RegExp(`^(?=From .+\r?\n(?:${metaMacro})+)`, 'gmi')
const fromRegExp = /(?:^|<)((?:\S+(?:@| at ))?\S+)[ \t]+\((.*)\)$/

const files = fs.readdirSync(baseDir)
files.forEach((fileName, fileIndex) => {
    const source = fs.readFileSync(path.resolve(baseDir, fileName), 'utf8')
    for (const mail of source.split(headingRegExp)) {
        if (!mail || ++mailIndex === -1) continue
        const data = { id: mailIndex }

        const heading = mail.match(/^From .+((\r?\n.+)+)/)[1]
        heading.match(metaRegExp).forEach(meta => {
            const key = meta.match(/^[\w-]+/)[0]
            let camelKey = toCamelCase(key)
            let value = meta.slice(key.length + 1).trim()
            switch (camelKey) {
                case 'date':
                    value = value.match(/^.+/)[0]
                    // 判断日期是否正确: 已测试通过
                    // if (isNaN(new Date(value))) console.log(value)
                    break
                case 'from': {
                    camelKey = 'userId'
                    // 解决特殊的 Michael Gronager" <mpg@uni-c.dk (Michael Gronager) 字段问题
                    let [, address, name] = fromRegExp.exec(value.replace(/\s+/g, ' '))
                    // 解决部分使用 at 取代 @ 的问题, 全部转化为 @ 再处理
                    address = address.replace(' at ', '@')
                    if (!name) {
                        // 部分用户没有 name 字段, 不应当做一个用户处理
                        value = -1
                    } else {
                        const user = users.get(address)
                        if (user) {
                            value = user.id
                            user.mails.push(mailIndex)
                        } else {
                            value = userIndex
                            users.set(address, { id: userIndex++, name, address, mails: [mailIndex] })
                        }
                    }
                    break
                }
                case 'subject':
                    // 清理换行和 tab
                    value = value.replace(/\s+/g, ' ')
                    break
                case 'inReplyTo': {
                    const match = value.match(/<([^>]+)>/g)
                    const messageId = match
                        ? match[0].replace(/\s+/g, '')
                        : `<${value}>` // 处理 4AD5C597.8020904@sara.nl 的特殊情况
                    const mail = mails.get(messageId)
                    if (mail) {
                        if (!mail.replies) mail.replies = []
                        mail.replies.push(mailIndex)
                        value = mail.id
                    } else {
                        value = undefined
                    }
                    break
                }
                case 'references': {
                    value = value.split(/\s+(?=<)/g)
                    break
                }
                case 'messageId':
                    value = value.match(/<([^>]+)>/)[0]
                    // 判断是否存在合法 messageId: 已测试通过
                    // if (!value) console.log(value)
            }
            data[camelKey] = value
        })

        const refs = (data.references || [])
            .map(messageId => {
                const mail = mails.get(messageId)
                if (!mail) return
                // 如果已经是回复, 就不再记录为引用了
                if (mail.id === data.inReplyTo) return
                if (!mail.citations) mail.citations = []
                mail.citations.push(mailIndex)
                return mail.id
            })
            .filter(id => typeof id === 'number')

        data.references = refs.length ? refs : undefined

        mails.set(data.messageId, data)
        delete data.messageId
    }

    progress.inspect((fileIndex + 1) / files.length, () => {
        process.stdout.write(`共计 ${mails.size} 封邮件, ${users.size} 位用户. `)
    })
})

/** 输出到文件 */
function dumpFile(fileName, data) {
    fs.writeFileSync(
        path.resolve(outDir, fileName),
        JSON.stringify(Array.from(data.values()), null, 2),
    )
}

dumpFile('mails.json', mails)
dumpFile('users.json', users)

console.log(`\n总共用时 ${((performance.now() - startTime) / 1000).toFixed(3)} 秒.`)
