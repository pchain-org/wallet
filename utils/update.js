/**
 * Created by skykingit on 2018/12/01.
 */

const Got = require("got");
const PackageJson = require("../package.json");
const Promise = require("bluebird");
const electron = require('electron')
const {dialog} = require('electron')

const gitPackageJsonUrl = "https://raw.githubusercontent.com/pchain-org/wallet/master/package.json";  
let self;
class Update {
	constructor(){
		this.currentVersion = "";
		this.latestVersion = "";
		self = this;
	}

	getLatestPackageJson(){

		return new Promise(function (accept,reject) {

			try{
				Got(gitPackageJsonUrl,{json:true}).then(function(result){
					let jsonData = result.body;
					accept(jsonData);
				}).catch(function(err){
					reject(err);
				})
	        	
			}catch(error){
				reject(error);
			}
	    });
	}

	get localPackageJson(){
		return PackageJson;
	}


	getUpdateStatus(){
		let currentVersion = this.localPackageJson.version;
		this.currentVersion = currentVersion;

		return new Promise(function (accept,reject) {
			self.getLatestPackageJson().then(function(json){
				let latestVersion = json.version;
				self.latestVersion = latestVersion;
				if(currentVersion == latestVersion){
					accept(false);
				}else{
					accept(true);
				}
			}).catch(function(e){
				reject(e);
			})
		});
	}

	checkUpdate(type){

		this.getUpdateStatus().then(function(flag){
			if(flag){
				 const options = {
				    type: 'info',
				    title: 'Update PCHAIN Wallet',
				    message: "There is a new version wallet,do you want to update?",
				    buttons: ['Update', 'Skip']
				  }
				  dialog.showMessageBox(options, function (index) {
				    	if(index == 0){
				    		electron.shell.openExternal('https://www.pchain.org')
				    	}
				  })
			}else if(type == 1){
				 const options = {
				    type: 'info',
				    title: 'Update PCHAIN Wallet',
				    message: "You have successfully upgraded to the latest version",
				    buttons: ['Ok']
				  }
				  dialog.showMessageBox(options, function (index) {
				    	
				  })

			}
		}).catch(function(e){
			console.log(e);
		});
	}
} 

module.exports = new Update();