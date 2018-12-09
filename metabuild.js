const fs = require("fs")
const metaAll = require('./dist/meta.json')

const weekdates = new Set(['Mon','Tue','Wed','Thu','Fir','Sat','Sun'])

let isdebug = false
//isdebug = true

let MailLength = metaAll.length
let message_idArray = []
let timeline = []

function stringcmp(as,bs){
    let la = as.length
    let lb = bs.length
    for(let i=0;i<Math.min(la,lb);i++){
        if(as[i]>bs[i]){
            return 1
        }else if(as[i]<bs[i]){
            return -1
        }
    }
    if(la>lb){
        return 1
    }else if(lb>la){
        return -1
    }else{
        return 0
    }
}

/* give message_id and message_idArray, return id in metaAll or -1 if not found*/
function messageID2id(message_id,message_idArray){
    let l = 0,r = message_idArray.length-1
    while(l<=r){
        let m = ((r - l) >> 1) + l
        if(stringcmp(message_id,message_idArray[m].idString)==1){
            l = m + 1
        }else if(stringcmp(message_id,message_idArray[m].idString)==-1){
            r = m - 1
        }else if(stringcmp(message_id,message_idArray[m].idString)==0){
            return message_idArray[m].id;
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
    return stringcmp(a.idString,b.idString)
})

/*let a = message_idArray[1].idString
let b = message_idArray[2].idString
console.log(a>b)
console.log(stringcmp(a,b))
console.log(messageID2id(a,message_idArray))*/

fs.writeFileSync("./dist/messageidTable.json",JSON.stringify(message_idArray,null,2))
fs.writeFileSync('./dist/timeline.json',JSON.stringify(timeline,null,2))
console.log("finish!")
