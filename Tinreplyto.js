const irt = require('./dist/inreplyto.json')
const fs = require('fs')
const n = irt.length

console.log(JSON.stringify(irt[1]))

let maxln = 0
for (let i=0; i<n; i++){
  let t = i
  let ln = 1
  while (irt[t].p!==-1){
    ln++
    t = irt[t].p
  }
  t = i
  while (irt[t].irt_id!==-1){
    ln++
    t = irt[t].irt_id
  }
  maxln = Math.max(maxln, ln)
}
console.log(maxln)
fs.writeFileSync('./dist/inreplytoTable.json', JSON.stringify(irt, null, 2))