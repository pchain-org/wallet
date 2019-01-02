/**
 * Created by skykingit on 2018/12/01.
 */


var sqlite3 = require('sqlite3').verbose();
var Setting = require("../lib/setting.js");
var Promise = require("bluebird");
const DBPath = Setting.DBPath;

console.log(DBPath);

var db;
let self;
class DB{
	constructor(){
		db = new sqlite3.Database(DBPath,function(data){
		    // console.log(data);
		});
        self = this;
	}

    promiseRun(sql){
        return new Promise(function (resolve,reject) {
            db.serialize(function() {
                db.run(sql,function (err) {
                    if(!err){
                        resolve(true);
                    }else{
                        reject(err);
                    }
                });
            });
        });
    }

	init(){
        return new Promise(function (resolve,reject) {
            let sql="CREATE TABLE IF NOT EXISTS tb_account(id integer PRIMARY KEY, privateKey text,address text,createTime text);";
            self.promiseRun(sql).then((result)=>{
                if(result){
                    let sql2="CREATE TABLE IF NOT EXISTS tb_transaction(id integer PRIMARY KEY,hash text,nonce text,fromaddress text,toaddress text,value real,gas text,gasPrice text,data text,type integer,chainId integer,chainName text,pid integer,createTime text);";
                    return self.promiseRun(sql2);
                }
            }).then((result)=>{
                if(result){
                    let sql3 = "CREATE TABLE IF NOT EXISTS tb_chain(id integer, chainId text,chainName text);"
                    return self.promiseRun(sql3);
                }
            }).then((result)=>{
                if(result){
                    resolve("ok")
                }
            }).catch((err)=>{
                reject(err);
            })
        });
	}

}

module.exports = new DB();