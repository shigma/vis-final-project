const { performance } = require('perf_hooks')
const { fullPath, mkdir } = require('./utilities')
const program = require('commander')
const svgFont = require('@shigma/svg-font')
const readline = require('readline')
const path = require('path')
const fs = require('fs')

program
    .option('-d, --dev')
    .option('-p, --prod')
    .parse(process.argv)

const env = program.dev ? 'development' : 'production'

const startTime = performance.now()
const outDir = fullPath('dist')
const textDir = fullPath('dist', 'text')

const stopwords = [
    'a',
    'able',
    'about',
    'across',
    'after',
    'all',
    'almost',
    'also',
    'am',
    'among',
    'an',
    'and',
    'any',
    'are',
    'as',
    'at',
    'be',
    'because',
    'been',
    'but',
    'by',
    'can',
    'cannot',
    'could',
    'dear',
    'did',
    'do',
    'does',
    'either',
    'else',
    'ever',
    'every',
    'for',
    'from',
    'get',
    'got',
    'had',
    'has',
    'have',
    'he',
    'her',
    'hers',
    'him',
    'his',
    'how',
    'however',
    'i',
    'if',
    'in',
    'into',
    'is',
    'it',
    'its',
    'just',
    'least',
    'let',
    'like',
    'likely',
    'may',
    'me',
    'might',
    'most',
    'must',
    'my',
    'neither',
    'no',
    'nor',
    'not',
    'of',
    'off',
    'often',
    'on',
    'only',
    'or',
    'other',
    'our',
    'own',
    'rather',
    'said',
    'say',
    'says',
    'she',
    'should',
    'since',
    'so',
    'some',
    'than',
    'that',
    'the',
    'their',
    'them',
    'then',
    'there',
    'these',
    'they',
    'this',
    'tis',
    'to',
    'too',
    'twas',
    'us',
    'wants',
    'was',
    'we',
    'were',
    'what',
    'when',
    'where',
    'which',
    'while',
    'who',
    'whom',
    'why',
    'will',
    'with',
    'would',
    'yet',
    'you',
    'your',
    'ain\'t',
    'aren\'t',
    'can\'t',
    'could\'ve',
    'couldn\'t',
    'didn\'t',
    'doesn\'t',
    'don\'t',
    'hasn\'t',
    'he\'d',
    'he\'ll',
    'he\'s',
    'how\'d',
    'how\'ll',
    'how\'s',
    'i\'d',
    'i\'ll',
    'i\'m',
    'i\'ve',
    'isn\'t',
    'it\'s',
    'might\'ve',
    'mightn\'t',
    'must\'ve',
    'mustn\'t',
    'shan\'t',
    'she\'d',
    'she\'ll',
    'she\'s',
    'should\'ve',
    'shouldn\'t',
    'that\'ll',
    'that\'s',
    'there\'s',
    'they\'d',
    'they\'ll',
    'they\'re',
    'they\'ve',
    'wasn\'t',
    'we\'d',
    'we\'ll',
    'we\'re',
    'weren\'t',
    'what\'d',
    'what\'s',
    'when\'d',
    'when\'ll',
    'when\'s',
    'where\'d',
    'where\'ll',
    'where\'s',
    'who\'d',
    'who\'ll',
    'who\'s',
    'why\'d',
    'why\'ll',
    'why\'s',
    'won\'t',
    'would\'ve',
    'wouldn\'t',
    'you\'d',
    'you\'ll',
    'you\'re',
    'you\'ve',
]

// 如果 dist 文件夹不存在先创建之
mkdir(outDir)
mkdir(textDir)
mkdir(fullPath('out'))

