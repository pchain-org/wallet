/**
 * Created by skykingit on 2017/3/30.
 */


const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu;

const path = require('path')
const url = require('url')
const initMenu = require('./lib/menu.js');


let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({width: 800, height: 600,maxWidth:900,mixWidth:500})
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
        icon:path.join(__dirname,"public/img/logo.png")
    }))


    initMenu();
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})




