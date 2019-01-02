const readline = require('readline')
const path = require('path')
const fs = require('fs')

const outDir = path.resolve(__dirname, '../dist')
const baseDir = path.resolve(__dirname, '../assets')

// 如果 dist 文件夹不存在先创建之
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

// 第一个文件是空邮件, 无意义
let index = -1

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

const metaMacro = '(?:From|Date|Subject|Message-ID|In-Reply-To|References): .+(?:\\r?\\n[ \\t].+)*'
const metaRegExp = new RegExp('^' + metaMacro, 'gmi')
const headingRegExp = new RegExp(`^(?=From .+\r?\n(?:${metaMacro})+)`, 'gmi')

/**
 * 解析一个文件中的全部邮件元数据
 * @param {string} source 文件内容
 */
function* parseMetaData(source) {
    const mails = source.split(headingRegExp)
    for (const mail of mails) {
        if (!mail) continue
        const data = {}
        if (!mail.match(/^From .+((\r?\n.+)+)/)) {
            console.log(mail)
        }
        const heading = mail.match(/^From .+((\r?\n.+)+)/)[1]
        data.id = index++
        heading.match(metaRegExp).forEach(meta => {
            const key = meta.match(/^[\w-]+/)[0]
            const camelKey = toCamelCase(key)
            let value = meta.slice(key.length + 1).trim()
            switch (camelKey) {
                case 'date':
                    value = value.match(/^.+/)[0]
                    // 判断日期是否正确: 已测试通过
                    // if (isNaN(new Date(value))) console.log(value)
                    break
                case 'subject':
                case 'from':
                    value = value.replace(/\s+/g, ' ')
                    break
                case 'inReplyTo':
                    if (/^<([^>]+)>$/.test(value)) {
                        value = value.replace(/\s+/g, '')
                    } else {
                        value = undefined
                    }
                    break
                case 'references':
                    value = value.split(/\s+(?=<)/g).map(mail => mail.replace(/\s+/g, ''))
                    break
                case 'messageId':
                    value = value.match(/<([^>]+)>/)[0]
                    // 判断是否存在合法 messageId: 已测试通过
                    // if (!value) console.log(value)
            }
            data[camelKey] = value
        })
        yield data
    }
}

/** 全部邮件列表 */
const mails = Array.from(function* () {
    for (const fileName of fs.readdirSync(baseDir)) {
        yield* parseMetaData(fs.readFileSync(path.resolve(baseDir, fileName), 'utf8'))
    }
}()).slice(1)

console.log('共计 %d 封邮件.', mails.length)

/** 根据 messageId 查找对应的 mailId */
function getMailId(messageId) {
    return mails.findIndex(mail => mail.messageId === messageId)
}

/** 全部用户列表 */
const users = []
let userIndex = 0
let progress = 0

mails.forEach((mail, mailIndex) => {
    // 解决特殊的 Michael Gronager" <mpg@uni-c.dk (Michael Gronager) 字段问题
    let [, address, name] = /(?:^|<)((?:\S+(?:@| at ))?\S+)[ \t]+\((.*)\)$/.exec(mail.from)
    // 解决部分使用 at 取代 @ 的问题, 全部转化为 @ 再处理
    address = address.replace(' at ', '@')
    if (!name) {
        // 部分用户没有 name 字段, 不应当当做一个用户处理
        mail.from = -1
    } else {
        const index = users.findIndex(user => user.address === address)
        if (index >= 0) {
            mail.from = index
            users[index].mails.push(mailIndex)
        } else {
            mail.from = userIndex
            users.push({ id: userIndex++, name, address, mails: [mailIndex] })
        }
    }

    if (mail.inReplyTo) {
        const index = getMailId(mail.inReplyTo)
        mail.inReplyTo = index >= 0 ? index : undefined
    }

    if (mail.references) {
        const references = mail.references.map(getMailId).filter(id => id >= 0)
        mail.references = references.length ? references : undefined
    }

    const progressPercent = Math.floor((mailIndex + 1) / mails.length * 100)
    if (progressPercent > progress) {
        progress = progressPercent
        readline.clearLine(process.stdout, 0)
        readline.cursorTo(process.stdout, 0)
        process.stdout.write(`共计 ${users.length} 位用户. `)
        if (progress !== 100) {
            process.stdout.write(progress + '%')
        }
    }
})

mails.forEach(mail => {
    delete mail.messageId
})

/** 输出到文件 */
function dumpFile(fileName, data) {
    fs.writeFileSync(
        path.resolve(outDir, fileName),
        JSON.stringify(data, null, 2),
    )
}

dumpFile('mails.json', mails)
dumpFile('users.json', users)