svgFont({
    srcFile: path.resolve(__dirname, 'icons.svg'),
    outFile: path.resolve(fullPath('out'), 'icons.css'),
})

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
    }

    inspect(progress, callback) {
        const percentage = Math.floor(progress * 100)
        if (percentage > this._percentage) {
            this._percentage = percentage
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0)
            callback(percentage)
            if (percentage < 100) {
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
const keywords = new Map()
const mailTexts = []

const metaMacro = '(?:From|Date|Subject|Message-ID|In-Reply-To|References): .+(?:\\r?\\n[ \\t].+)*'
const metaRegExp = new RegExp('^' + metaMacro, 'gmi')
const headingRegExp = new RegExp(`^(?=From .+\r?\n(?:${metaMacro})+)`, 'gmi')
const fromRegExp = /(?:^|<)((?:\S+(?:@| at ))?\S+)[ \t]+\((.*)\)$/

const files = fs.readdirSync(fullPath('assets'))
files.forEach((fileName, fileIndex) => {
    const source = fs.readFileSync(fullPath('assets', fileName), 'utf8')
    for (const mail of source.split(headingRegExp)) {
        if (++mailIndex === -1) continue
        const data = { id: mailIndex }
        let inReplyTo
        const heading = mail.match(/^From .+((\r?\n.+)+)/)

        heading[1].match(metaRegExp).forEach(meta => {
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
                    value = value.replace(/\s+/g, ' ').replace(/\[Paraview\]/i, '')
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

        // 处理 MessageId 重复的情况
        if (mails.has(data.messageId)) {
            mailIndex -= 1
            continue
        }

        // 邮件内容
        mailTexts.push(mail
            .slice(heading[0].length)
            .replace(/^>.*(\r?\n)?/mg, '')
            .replace(/(^.+ wrote:\s*)?----+ ?Original Message( Follows)? ?----+[\s\S]*/mg, '')
            .trim())

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

        data.date = (date => {
            let d = new Date(date);
            let ret = d.getFullYear() + '/' + (d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1) : (d.getMonth()+1)) + 
                '/' + (d.getDate() < 10 ? '0' + d.getDate() : d.getDate());
            //console.log(ret);
            return ret;
        })(data.date);
        //console.log(data.date);
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
console.log('\n');

const maildata = Array.from(mails.values());
const userdata = Array.from(users.values());

for (let i = 0; i < maildata.length; ++i) {
    const thisKeywordList = generateKeywords([maildata[i].id], maildata);
    thisKeywordList.forEach(word => {
        const w = keywords.get(word.name)
        if (w) {
            w.mails.push(maildata[i].id)
        } else {
            keywords.set(word.name, { keyword: word.name, mails: [maildata[i].id] })
        }
    })
}

function generateKeywords(mailIds, maildata) {
    let keywords = [];

    mailIds.forEach(id => {
        const mail = maildata[id];
        let str = mail.subject
            .replace(/[^a-zA-Z\s\\/]/g, '')
            .split(' ');
        str.forEach(x => {
            x = x.toLowerCase();
            if (x.length <= 2) return;
            if (stopwords.includes(x)) return;
            let id = keywords.findIndex(y => {
                return y.name === x;
            });
            if (id === -1) {
                keywords.push({ name: x, value: 1 });
            } else {
                keywords[id].value++;
            }
        });
    });

    keywords.sort((w1, w2) => {
        if (w1.value < w2.value) {
            return 1;
        } else if (w1.value > w2.value) {
            return -1;
        } else {
            return 0;
        }
    });

    return keywords;
}

console.log('预计算user.activity...');
users.forEach(user => {
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
            let ym = i + '-' + j;
            result.push([ym, 0]);
            resultIdMap.set(ym, result.length - 1);
        }
    }
    for (let i = 0; i < user.mails.length; ++i) {
        let date = new Date(maildata[user.mails[i]].date);
        let ym = date.getFullYear() + '-' + date.getMonth();
        let activityIndex = resultIdMap.get(ym);
        if (activityIndex !== undefined) {
            result[activityIndex][1]++;
        }
    }
    user.activity = result;
});

// 在users中增加keywords属性
console.log('预计算user.keywords...');
users.forEach(user => {
    user.keywords = generateKeywords(user.mails, maildata)
        .filter((word, index) => index <= 50);
});

// 在users中增加relatedUsers属性
// 这里relatedUser定义为与之有过交互的所有用户，包括InReplyTo和replies
console.log('预计算user.relatedUsers...');
users.forEach(user => {
    let result = [];
    let resultIdMap = new Map();
    user.mails.forEach(currMailId => {
        let mail = maildata[currMailId];
        let currUserIds = [];
        if (mail.inReplyTo !== undefined)
            currUserIds.push(maildata[mail.inReplyTo].userId);
        if (mail.replies !== undefined)
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
                    value: 1,
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

console.log('预计算keyword.activity...');
keywords.forEach(keyword => {
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
            let ym = i + '-' + j;
            result.push([ym, 0]);
            resultIdMap.set(ym, result.length - 1);
        }
    }
    // compute activity values
    for (let i = 0; i < keyword.mails.length; ++i) {
        let date = new Date(maildata[keyword.mails[i]].date);
        let ym = date.getFullYear() + '-' + date.getMonth();
        let resultId = resultIdMap.get(ym);
        if (resultId !== undefined) {
            result[resultId][1]++;
        }
    }
    keyword.activity = result;
});

console.log('预计算keyword.users...')
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
                value: 1,
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

console.log('预计算keyword.relatedKeywords...')
keywords.forEach(keyword => {
    let result = [];
    let resultIdMap = new Map();
    keyword.mails.forEach(id => {
        const keys = generateKeywords([id], maildata);
        keys.forEach(key => {
            if (key.name.toLowerCase() === keyword.keyword) return;
            const resultId = resultIdMap.get(key.name);
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
    data = Array.from(data.values())
    fs.writeFileSync(
        path.resolve(outDir, fileName + '.json'),
        env === 'production'
            ? JSON.stringify(data)
            : JSON.stringify(data, null, 2)
    )
}

dumpFile('mails', mails)
dumpFile('users', users)
dumpFile('threads', threads)
dumpFile('keywords', keywords)

for (let index = 0; index < mailTexts.length; index += 200) {
    dumpFile('text/' + index / 200, mailTexts.slice(index, index + 200))
}

console.log(`\n总共用时 ${((performance.now() - startTime) / 1000).toFixed(3)} 秒.`)
