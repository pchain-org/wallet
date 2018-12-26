/**
 * Created by skykingit on 2018/12/01.
 */


const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu;

const path = require('path')
const url = require('url')
const initMenu = require('./lib/menu.js');
// const DB = require("./sqlite3/dbInit.js");

let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({width: 1000, height: 700,mixWidth:700,minHeight:700})
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'public/index.html'),
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




