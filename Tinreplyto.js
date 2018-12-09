const irt = require('./dist/inreplyto.json')
//const meta = require('./dist/meta.json')
//const fs = require('fs')
const n = irt.length

let maxln = 0
for (let i=0; i<n; i++){
  let t = i
  let ln = 1
  while (irt[t].pirt!==-1){
    ln++
    t = irt[t].pirt
  }
  t = i
  while (irt[t].irt_id!==-1){
    ln++
    t = irt[t].irt_id
  }
  maxln = Math.max(maxln, ln)
}
console.log(maxln)



//fs.writeFileSync('./dist/inreplytoTable.json', JSON.stringify(irt, null, 2))