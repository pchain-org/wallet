/**
 * Created by skykingit on 2018/12/01.
 */

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu;
const Tray = electron.Tray;
var Promise = require("bluebird");
const path = require('path')
const url = require('url')
const initMenu = require('./lib/menu.js');
const DB = require("./sqlite3/dbInit.js");
const UpdateUtil = require("./utils/update");
const UpdateChildChainUtil = require("./utils/updateChildChain");
const InitMenuJson = require("./lib/menu.json");
require('./utils/keystore').init();

let mainWindow;

function createWindow () {
    let mainPageUrlPath;
    if(InitMenuJson.modeSubMenu[0].checked){

        mainPageUrlPath =  path.join(__dirname, 'public/wallet.html');
    }else{
        mainPageUrlPath =  path.join(__dirname, 'public/devPages/accountDev.html');
    }

    mainWindow = new BrowserWindow({width: 1000, height: 700,minWidth:900,minHeight:700,titleBarStyle: 'hidden',backgroundColor:"#000000"})
    mainWindow.loadURL(url.format({
        pathname: mainPageUrlPath,
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

    UpdateChildChainUtil.checkUpdate();
}

function init(){
    DB.openDb().then(function(result){
        if(result){
            DB.init();
        }
    }).then(function (result) {
        console.log(result);
        setTimeout(function(){
            loadingWindow.hide();
        },1000);
    }).catch(function (err) {
        console.log("error"+err)
    });
}

let loadingWindow;
function showLoadingWindow(){
    loadingWindow = new BrowserWindow({width:500,height:300,resizable:false,frame:false,backgroundColor:"#000000"});
    loadingWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'public/loading.html'),
        protocol: 'file:',
        slashes: true,
        icon:path.join(__dirname,"public/img/logo.png")
    }));

    init();

    loadingWindow.on('hide', () => {
        loadingWindow = null;
        createWindow();
    })
}


app.on('ready', function(){
    showLoadingWindow();
    if (process.platform !== 'darwin') {
        const tray = new Tray(path.join(__dirname,"public/img/logo.png"));
    }
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





