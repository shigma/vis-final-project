const mailsdata = require('../dist/mails.json');
const fs = require('fs');
const path = require('path');
const outDir = path.resolve(__dirname, '../dist');
const userdata = require('../dist/users.json');

let size = userdata.length;

let userSet = [];
for (let i=0; i<size; i++){
    let mdata = userdata[i].mails;
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
    userSet.push({
        id: i,
        name: userdata[i].name,
        value_mails: msize,
        count: year,
    });
}
fs.writeFileSync(path.resolve(outDir, 'users_countByMonth.json'), JSON.stringify(userSet));