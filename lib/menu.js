/**
 * Created by skykingit on 2018/12/01.
 */

const electron = require('electron')
const app = electron.app
const Menu = electron.Menu;
const dialog = electron.dialog;
const url = require('url');
const path = require('path');
const fs = require('fs');
const webContents = require('electron').webContents;
const Update = require("../utils/update");
let InitMenuJson = require("./menu.json");
let MenuJson = InitMenuJson;
let Setting = require("./setting.js");
let WalletUtil = require("../utils/wallet.js");

//add click event
MenuJson.modeSubMenu[0].click = (item,focusedWindow,event)=>{
                        switchMode(item,focusedWindow,event,0)
                        switchModeHide(0)
                    }
MenuJson.modeSubMenu[1].click = (item,focusedWindow,event)=>{
                        switchMode(item,focusedWindow,event,1)
                        switchModeHide(1)
                    }

function switchMode(item,focusedWindow,event,type){

    let urlPath;
    if(type == 0){
        urlPath = path.join(Setting.appDataPath, 'public/wallet.html');
        InitMenuJson.modeSubMenu[1].checked = false;
    }else if(type == 1){
         urlPath = path.join(Setting.appDataPath, 'public/devPages/accountDev.html');
         InitMenuJson.modeSubMenu[0].checked = false;
    }
    InitMenuJson.modeSubMenu[type].checked = true;
    focusedWindow.loadURL(url.format({
        pathname:urlPath,
        protocol: 'file:',
        slashes: true,
        icon:path.join(Setting.appDataPath,"public/img/logo.png")
    }))

    fs.writeFileSync(
        path.join(Setting.appDataPath,"lib/menu.json"),
        JSON.stringify(InitMenuJson,null,2)
     );
}



let Lighttemplate = [{
    label: 'Edit',
    submenu: MenuJson.editSubmenu
}, {
    label: 'View',
    submenu: [ {
        label: 'Enter Full Screen',
        accelerator: (function () {
            if (process.platform === 'darwin') {
                return 'Ctrl+Command+F'
            } else {
                return 'F11'
            }
        })(),
        role:"togglefullscreen"
    },
    { role: 'zoomin' },
      { role: 'zoomout' }
    ]
}, {
        label: 'Developer',
        submenu: [{
            label: 'Toggle Developer Tools',
            accelerator: (function () {
                if (process.platform === 'darwin') {
                    return 'Alt+Command+I'
                } else {
                    return 'Ctrl+Shift+I'
                }
            })(),
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            }
        },
        {
            label: 'Wallet Mode',
            submenu:MenuJson.modeSubMenu 
        }]
    },

    {
        label: 'Wallet',
        submenu: [{
            label: 'Backup Wallet',
            accelerator: (function () {
                if (process.platform === 'darwin') {
                    return 'Alt+Command+B'
                } else {
                    return 'Ctrl+Shift+B'
                }
            })(),
            click: function (item, focusedWindow) {
                dialog.showOpenDialog(focusedWindow,{properties:['openDirectory']},(path,bookmark)=>{

                    if(path){
                        console.log(path,bookmark);
                        let filePath = path[0];
                        console.log(filePath);
                        WalletUtil.saveWallet(filePath);
                    }else{
                        console.log("click cancle");
                    }
                })
            }
        },{
            label: 'Recovery Wallet',
            accelerator: (function () {
                if (process.platform === 'darwin') {
                    return 'Alt+Command+R'
                } else {
                    return 'Ctrl+Shift+R'
                }
            })(),
            click: function (item, focusedWindow) {
                dialog.showOpenDialog(focusedWindow,{properties:['openFile']},(path,bookmark)=>{

                    if(path){
                        console.log(path,bookmark);
                        let filePath = path[0];
                        console.log(filePath);
                        WalletUtil.recoveryWallet(filePath);
                    }else{
                        console.log("click cancle");
                    }
                })
            }
        }]
    },

    {
    label: 'Help',
    role: 'help',
    submenu: [{
        label: 'Website',
        click: function () {
            electron.shell.openExternal('https://pchain.org')
        }},
        {
        label: 'Twitter',
        click: function () {
            electron.shell.openExternal('https://twitter.com/pchain_org')
        }},
        {
        label: 'Telegram',
        click: function () {
            electron.shell.openExternal('https://t.me/pchain_org')
        }},
        {
            type: 'separator'
        },
        {
        label: 'Check For Updates',
        click: function () {
           Update.checkUpdate(1);
        }},
        ]
}]

let Localtemplate = [{
    label: 'Edit',
    submenu: MenuJson.editSubmenu
}, {
    label: 'View',
    submenu: [ {
        label: 'Enter Full Screen',
        accelerator: (function () {
            if (process.platform === 'darwin') {
                return 'Ctrl+Command+F'
            } else {
                return 'F11'
            }
        })(),
        role:"togglefullscreen"
    },
        { role: 'zoomin' },
        { role: 'zoomout' }
    ]
}, {
    label: 'Developer',
    submenu: [{
        label: 'Toggle Developer Tools',
        accelerator: (function () {
            if (process.platform === 'darwin') {
                return 'Alt+Command+I'
            } else {
                return 'Ctrl+Shift+I'
            }
        })(),
        click: function (item, focusedWindow) {
            if (focusedWindow) {
                focusedWindow.toggleDevTools()
            }
        }
    },
        {
            label: 'Wallet Mode',
            submenu:MenuJson.modeSubMenu
        }]
},

    {
        label: 'Help',
        role: 'help',
        submenu: [{
            label: 'Website',
            click: function () {
                electron.shell.openExternal('https://pchain.org')
            }},
            {
                label: 'Twitter',
                click: function () {
                    electron.shell.openExternal('https://twitter.com/pchain_org')
                }},
            {
                label: 'Telegram',
                click: function () {
                    electron.shell.openExternal('https://t.me/pchain_org')
                }},
            {
                type: 'separator'
            },
            {
                label: 'Check For Updates',
                click: function () {
                    Update.checkUpdate(1);
                }},
        ]
    }]

if (process.platform === 'darwin') {
    template.unshift({
        label: "pwallet",
        submenu: MenuJson.macSubmenu
    })
}

function switchModeHide(type) {
    if(type==0){
        const Lightmenu = Menu.buildFromTemplate(Lighttemplate);
        Menu.setApplicationMenu(Lightmenu)
    }else{
        const localmenu = Menu.buildFromTemplate(Localtemplate);
        Menu.setApplicationMenu(localmenu)
    }
}

const initMenu = function(){
    const menu = Menu.buildFromTemplate(Lighttemplate);
    Menu.setApplicationMenu(menu)
}

module.exports = initMenu;
