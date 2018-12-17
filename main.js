// 不要管这个文件的内容
// 它是 electron 的入口文件
// 最后提交作业和展示是用不到它的

const { app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        useContentSize: true,
        autoHideMenuBar: true,
    })

    mainWindow.loadFile(path.join(__dirname, 'src/index.html'))
    
    mainWindow.on('closed', () => {
        mainWindow = null
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
