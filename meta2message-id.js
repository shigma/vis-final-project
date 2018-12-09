const fs = require("fs")
const metaAll = require('./meta.json')

const weekdates = new Set(['Mon','Tue','Wed','Thu','Fir','Sat','Sun'])

let isdebug = false//true

let MailLength = metaAll.length
let message_idArray = []
let timeline = []

/* give message_id and message_idArray, return id in metaAll or -1 if not found*/
function messageID2id(message_id,message_idArray){
    let l = 0,r = message_idArray.length-1
    while(l<=r){
        let m = ((r - l) >> 1) + l
        if(message_id > message_idArray[m].idString){
            l = m + 1
        }else if(message_id < message_idArray[m].idString){
            r = m - 1
        }else if(message_id == message_idArray[m].idString){
            return m;
        }
    }
    console.log("error: cannot find messageID in messageID2id(): given "+message_id)
    return -1
}

if(isdebug)MailLength = 100

for(let i=0;i<MailLength;i++){
    let tmp = metaAll[i].meta
    let obtmp = new Object()
    obtmp.id = i
    obtmp.idString = tmp.MessageID.substring(1,tmp.MessageID.length-2)
    message_idArray.push(obtmp)

    let obtmp2 = new Object()
    obtmp2.id = i
    //"Date": "Wed, 7 Nov 2001 22:42:09 +0100 (MET)",
    let tmptime = tmp.Date.split(/ |, |:/)
    let c = 0
    obtmp2.wd = tmptime[c]
    if(!(weekdates.has(obtmp2.wd))){
        obtmp2.wd = '???'
        c--;
    }
    obtmp2.day = tmptime[++c]
    if(obtmp2.day.length<2)obtmp2.day = '0'+obtmp2.day
    obtmp2.month = tmptime[++c]
    obtmp2.year = tmptime[++c]
    obtmp2.h = tmptime[++c]
    obtmp2.m = tmptime[++c]
    obtmp2.s = tmptime[++c]
    obtmp2.delta = tmptime[++c]
    timeline.push(obtmp2)
    //console.log(JSON.stringify(obtmp2))
}

message_idArray.sort(function(a,b){
    return a.idString>b.idString
})

fs.writeFileSync("./dist/messageidTable.json",JSON.stringify(message_idArray,null,2))
fs.writeFileSync('./dist/timeline.json',JSON.stringify(timeline,null,2))
console.log("finish!")
