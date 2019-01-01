/* This program creates file 'meta_NumID.json'
 * This program requires file 'meta.json' created by 'build.js'
 * in meta_NumID.json we have:{
 *      ID: (Int) defined in meta.json
 *      Subject: (string)
 *      MessageID: (string)
 *      Date: {
 *          wk: weekday (may be '???') in Set { Mon, Tue, Wed, Thu, Fri, Sat, Sun }
 *          day, month, year: (Int)
 *          h, m, s: hour, minute, second
 *      }
 *      IRT: {
 *          IsReplyedBy: (Array) (Int) ID
 *          InReplyTo: (String) that is MessageID
 *          InReplyToID: (Int) default -1 for NO InReplyTo or CANNOT find that MessageID
 *      }
 *      REF: {
 *          IsRefedBy: (Array) (Int) ID
 *          References: (String) that is MessageID
 *          ReferencesID: (Int) 
 *              default -1 for CANNOT find that MessageID
 *              besides, ReferencesID will be empty if there is NO References and
 *              will be -1 INSTEAD of just skip it when CANNOT find such MessageID in References
 *              This means that ReferencesID[i] is the ID of References[i] and will be -1 if CANNOT find MessageID
 *      }
 * }
 * 
 *  In meta_NumID.json we sort the elements in order of ID, which is definded in meta.json
 * 
 */

const fs = require('fs')
const metaAll = require('./dist/meta.json')

const weekdates = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fir', 'Sat', 'Sun'])

let isdebug = false
//isdebug = true

let MailLength = metaAll.length
let metaArray = []

function stringcmp(as, bs){
    let la = as.length
    let lb = bs.length
    for (let i=0; i<Math.min(la, lb); i++){
        if (as[i]>bs[i]){
            return 1
        } else if (as[i]<bs[i]){
            return -1
        }
    }
    if (la>lb){
        return 1
    } else if (lb>la){
        return -1
    } else {
        return 0
    }
}

/* give message_id and message_idArray, return id in metaArray or -1 if not found
 * ***********************************CAUTION************************************
 * *            you should give metaArray in order of MessageID                 *
 * ******************************************************************************
 */
function messageID2id(message_id, metaArray){
    message_id = String(message_id)
    let l = 0, r = metaArray.length-1
    while (l<=r){
        let m = ((r - l) >> 1) + l
        if (stringcmp(message_id, metaArray[m].MessageID)===1){
            l = m + 1
        } else if (stringcmp(message_id, metaArray[m].MessageID)===-1){
            r = m - 1
        } else if (stringcmp(message_id, metaArray[m].MessageID)===0){
            return metaArray[m].ID
        }
    }
    //console.log('error: cannot find messageID in messageID2id(): given '+message_id)
    return -1
}

if (isdebug)MailLength = 10

for (let i=0; i<MailLength; i++){
  
    /* meta messageid */
    let tmp = metaAll[i].meta
    let obtmp = new Object()
    obtmp.ID = metaAll[i].ID
    obtmp.Subject = tmp.Subject
    if (tmp.MessageID[0]==='<')
        tmp.MessageID = tmp.MessageID.substring(1)
    if (tmp.MessageID[tmp.MessageID.length-1]==='>')
        tmp.MessageID = tmp.MessageID.substring(0, tmp.MessageID.length-1)
    obtmp.MessageID = tmp.MessageID

    /* meta date split */
    let obtmp2 = new Object()
    let tmptime = tmp.Date.split(/ |, |:/)
    let c = 0
    obtmp2.wd = tmptime[c]
    if (!(weekdates.has(obtmp2.wd))){
        obtmp2.wd = '???'
        c--
    }
    obtmp2.day = tmptime[++c]
    if (obtmp2.day.length<2)obtmp2.day = '0'+obtmp2.day
    obtmp2.month = tmptime[++c]
    obtmp2.year = tmptime[++c]
    obtmp2.h = tmptime[++c]
    obtmp2.m = tmptime[++c]
    obtmp2.s = tmptime[++c]
    obtmp2.delta = tmptime[++c]

    let obtmp3 = new Object()
    obtmp3.IsReplyedBy = []
    if (tmp.InReplyTo){
        obtmp3.InReplyTo = tmp.InReplyTo.split(/<|>/)[1]
        obtmp3.InReplyToID = -1
    } else {
        obtmp3.InReplyTo = null
        obtmp3.InReplyToID = -1
    }

    let obtmp4 = new Object()
    obtmp4.References = []
    obtmp4.ReferencesID = []
    obtmp4.IsRefedBy = []
    if (tmp.References){
        let lj = tmp.References.length
        for (let j=0; j<lj; j++){
            let refString = tmp.References[j].split(/<|>/)[1]
            obtmp4.References.push(refString)
        }
    }
    
    obtmp.Date = obtmp2
    obtmp.IRT = obtmp3
    obtmp.REF = obtmp4
    metaArray.push(obtmp)
}

metaArray.sort(function(a, b){
    return stringcmp(a.MessageID, b.MessageID)
})

//let extraref = 0
//let innerref = 0

for (let i=0; i<MailLength; i++){
    if (metaArray[i].IRT.InReplyTo){
        let rID = messageID2id(metaArray[i].IRT.InReplyTo, metaArray)
        metaArray[i].IRT.InReplyToID = rID
    }
    if (metaArray[i].REF.References){
        let lj = metaArray[i].REF.References.length
        for (let j=0; j<lj; j++){
            let refid = messageID2id(metaArray[i].REF.References[j], metaArray)
            metaArray[i].REF.ReferencesID.push(refid)
        }
    }
}

metaArray.sort(function(a, b){
    if (a.ID>b.ID) return 1;
    if (a.ID<b.ID) return -1;
    return 0;
})

for (let i=0; i<MailLength; i++){
    let rid = -1;
    if ((rid = metaArray[i].IRT.InReplyToID) !== -1){
        metaArray[rid].IRT.IsReplyedBy.push(i);
    }
    let lj = metaArray[i].REF.References.length
    for (let j=0; j<lj; j++){
        if ((rid = metaArray[i].REF.ReferencesID[j]) !== -1){
            metaArray[rid].REF.IsRefedBy.push(i);
        }
    }
}

fs.writeFileSync('./dist/meta_NumID.json', JSON.stringify(metaArray, null, 2))
//fs.writeFileSync('./dist/timeline.json', JSON.stringify(timeline, null, 2))
//fs.writeFileSync('./dist/mail_ref_irtTable.json', JSON.stringify(inreplyto, null, 2))
console.log('finish!')
