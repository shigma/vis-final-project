const mailsdata = require('../dist/mails.json');
const fs = require('fs');
const path = require('path');
const outDir = path.resolve(__dirname, '../dist');
let activity = [];
for (let i=0; i<18; i++){
    activity.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
}
let size = mailsdata.length;
for (let i=0; i<size; i++){
    let date = new Date(mailsdata[i].date);
    activity[date.getFullYear()-2001][date.getMonth()]++;
}
let ret = [];
for (let i=0; i<18; i++){
    for (let j=0; j<12; j++){
        ret.push([
            (i + 2001) + '/' + (j + 1),
            activity[i][j],
        ]);
    }
}
fs.writeFileSync(path.resolve(outDir, 'overviewActivityData.json'), JSON.stringify(ret));