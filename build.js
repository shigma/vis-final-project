const path = require('path')
const fs = require('fs')

const baseDir = path.resolve(__dirname, 'assets')

fs.writeFileSync(path.resolve(__dirname, 'dist/output.json'), JSON.stringify(
  [].concat(...fs.readdirSync(baseDir)
    .map(name => fs.readFileSync(path.resolve(baseDir, name), 'utf8')
      .split(/(?=^From .+\r?\n(?:(?:From|Date|Subject|Message-ID|In-Reply-To|References): .+(\r?\n .+)*)+)/gmi)
      .filter(s => s)
      .map(mail => {
        const data = {}
        const heading = mail.match(/^From .+((\r?\n.+)+)/)
        //data.text = mail.slice(heading[0].length).trim()
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
