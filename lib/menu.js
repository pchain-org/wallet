/**
 * Created by skykingit on 2018/12/01.
 */

const electron = require('electron')
const app = electron.app
const Menu = electron.Menu;
const webContents = require('electron').webContents;
const Update = require("../utils/update");

let template = [{
    label: 'Edit',
    submenu: [{
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
    },{

       label: 'Redo',

       accelerator: 'Shift+CmdOrCtrl+Z',

       selector: 'redo:'

     }, {

       type: 'separator'

     }, {

       label: 'Cut',

       accelerator: 'CmdOrCtrl+X',

       selector: 'cut:'

     }, {

       label: 'Copy',

       accelerator: 'CmdOrCtrl+C',

       selector: 'copy:'

     }, {

       label: 'Paste',

       accelerator: 'CmdOrCtrl+V',

       selector: 'paste:'

     },{
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }]
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
            submenu:[
                {
                    label:"Light Wallet",
                    type:"radio",
                    checked:true,
                    click:(item,focusedWindow,event)=>{
                        focusedWindow.hide();                       
                    }
                },
                {
                    label:"Local Node",
                    type:"radio"
                }
            ]
            
        }]
    },
    {
    label: 'Help',
    role: 'help',
    submenu: [{
        label: 'Website',
        click: function () {
            electron.shell.openExternal('https://www.pchain.org')
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
        submenu: [
            {
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                role: 'hide'
            },
            {
                role: 'hideothers'
            },
            {
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                role: 'quit'
            }
        ]
    })
}
const initMenu = function(){
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu)
}

module.exports = initMenu;
