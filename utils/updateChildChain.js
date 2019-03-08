/**
 * Created by skykingit on 2018/12/01.
 */

const Got = require("got");
const ChildChainJson = require("../childChain.json");
const Promise = require("bluebird");
const fs = require('fs');
const path = require('path');

const gitPackageJsonUrl = "https://raw.githubusercontent.com/pchain-org/wallet/master/childChain.json";
let self;
class UpdateChildChain {
	constructor(){
		this.currentVersion = "";
		this.latestVersion = "";
		self = this;
	}

	getLatestChildChainJson(){

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

	get localChildChainJson(){
		return ChildChainJson;
	}


	getUpdateStatus(){
		let currentVersion = self.localChildChainJson.version;
		self.currentVersion = currentVersion;

		return new Promise(function (accept,reject) {
			self.getLatestChildChainJson().then(function(json){
				let latestVersion = json.version;
				self.latestVersion = latestVersion;
				self.latestJson = json;
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

	checkUpdate(){

		this.getUpdateStatus().then(function(flag){
			if(flag){
				 fs.writeFileSync(
				 	path.join(__dirname,"../childChain.json"),
				 	JSON.stringify(self.latestJson,null,2)
				 );
			}
		}).catch(function(e){
			console.log(e);
		});
	}
} 

module.exports = new UpdateChildChain();