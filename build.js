/* This program creates file 'meta.json'
 * In meta.json we have ID from 1-42889 ordered by timeline
 * We have other information including {
 *     From(string)
 *     Date(string)
 *     Subject(string)
 *     MessageID(string)
 *     InReplyTo(string)
 *     References(array:string)
 * }
 */

const path = require('path')
const fs = require('fs')

const baseDir = path.resolve(__dirname, 'assets')

let index = -1;

fs.writeFileSync(path.resolve(__dirname, 'dist/meta.json'), JSON.stringify(
    [].concat(...fs.readdirSync(baseDir)
        .map(name => fs.readFileSync(path.resolve(baseDir, name), 'utf8')
            .split(/(?=^From .+\r?\n(?:(?:From|Date|Subject|Message-ID|In-Reply-To|References): .+(\r?\n .+)*)+)/gmi)
            .filter(s => s)
            .map(mail => {
                const data = {}
                const heading = mail.match(/^From .+((\r?\n.+)+)/)
                //data.text = mail.slice(heading[0].length).trim()
                data.ID = index++;
                data.meta = {}
                heading[1].match(/^(?:From|Date|Subject|Message-ID|In-Reply-To|References): .+(\r?\n .+)*/mg).forEach(meta => {
                    const key = meta.match(/^[\w-]+/)[0]
                    meta = meta.slice(key.length + 1).trim()
                    data.meta[key.split(/-/g).join('')] = key.toLowerCase() === 'references' ? meta.split(/\s+/g) : meta
                })
                return data
            })
        )
    ).slice(1),
    null,
    2
))
