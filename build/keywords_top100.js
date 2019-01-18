// 使用频率前100的关键词
// count记录了每年（-2001） 每月（1-12）的使用数量
// 每年的第0月代表本年和
// oid 是在原先的keywords中的id

const mailsdata = require('../dist/mails.json');
const fs = require('fs');
const path = require('path');
const outDir = path.resolve(__dirname, '../dist');
//const trie = require('../src/keywordTrie.js');
const keyworddata = require('../dist/keywords.json')
//let DFAtree = [];
//DFAtree = trie.initTree(DFAtree);
let keywordSet = [];

let skipwords = new Set(['over']);

let size = keyworddata.length;
for (let i=0; i<size; i++){
    if (skipwords.has(keyworddata[i].keyword)) continue;
    keywordSet.push({
        id: i,
        oid: i,
        name: keyworddata[i].keyword,
        value_mails: keyworddata[i].mails.length,
        value_users: keyworddata[i].users.length, 
    });
}

let sameRootWord = new Map();
//Map.set(, 'files')

keywordSet.sort((a, b) => {
    if (a.value_mails > b.value_mails) return -1;
    if (a.value_mails < b.value_mails) return 1;
    return 0;
})
let kw = [];
size = keywordSet.length;
for (let i=0; i<size; i++){
    kw.push(keywordSet[i].name);
}
size = 100;
for (let i=0; i<size; i++){
    let id = keywordSet[i].id;
    let mdata = keyworddata[id].mails;
    let msize = mdata.length;
    let year = [];
    for (let j=0; j<18; j++){
        year.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }
    for (let j=0; j<msize; j++){
        let date = new Date(mailsdata[mdata[j]].date);
        let y = date.getFullYear() - 2001;
        let m = date.getMonth() + 1;
        year[y][m]++;
        year[y][0]++;
    }
    keywordSet[i].count = year;
    keywordSet[i].id = i;
}
//console.log(JSON.stringify(keywordSet.slice(start, start + 10), null, 2));
fs.writeFileSync(path.resolve(outDir, 'keywords_top100.json'), JSON.stringify(keywordSet.slice(0, 100), null, 2));


