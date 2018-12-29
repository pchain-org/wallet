/**
 * Created by skykingit on 2018/12/01.
 */


var sqlite3 = require('sqlite3').verbose();
var Setting = require("../lib/setting.js");
const DBPath = Setting.DBPath;

console.log(DBPath);

var db;
class DB{
	constructor(){
		db = new sqlite3.Database(DBPath,function(data){
		    // console.log(data);
		});
	}

	init(){
        return new Promise(function (resolve,reject) {
        db.serialize(function() {
            let sql="CREATE TABLE IF NOT EXISTS tb_account(id integer PRIMARY KEY, privateKey text,address text,createTime text);";
                db.run(sql,function (err) {
                    if(!err){
                        resolve("ok");
                        console.log("init db complete");
                    }else{
                        reject(err);
                        console.log("init db error: "+err);
                    }
                });
            let sql2="CREATE TABLE IF NOT EXISTS tb_transaction(id integer PRIMARY KEY,hash text,nonce text,fromaddress text,toaddress text,value real,gas text,gasPrice text,data text,type integer,chainId integer,chainName text,pid integer,createTime text);";
            db.run(sql2,function (err) {
                if(!err){
                    resolve("ok");
                    console.log("init db complete");
                }else{
                    reject(err);
                    console.log("init db error: "+err);
                }
            });

            db.run("CREATE TABLE IF NOT EXISTS tb_chain(id text, chainId text,chainName text);",function (err) {
                if(!err){
                    resolve("ok");
                    console.log("init db_chain complete");
                }else{
                    reject(err);
                    console.log("init db_chain error: ", err);
                }
            });
            });
        });
	}

}

module.exports = new DB();