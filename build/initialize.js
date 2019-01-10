const { performance } = require('perf_hooks')
const readline = require('readline')
const path = require('path')
const fs = require('fs')

const startTime = performance.now()
const outDir = path.resolve(__dirname, '../dist')
const baseDir = path.resolve(__dirname, '../assets')

const keywordExtraction = require("../src/Keyword.js");

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
    constructor() {
        this.restart()
    }

    restart() {
        this._percentage = 0
        return this
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
let threadIndex = 0
/** 全部邮件字典 */
const mails = new Map()
/** 全部用户字典 */
const users = new Map()
/** 全部 thread 列表 */
const threads = []
/** 全部关键词列表 */
const keywords = new Map();

const metaMacro = '(?:From|Date|Subject|Message-ID|In-Reply-To|References): .+(?:\\r?\\n[ \\t].+)*'
const metaRegExp = new RegExp('^' + metaMacro, 'gmi')
const headingRegExp = new RegExp(`^(?=From .+\r?\n(?:${metaMacro})+)`, 'gmi')
const fromRegExp = /(?:^|<)((?:\S+(?:@| at ))?\S+)[ \t]+\((.*)\)$/

const files = fs.readdirSync(baseDir)
files.forEach((fileName, fileIndex) => {
    const source = fs.readFileSync(path.resolve(baseDir, fileName), 'utf8')
    for (const mail of source.split(headingRegExp)) {
        if (++mailIndex === -1) continue
        const data = { id: mailIndex }
        let inReplyTo
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
                    inReplyTo = match
                        ? match[0].replace(/\s+/g, '')
                        : `<${value}>` // 处理 4AD5C597.8020904@sara.nl 的特殊情况
                    const mail = mails.get(inReplyTo)
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

        if (mails.has(data.messageId)) {
            mailIndex -= 1
            continue
        }

        const refs = (data.references || [])
            .map(messageId => {
                // 如果已经是回复, 就不再记录为引用了
                if (messageId === inReplyTo) return
                const mail = mails.get(messageId)
                if (!mail) return
                if (!mail.citations) mail.citations = []
                mail.citations.push(mailIndex)
                return mail.id
            })
            .filter(id => typeof id === 'number')

        data.references = refs.length ? refs : undefined

        const mailInreplyTo = inReplyTo && mails.get(inReplyTo)
        if (mailInreplyTo) {
            data.threadId = mailInreplyTo.threadId
            threads[mailInreplyTo.threadId].mails.push(mailIndex)
        } else {
            data.threadId = threadIndex
            threads.push({
                id: threadIndex++,
                mails: [mailIndex],
            })
        }

        thisKeywordList = keywordExtraction.generateKeywords([data.id]);
        thisKeywordList.forEach(word=> {
            const w = keywords.get(word.name)
            if (w) {
                w.mails.push(data.id)
            } else {
                keywords.set(word.name, {keyword: word.name, mails: [data.id]})
            }
        })
        
        mails.set(data.messageId, data)
        delete data.messageId
    }

    progress.inspect((fileIndex + 1) / files.length, () => {
        process.stdout.write(`共计 ${mails.size} 封邮件, ${users.size} 位用户, ${keywords.size} 个关键词, ${threads.length} 条线. `)
    })
})

const mailList = Array.from(mails.values())
threads.forEach(thread => {
    thread.users = []
    thread.mails.forEach(index => {
        const mail = mailList[index]
        if (mail.userId === -1) return
        const user = thread.users.find(user => user.id === mail.userId)
        if (user) {
            user.mails.push(index)
        } else {
            thread.users.push({ id: mail.userId, mails: [index] })
        }
    })
})

// 在users中增加activity属性
console.log("\n");
console.log("预计算user.activity...");
maildata = Array.from(mails.values());
userdata = Array.from(users.values());
users.forEach((user, address) => {
    let result = [];
    let resultIdMap = new Map();
    let minDate = new Date(maildata[user.mails[0]].date);
    let maxDate = new Date(maildata[user.mails[0]].date);
    for (let i = 0; i < user.mails.length; ++i) {
        let date = new Date(maildata[user.mails[i]].date);
        if (date < minDate) minDate = date;
        if (date > maxDate) maxDate = date;
    }
    for (
        let i = minDate.getFullYear();
        i <= maxDate.getFullYear();
        ++i
    ) {
        for (let j = 1; j <= 12; ++j) {
            let ym = i + "-" + j;
            result.push([ym, 0]);
            resultIdMap.set(ym, result.length - 1);
        }
    }
    for (let i = 0; i < user.mails.length; ++i) {
        let date = new Date(maildata[user.mails[i]].date);
        let ym = date.getFullYear() + "-" + date.getMonth();
        let activityIndex = resultIdMap.get(ym);
        if (activityIndex != undefined) {
            result[activityIndex][1]++;
        }
    }
    user.activity = result;
});

// 在users中增加keywords属性
console.log("预计算user.keywords...");
users.forEach(user => {
    user.keywords = keywordExtraction
        .generateKeywords(user.mails)
        .filter((word, index) => index <= 50);
});

// 在users中增加relatedUsers属性
// 这里relatedUser定义为与之有过交互的所有用户，包括InReplyTo和replies
console.log("预计算user.relatedUsers...");
users.forEach(user => {
    let result = [];
    let resultIdMap = new Map();
    user.mails.forEach(currMailId => {
        let mail = maildata[currMailId];
        let currUserIds = [];
        if (mail.inReplyTo != undefined)
            currUserIds.push(maildata[mail.inReplyTo].userId);
        if (mail.replies != undefined)
            mail.replies.forEach(r => {
                currUserIds.push(maildata[r].userId);
            });
            
        currUserIds.forEach(currUserId => {
            if (currUserId === -1 || currUserId === user.id) return;
            let resultId = resultIdMap.get(currUserId);
            if (resultId === undefined) {
                result.push({
                    id: currUserId,
                    name: userdata[currUserId].name,
                    value: 1
                });
                resultIdMap.set(currUserId, result.length - 1);
            } else {
                result[resultId].value++;
            }
        });
    });
    result.sort((a, b) => {
        if (a.value > b.value) return -1;
        else if (a.value < b.value) return 1;
        return 0;
    });
    user.relatedUsers = result.filter((user, index) => index <= 15);    
});

console.log("预计算keyword.activity...");
keywords.forEach((keyword)=>{
    let result = [];
    let resultIdMap = new Map();
    if (keyword.mails.length === 0) return result;
    // set date values
    let minDate = new Date(maildata[keyword.mails[0]].date);
    let maxDate = new Date(maildata[keyword.mails[0]].date);
    for (let i = 0; i < keyword.mails.length; ++i) {
        let date = new Date(maildata[keyword.mails[i]].date);
        if (date < minDate) minDate = date;
        if (date > maxDate) maxDate = date;
    }
    for (
        let i = minDate.getFullYear();
        i <= maxDate.getFullYear();
        ++i
    ) {
        for (let j = 1; j <= 12; ++j) {
            let ym = i + "-" + j;
            result.push([ym, 0]);
            resultIdMap.set(ym, result.length - 1);
        }
    }
    // compute activity values
    for (let i = 0; i < keyword.mails.length; ++i) {
        let date = new Date(maildata[keyword.mails[i]].date);
        let ym = date.getFullYear() + "-" + date.getMonth();
        let resultId = resultIdMap.get(ym);
        if (resultId != undefined) {
            result[resultId][1]++;
        }
    }
    keyword.activity = result;
});

console.log("预计算keyword.users...")
keywords.forEach(keyword => {
    let result = [];
    let resultIdMap = new Map();
    keyword.mails.forEach(id => {
        let currUserId = maildata[id].userId;
        if (currUserId === -1) return;
        let resultId = resultIdMap.get(currUserId);
        if (resultId === undefined) {
            result.push({
                id: currUserId,
                name: userdata[currUserId].name,
                value: 1
            });
            resultIdMap.set(currUserId, result.length - 1);
        } else {
            result[resultId].value++;
        }
    });
    result.sort((a, b) => {
        if (a.value > b.value) return -1;
        if (a.vaule < b.value) return 1;
        return 0;
    });
    result = result.filter((a, index) => index <= 30);
    keyword.users = result;
});

console.log("预计算keyword.relatedKeywords...")
keywords.forEach(keyword => {
    let result = [];
    let resultIdMap = new Map();
    keyword.mails.forEach(id => {
        keys = keywordExtraction.generateKeywords([id]);
        keys.forEach(key => {
            if (key.name.toLowerCase() === keyword.keyword) return;
            resultId = resultIdMap.get(key.name);
            if (resultId === undefined) {
                result.push({ name: key.name, value: 1 });
                resultIdMap.set(key.name, result.length - 1);
            } else {
                result[resultId].value++;
            }
        });
    });
    result.sort((a, b) => {
        if (a.value > b.value) return -1;
        else if (a.value < b.value) return 1;
        return 0;
    });
    keyword.relatedKeywords = result.filter((word, index) => index <= 15);
});

/** 输出到文件 */
function dumpFile(fileName, data) {
    fs.writeFileSync(
        path.resolve(outDir, fileName),
        JSON.stringify(Array.from(data.values()), null, 2),
    )
}

dumpFile('mails.json', mails)
dumpFile('users.json', users)
dumpFile('threads.json', threads)
dumpFile('keywords.json', keywords)

console.log(`\n总共用时 ${((performance.now() - startTime) / 1000).toFixed(3)} 秒.`)
