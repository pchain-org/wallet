/**
 *@author cybaoz@163.com
 *@description sqlite3 Package function
 *@date 2018/12/21
 */
var sqlietDb = require("../../sqlite3/db");
var Promise = require("bluebird");
const path = require("path");


function addRpcUrl(url) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_url(id,url,createTime) VALUES (?,?,?)";
        var array = [null, url, new Date()]
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}
function queryRpcUrl() {
    return new Promise(function (accept,reject) {
        var sql = "select url from tb_url order by id desc limit 1";
        sqlietDb.query(sql).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}

/*
   save createChildChain record
 */
function createChildChain(obj) {
    console.log(obj)
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,fromaddress,type,chainName,pid,createTime,status) VALUES (?,?,?,?,?,?,?,?)";
        var array = [null, obj.hash, obj.fromaddress,3,obj.chainName,0,new Date(),obj.status];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save addTransaction error:", e);
        })
    });
}


/*
   save delegate  record
 */
function createDelegate(obj) {
    console.log(obj)
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,fromaddress,type,toaddress,pid,createTime,status) VALUES (?,?,?,?,?,?,?,?)";
        var array = [null, obj.hash, obj.fromaddress,5,obj.toaddress,0,new Date(),obj.status];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save createDelegate error:", e);
        })
    });
}

/*
   save delegate  record
 */
function createCandidate(obj) {
    console.log(obj)
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,fromaddress,type,value,data,pid,createTime,status) VALUES (?,?,?,?,?,?,?,?,?)";
        var array = [null, obj.hash, obj.fromaddress,6,obj.value,obj.data,0,new Date(),obj.status];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save createCandidate error:", e);
        })
    });
}



/*
   save transaction record
 */
function addTransactionDev(obj) {
    console.log(obj)
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,fromaddress,toaddress,value,gasPrice,data,type,pid,createTime,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
        var array = [null, obj.hash,obj.fromaddress,obj.toaddress,obj.value,obj.gasPrice,obj.data,4,0,new Date(),1];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save addTransaction error:", e);
        })
    });
}

/*
 query transactions
 */

function queryTransactionDevList(address,type) {
    return new Promise(function (accept,reject) {
        var sql = "select hash,toaddress,value,chainName,fromaddress,status,data from tb_transaction where type =? and fromaddress=? order by id desc limit 10";
        var array = [type,address]
        sqlietDb.queryAllByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}




