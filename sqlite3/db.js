/**
 * Created by skykingit on 2017/3/30.
 */


var sqlite3 = require('sqlite3').verbose();
var Promise = require("bluebird");
var db = new sqlite3.Database('./sqlite3/pchainWallet',function(data){
    // console.log(data);
});

db.serialize(function() {

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
            responseObj.error = err;
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

// db.close();

module.exports = sqliteObj;