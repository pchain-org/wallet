/**
 *@author cybaoz@163.com
 *@description sqlite3 Package function
 *@date 2018/12/21
 */
var sqlietDb = require("../sqlite3/db");
var Promise = require("bluebird");
function addAccount (privateKey,address) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_account(id,privateKey,address,createTime) VALUES (?,?,?,?)";
        var array = [null, privateKey, address, new Date()]
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}
function queryAccountList() {
    return new Promise(function (accept,reject) {
        var sql = "select address from tb_account order by id desc";
        sqlietDb.query(sql).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}

function queryPrivateKey(address) {
    return new Promise(function (accept,reject) {
        var sql = "select privateKey from tb_account where address=?";
        var array = [address]
        sqlietDb.queryByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
        })
    });
}


//save chain
function addChain(chainId,chainName) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_chain(id,chainId,chainName,createTime) VALUES (?,?,?,?)";
        var array = [null, chainId, chainName, new Date().getTime()];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save chain error:", e);
        })
    });
}

//query chain
function queryChainList() {
    return new Promise(function (accept,reject) {
        var sql = "select * from tb_chain order by chainId asc";
        sqlietDb.query(sql).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}

//query chain
function queryChainByTime() {
    return new Promise(function (accept,reject) {
        var sql = "select createTime from tb_chain order by chainId asc";
        sqlietDb.query(sql).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}
/*
   save transaction record
 */
function addTransaction(obj) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,nonce,fromaddress,toaddress,value,gas,gasPrice,data,type,chainName,pid,createTime) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var array = [null, obj.hash, obj.nonce,obj.fromaddress,obj.toaddress,obj.value,obj.gas,obj.gasPrice,obj.data,obj.type,obj.chainName,0, new Date()];
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

function queryTransactionList(address) {
    return new Promise(function (accept,reject) {
        console.log(address)
        var sql = "select * from tb_transaction where type =1 and fromaddress=? order by createTime desc limit 10";
        var array = [address]
        sqlietDb.queryAllByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}
