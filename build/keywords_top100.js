// 使用频率前100的关键词
// count记录了每年（-2001） 每月（1-12）的使用数量
// 每年的第0月代表本年和
// oid 是在原先的keywords中的id

let debug = 0;

const mailsdata = require('../dist/mails.json');
const fs = require('fs');
const path = require('path');
const outDir = path.resolve(__dirname, '../dist');
//const trie = require('../src/keywordTrie.js');
const keyworddata = require('../dist/keywords.json')
//let DFAtree = [];
//DFAtree = trie.initTree(DFAtree);
let keywordSet = [];

let skipwords = new Set([
    'over',
    'very',
]);
let sameRootWord = new Map();
sameRootWord.set('files', 9);
sameRootWord.set('ver', 22);
sameRootWord.set('verions', 22);
sameRootWord.set('displays', 107);
sameRootWord.set('displayed', 107);
sameRootWord.set('issues', 359);
sameRootWord.set('programming', 287);
sameRootWord.set('programm', 287);
sameRootWord.set('filters', 70);

let size = keyworddata.length;
for (let i=0; i<size; i++){
    keywordSet.push({
        id: i,
        oid: i,
        name: keyworddata[i].keyword,
        value_mails: keyworddata[i].mails.length,
        mails: keyworddata[i].mails,
    });
}
if (!debug)
    for (let i=0; i<size; i++){
        if (skipwords.has(keyworddata[i].keyword)){
            keywordSet[i].value_mails = 0;
            keywordSet[i].mails = [];
        }
        if (sameRootWord.has(keyworddata[i].keyword)){
            let id = sameRootWord.get(keyworddata[i].keyword);
            keywordSet[id].value_mails += keywordSet[i].value_mails;
            keywordSet[id].mails = Array.from((new Set(keywordSet[i].mails.concat(keywordSet[id].mails))).values());
            keywordSet[i].value_mails = 0;
            keywordSet[i].mails = [];
        }
    }

keywordSet.sort((a, b) => {
    if (a.value_mails > b.value_mails) return -1;
    if (a.value_mails < b.value_mails) return 1;
    return 0;
})
let kw = [];
size = keywordSet.length;
for (let i=0; i<size; i++){
    if (keyworddata[keywordSet[i].oid].keyword!==keywordSet[i].name){
        console.log(keywordSet[i].name);
    }
    kw.push({
        id: keywordSet[i].oid,
        name: keywordSet[i].name,
    });
}
size = 100;
for (let i=0; i<size; i++){
    keywordSet[i].mails.sort((a, b) => {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    });
    let mdata = keywordSet[i].mails;
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
    delete keywordSet[i].mails;
}
//console.log(JSON.stringify(keywordSet.slice(start, start + 10), null, 2));
fs.writeFileSync(path.resolve(outDir, 'keywords_top100.json'), JSON.stringify(keywordSet.slice(0, size), null, 2));
fs.writeFileSync(path.resolve(outDir, 'kwtmp.json'), JSON.stringify(kw, null, 2));



