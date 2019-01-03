/**
 * Created by skykingit on 2018/12/01.
 */


const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu;

var Promise = require("bluebird");


const path = require('path')
const url = require('url')
const initMenu = require('./lib/menu.js');
const DB = require("./sqlite3/dbInit.js");
const UpdateUtil = require("./utils/update");
const UpdateChildChainUtil = require("./utils/updateChildChain");


let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({width: 1000, height: 700,minWidth:900,minHeight:700})
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'public/wallet.html'),
        protocol: 'file:',
        slashes: true,
        icon:path.join(__dirname,"public/img/logo.png")
    }))
    initMenu();
    mainWindow.once('show',()=>{
        UpdateUtil.checkUpdate(0);
    });

    mainWindow.on('closed', ()=> {
        mainWindow = null
    })
}

let loadingWindow;
function showLoadingWindow(){
    loadingWindow = new BrowserWindow({width:500,height:300,resizable:false,frame:false});
    loadingWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'public/loading.html'),
        protocol: 'file:',
        slashes: true,
        icon:path.join(__dirname,"public/img/logo.png")
    }));

    loadingWindow.on('hide', () => {
        loadingWindow = null;
        createWindow();
    })
}

function init(){
    DB.init().then(function (result) {
        console.log(result);
        loadingWindow.hide();
    }).catch(function (reason) {
        console.log("reason"+reason)
    });

    UpdateChildChainUtil.checkUpdate();
}

app.on('ready', function(){
    showLoadingWindow();
    init();
})

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




