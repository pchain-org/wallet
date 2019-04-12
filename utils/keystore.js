const {ipcMain,dialog} = require('electron')
const fs = require('fs');
const path = require('path');

let self;
class Keystore{

	constructor(){
		self = this;
	}

	init(){
		//open keystore file
		ipcMain.on('open-keystore-file',(event)=>{
		    dialog.showOpenDialog({properties:['openFile']},(files)=>{
		        if(files){
		        	fs.readFile(files[0],'utf8',(err,data)=>{
		        		if(!err){
		        			let fileJson = JSON.parse(data);
		        			event.sender.send('selected-keystore',files[0],fileJson);
		        		}else{
		        			self.errorDialog(err);
		        		}
		        	});
		        }else{
		        	self.errorDialog("File Selected Error");
		        }
		    })
		})
	}

	errorDialog(err){
		console.log(err)
		const options = {
		    type: 'error',
		    title: 'PCHAIN Wallet',
		    message: err.toString()
		}
		dialog.showMessageBox(options);
	}
}

module.exports = new Keystore();