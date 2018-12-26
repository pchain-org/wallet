/**
 * Created by skykingit on 2018/12/01.
 */


var sqlite3 = require('sqlite3').verbose();
var Promise = require("bluebird");
const path = require('path')
var Setting = require("../lib/settingRemote.js");
const DBPath = Setting.DBPath;

console.log(DBPath);

var db = new sqlite3.Database('./sqlite3/pchainWallet',function(data){
    // console.log(data);
});


var responseObj ={
    result:'success',
    data:{},
    error:{}
};
var sqliteObj = {};

sqliteObj.createTable = function (sql) {
    return new Promise(function (accept,reject) {
        db.run(sql,function (err) {
            if(!err){
                accept(responseObj);
            }else{
                responseObj.result = "error";
                responseObj.error = err;
                reject(responseObj);
            }
        }); 
    });
}

sqliteObj.execute = function (sql,varArr) {
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

sqliteObj.query = function (sql) {
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

sqliteObj.queryByParam = function (sql,param) {
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


// db.serialize(function() {

    // db.run("CREATE TABLE IF NOT EXISTS tb_account(id integer PRIMARY KEY, privateKey text,address text,createTime text)");
    //
    // db.run("CREATE TABLE IF NOT EXISTS tb_transaction(id integer PRIMARY KEY, blockNumber text,timeStamp text,hash text,nonce text,blockHash text,contractAddress text,fromaddress text,toaddress text,value real,gas text,gasPrice text,gasUsed text, createTime text)");

    // db.run("CREATE TABLE  IF NOT EXISTS lorem (info TEXT)");

    // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    // for (var i = 0; i < 10; i++) {
    //     stmt.run("Ipsum " + i);
    // }
    // stmt.finalize();
    //
    // db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
    //     console.log(row.id + ": " + row.info);
    // });
//     var sqlone = "INSERT INTO tb_account(id,privateKey,address,createTime) VALUES (?,?,?,?)";
//     var array=[null,"dec606ecbb60e2c9471baeb1aa161cd570448bf134385e742dc6b9c93737f060","0x9622dcf40b4c71d4fe23f2665d836dc6a7e4ff17",new Date()]
//     var results = sqliteObj.execute(sqlone, array);
//     console.log(results)
//
//     var sqltwo = "select * from tb_account";
//     var resultsObj = sqliteObj.query(sqltwo);
//     console.log(resultsObj)
//
//     db.each("SELECT * FROM tb_account", function(err, row) {
//         console.log(row.id + ": " + row.privateKey);
//     });
// });

// db.close();

module.exports = sqliteObj;