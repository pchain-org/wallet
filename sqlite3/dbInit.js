/**
 * Created by skykingit on 2018/12/01.
 */


var sqlite3 = require('sqlite3').verbose();
var Setting = require("../lib/setting.js");
var Promise = require("bluebird");
const DBPath = Setting.DBPath;

var db;
let self;
class DB{
	constructor(){
        self = this;
	}

    openDb(){
        return new Promise(function (resolve,reject) {
            db = new sqlite3.Database(DBPath,function(data){
                if(data){
                    if(data.errno){
                        reject(data);
                    }
                }else{
                    resolve(true);
                }
            });
        });

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

    execute(sql,varArr) {
        var responseObj ={result:'success', data:{}, error:{}};
        return new Promise(function (accept,reject) {
            var stmt = db.prepare(sql);
            var flag = false;
            if(stmt.run.call(stmt,varArr)){
                flag = true;
            }
            stmt.finalize();
            if(flag){
                accept(responseObj);
            }else{
                responseObj.result = "error";
                responseObj.error = "Execution failed";
                reject(responseObj);
            }
        });

    }

    query(sql) {
        var responseObj ={result:'success', data:{}, error:{}};
        return new Promise(function (accept,reject) {
            db.all(sql, function(err, row) {
                if(!err){
                    responseObj.data = row;
                    accept(responseObj);
                }else{
                    responseObj.result = "error";
                    responseObj.error = err;
                    reject(responseObj);
                }
            });
        });

    }

    queryByParam(sql,param) {
        var responseObj ={result:'success', data:{}, error:{}};
        return new Promise(function (accept,reject) {
            db.get(sql,param, function(err, row) {
                if(!err){
                    responseObj.data = row;
                    accept(responseObj);
                }else{
                    responseObj.result = "error";
                    responseObj.error = err;
                    reject(responseObj);
                }
            });
        });
    }

	init(){
        return new Promise(function (resolve,reject) {
            let sql="CREATE TABLE IF NOT EXISTS tb_account(id integer PRIMARY KEY, privateKey text,address text,createTime text);";
            self.promiseRun(sql).then((result)=>{
                if(result){
                    let sql2="CREATE TABLE IF NOT EXISTS tb_transaction(id integer PRIMARY KEY,hash text,nonce text,fromaddress text,toaddress text,value text,gas text,gasPrice text,data text,type integer,chainId integer,chainName text,pid integer,createTime text,signData text,status integer);";
                    return self.promiseRun(sql2);
                }
            }).then((result)=> {
                if (result) {
                    let sql3 = "CREATE TABLE IF NOT EXISTS tb_url(id integer PRIMARY KEY,createTime text,url text);";
                    return self.promiseRun(sql3);
                }
            }).then((result)=> {
                if (result) {
                    let sql4 = "CREATE TABLE IF NOT EXISTS tb_erc20_account(id integer PRIMARY KEY, privateKey text,address text,createTime text);";
                    return self.promiseRun(sql4);
                }
            }).then((result)=> {
                if (result) {
                    let sql5 = "CREATE TABLE IF NOT EXISTS tb_pibnb_account(id integer PRIMARY KEY, privateKey text,address text,createTime text);";
                    return self.promiseRun(sql5);
                }
            }).then((result)=> {
                if (result) {
                    let sql6 = "CREATE TABLE IF NOT EXISTS tb_erc20_pi_transaction(id integer PRIMARY KEY, chainId text,funCode text,preimage text,ethContractId text,piContractId text,withdrawHelper text,withdrawHelperPriv text,withdrawHash text,hash text,fromaddress text,toaddress text,value text,status integer,createTime text);";
                    return self.promiseRun(sql6);
                }
            }).then((result)=> {
                if (result) {
                    resolve('ok');
                }
            }).catch((err)=>{
                console.log("in error",err);
                reject(err);
            })
        });
	}

}

module.exports = new DB();
