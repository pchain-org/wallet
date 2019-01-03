/**
 * Created by skykingit on 2018/12/01.
 */


var sqlite3 = require('sqlite3').verbose();
var Promise = require("bluebird");
var Setting = require("../lib/settingRemote.js");
const DBPath = Setting.DBPath;

var db = new sqlite3.Database(DBPath,function(data){
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
    var responseObj ={
        result:'success',
        data:{},
        error:{}
    };
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

sqliteObj.queryAllByParam = function (sql,param) {
    return new Promise(function (accept,reject) {
        db.all(sql,param, function(err, row) {
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



// tb_chain table
// db.serialize(function() {
    //CREATE TABLE IF NOT EXISTS tb_account(id integer PRIMARY KEY, privateKey text,address text,createTime text);
    //CREATE TABLE IF NOT EXISTS tb_transaction(id integer PRIMARY KEY, blockNumber text,timeStamp text,hash text,nonce text,blockHash text,contractAddress text,fromaddress text,toaddress text,value real,gas text,gasPrice text,gasUsed text, createTime text);
    //"CREATE TABLE IF NOT EXISTS tb_chain(id integer PRIMARY KEY, chainId text,chainName text,createTime text);";
    //db.run("CREATE TABLE IF NOT EXISTS tb_chain(id integer PRIMARY KEY, chainId text,chainName text,createTime text);");
//
//
//     var sqlone1 = "INSERT INTO tb_chain(id,chainId,chainName,createTime) VALUES (?,?,?,?)";
//     var array1=[null,"1","Child Chain1",new Date()];
//     var results1 = sqliteObj.execute(sqlone1, array1);
//     console.log(results1);
//
//
//     var sqlone2 = "INSERT INTO tb_chain(id,chainId,chainName,createTime) VALUES (?,?,?,?)";
//     var array2=[null,"2","Child Chain2",new Date()];
//     var results2 = sqliteObj.execute(sqlone2, array2);
//     console.log(results2);
//
//     db.each("select * from tb_chain order by chainId asc", function(err, row) {
//         console.log(row.id + ": " + row.chainId + " : " + row.chainName);
//     });
// });
//
// db.close();

module.exports = sqliteObj;