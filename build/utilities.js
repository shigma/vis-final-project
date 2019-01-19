const path = require('path')
const fs = require('fs')

function fullPath(...filename) {
    return path.resolve(__dirname, '..', ...filename)
}

function depPath(...filename) {
    return path.resolve(__dirname, '../node_modules/', ...filename)
}

function mkdir(...filename) {
    const full = fullPath(...filename)
    if (!fs.existsSync(full)) fs.mkdirSync(full)
}

module.exports = {
    fullPath,
    depPath,
    mkdir,
}
