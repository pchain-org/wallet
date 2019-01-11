/**
 * Created by skykingit on 2018/12/01.
 */

const Promise = require("bluebird");
const fs = require('fs');
const path = require('path');
const electron = require('electron')
const {dialog} = require('electron')

const DB = require("../sqlite3/dbInit.js");

let self;
class Wallet {
	constructor(){
		self = this;
	}

	saveWallet(p){
		let currentTime = (new Date()).getTime();
	    let fileName = "PchainWallet_"+currentTime+".json";
	    DB.query("select * from tb_account").then((res)=>{
	    	// console.log(res);
	    	let walletDataList = res.data;
	    	if(walletDataList.length > 0){
	    		let walletJson = {name:"Pchain Wallet",time:currentTime};
	    		let accountList = new Array();
	    		for(let i=0;i<walletDataList.length;i++){
	    			let account = {};
	    			account.privateKey = walletDataList[i].privateKey;
	    			account.address = walletDataList[i].address;
	    			accountList.push(account);
	    		}
	    		walletJson.accounts = accountList;
			    fs.writeFile(
			        path.join(p,fileName),
			        JSON.stringify(walletJson,null,2),
			        (err)=>{
			        	if(!err){
			        		console.log("file save success");
				        		const options = {
							    type: 'info',
							    title: 'Wallet Backup ',
							    message: "Wallet Backup Successfully"
							  }
							  dialog.showMessageBox(options);
			        	}else{
			        		console.log(err);
			        		const options = {
							    type: 'error',
							    title: 'Wallet Backup',
							    message: err.toString()
							  }
							  dialog.showMessageBox(options);
			        	}
			        }
			    );

	    	}else{
	    	   const options = {
			    type: 'info',
			    title: 'Wallet Backup ',
			    message: "Wallet is empty!"
			  }
			  dialog.showMessageBox(options);
	    	}
	    }).catch((err)=>{
	    	self.errorDialog(err);
	    })
		    
	}

	recoveryWallet(p){
		fs.readFile(p,'utf8',(err,data)=>{
			if(!err){
				let fileJson = JSON.parse(data);
				try{
					if(self.isWalletFileValid(fileJson)){
						self.circleAccount(fileJson.accounts,0);
					}else{
						let err = "Incorrect wallet format";
						self.errorDialog(err);
					}
				}catch(e){
					let err = "Incorrect wallet format";
					self.errorDialog(err);
				}
				
			}else{
				self.errorDialog(err);
			}
		})	
	}

	isWalletFileValid(walletJson){
		let flag = false;
		if(walletJson.hasOwnProperty("accounts")){
			let accounts = walletJson.accounts;
			if(Array.isArray(accounts)){
				for(let i=0;i<accounts.length;i++){
					let item = accounts[i];
					if(item.hasOwnProperty("privateKey") && item.hasOwnProperty("address")){
						flag = true;
					}
				}
			}
		}
		return flag;
	}


	isAccountExist(address){
		return new Promise(function (accept,reject) {
			let sql = "select * from tb_account where address = ?";
			let paramArr = [address];
			DB.queryByParam(sql,paramArr).then((result)=>{
				if(result.data.id > 0){
					accept(true);
				}else{
					accept(false);
				}
			}).catch((err)=>{
				console.log(err);
				reject(err);
			});
		}); 
	}

	addAccount(privateKey,address) {
	    return new Promise(function (accept,reject) {
	        var sql = "INSERT INTO tb_account(id,privateKey,address,createTime) VALUES (?,?,?,?)";
	        var array = [null, privateKey, address, new Date()]
	        DB.execute(sql, array).then((resObj)=>{
	            accept(resObj);
	        }).catch((e)=>{
	            reject(e);
	            console.log(e, "error");
	            reject(e);
	        })
	    });
	}

	circleAccount(list,index){
		if(index < list.length){
			let currentAccount = list[index];
			self.isAccountExist(currentAccount.address).then((isExist)=>{
				if(isExist){
					return true;
				}else{
					return self.addAccount(currentAccount.privateKey,currentAccount.address);
				}
			}).then((res)=>{
				self.circleAccount(list,index+1);
			}).catch((err)=>{
				errorDialog(err);
			})
		}else{
        	const options = {
			    type: 'info',
			    title: 'Wallet Recovery ',
			    message: "Wallet Recovery Successfully"
			}
			dialog.showMessageBox(options);
		}
	}

	errorDialog(err){
		console.log(err)
		const options = {
		    type: 'error',
		    title: 'Pchain Wallet',
		    message: err.toString()
		}
		dialog.showMessageBox(options);
	}

} 

module.exports = new Wallet();