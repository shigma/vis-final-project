let isdebug = false//true
const fs = require("fs")

let metaAll = require('./meta.json')
let MailLength = metaAll.length
//console.log(MailLength)
let message_idArray = []

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

if(isdebug)MailLength = 5

for(let i=0;i<MailLength;i++){
    let tmp = metaAll[i].meta
    //console.log(JSON.stringify(tmp))
    let obtmp = new Object()
    obtmp.id = i
    //obtmp.FromString = tmp.From
    obtmp.idString = tmp.MessageID.substring(1,tmp.MessageID.length-2)
    message_idArray.push(obtmp)
    //console.log(JSON.stringify(message_idArray[i]))
}

message_idArray.sort(function(a,b){
    return a.idString>b.idString
})

//for(let i=0;i<MailLength;i++){
//    console.log(JSON.stringify(message_idArray[i]))
//}
//console.log(JSON.stringify(message_idArray[MailLength>>1]))
//console.log(messageID2id("4E206C04.7070100@lbl.go",message_idArray))
//console.log(messageID2id("4E206C04.707a0100@lbl.go",message_idArray))

fs.writeFileSync("./messageidTable.json",JSON.stringify(message_idArray))
console.log("finish!")

