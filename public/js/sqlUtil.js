/**
 *@author cybaoz@163.com
 *@description sqlite3 Package function
 *@date 2018/12/21
 */
var sqlietDb = require("../sqlite3/db");
var Promise = require("bluebird");
const path = require("path");
var walletUtil = require("../utils/generateKeyStore");

function importAccount (privateKey,address) {
    var responseObj ={result:'success', data:{}, error:{}};
    return new Promise(function (accept,reject) {
        queryAddressExists(address).then(function (data) {
            if(data.result="success" && data.data.len==0){
                return addAccount(privateKey,address);
            }else{
                responseObj.result="error";
                responseObj.error="Address already exists";
                reject(responseObj);
            }
        }).then(function () {
            accept(responseObj);
        }).catch(function (e) {
            reject(e);
            console.log("import privateKey error:", e);
        })
    });
}

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

function addErc20Account (privateKey,address) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_erc20_account(id,privateKey,address,createTime) VALUES (?,?,?,?)";
        var array = [null, privateKey, address, new Date()]
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}

function addPIBNBAccount (privateKey,address) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_pibnb_account(id,privateKey,address,createTime) VALUES (?,?,?,?)";
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



function queryErc20AccountList() {
    return new Promise(function (accept,reject) {
        var sql = "select address from tb_erc20_account order by id desc";
        sqlietDb.query(sql).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}


function queryPiBnbAccountList() {
    return new Promise(function (accept,reject) {
        var sql = "select address from tb_pibnb_account group by address order by id desc";
        sqlietDb.query(sql).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}


function queryAddressExists(address) {
    return new Promise(function (accept,reject) {
        var sql = "select count(*) len from tb_account where address=?";
        var array = [address]
        sqlietDb.queryByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
        })
    });
}

function queryErc20AddressExists(address) {
    return new Promise(function (accept,reject) {
        var sql = "select count(*) len from tb_erc20_account where address=?";
        var array = [address]
        sqlietDb.queryByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
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


function queryErc20PrivateKey(address) {
    return new Promise(function (accept,reject) {
        var sql = "select privateKey from tb_erc20_account where address=?";
        var array = [address]
        sqlietDb.queryByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
        })
    });
}

function queryBNBPrivateKey(address) {
    return new Promise(function (accept,reject) {
        var sql = "select privateKey from tb_pibnb_account where address=?";
        var array = [address]
        sqlietDb.queryByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
        })
    });
}

//query chain
function queryChainList() {
    return new Promise(function (accept,reject) {
        const childChainJsonPath = path.join(__dirname,"../childChain.json");
        var childChainJson = require(childChainJsonPath);
        var obj = {};
        obj.data = childChainJson.chain;
        accept(obj);
    });
}

/*
   save transaction record
 */
function addTransaction(obj) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,nonce,fromaddress,toaddress,value,gas,gasPrice,data,type,chainId,chainName,pid,createTime,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var array = [null, obj.hash, obj.nonce,obj.fromaddress,obj.toaddress,obj.value,obj.gas,obj.gasPrice,obj.data,1,obj.chainId,obj.chainName,0, new Date(),1];
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

function queryTransactionList(address,chainId) {
    return new Promise(function (accept,reject) {
        var sql = "select chainId,chainName,hash,toaddress,value from tb_transaction where type =1 and fromaddress=? and chainId=? order by id desc limit 10";
        var array = [address,chainId]
        sqlietDb.queryAllByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}

/*
 query MultiChain MainChain Transactions
 */

function queryMultiChainTxList(address,chainId) {
    return new Promise(function (accept,reject) {
        var sql = "SELECT a.id,a.fromaddress,a.toaddress ,a.`value`,a.chainId from tb_transaction a where a.pid=0 and a.chainid=? and a.type=2 and a.id in(select b.pid from tb_transaction b where b.fromaddress=? and a.id =b.pid) ORDER BY id desc limit 10;";
        var array = [chainId,address]
        sqlietDb.queryAllByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}

/*
 query MultiChain childChain Transactions
 */

function queryMultiChainChildTxList(pid) {
    return new Promise(function (accept,reject) {
        var sql = "SELECT id,chainId,chainName,fromaddress,hash,signData,createtime,status,pid,value from tb_transaction  where pid=? ORDER BY id";
        var array = [pid]
        sqlietDb.queryAllByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}



/*
MultiChain save
 */
function addMultiChainTransaction(obj) {
    var responseObj ={result:'success', data:{}, error:{}};
    var mpid=0;
    return new Promise(function (accept,reject) {
        saveMultiChainMain(obj).then(function (data) {
            if(data.result="success"){
                return queryMultiChainLastId(data);
            }
        }).then(function (pid) {
            obj.pid=pid;
            mpid=pid;
            return saveMultiChainChild2(obj);
        }).then(function () {
            responseObj.data=mpid;
            accept(responseObj);
        }).catch(function (e) {
            reject(e);
            console.log("save addMultiChainTransaction error:", e);
        })
    });


}

/*
save MultiChain main
 */
function saveMultiChainMain(obj) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,nonce,fromaddress,toaddress,value,gas,gasPrice,type,chainId,chainName,pid,createTime,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var array = [null,obj.hash,obj.nonce,obj.chainName,obj.crossChainName,obj.value,obj.gas,obj.gasPrice,2,obj.chainId,obj.chainName,0,new Date(),1];//主链转子链
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save addTransaction error:", e);
        })
    });
}

/*
save MultiChain 2
 */
function saveMultiChainChild2(obj) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,nonce,fromaddress,toaddress,value,gas,gasPrice,type,chainId,chainName,pid,createTime,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var array = [null,obj.hash,obj.nonce,obj.fromaddress,"0x0000000000000000000000000000000000000065",obj.value,obj.gas,obj.gasPrice,2,obj.chainId,obj.chainName,obj.pid,new Date(),1];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save addTransaction error:", e);
        })
    });
}

/*
save MultiChain 3
 */
function saveMultiChainChild3(obj) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,nonce,fromaddress,toaddress,value,gas,gasPrice,type,chainId,chainName,pid,createTime,status,signData) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var array = [null,obj.hash,obj.nonce,obj.fromaddress,"0x0000000000000000000000000000000000000065",obj.value,obj.gas,obj.gasPrice,2,obj.crossChainId,obj.crossChainName,obj.pid,new Date(),obj.status,obj.signData];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save addTransaction error:", e);
        })
    });
}


/*
update status
 */
function updateMultiChainChild3(obj) {
    return new Promise(function (accept,reject) {
        var sql = "update tb_transaction set hash =?,status=? where id=?";
        var array = [obj.hash,obj.status,obj.id];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("update Transaction status error:", e);
        })
    });
}

/*
max id
 */
function queryMultiChainLastId() {
    return new Promise(function (accept,reject) {
        var sql = "select last_insert_rowid() pid from tb_transaction";
        sqlietDb.query(sql).then(function (resObj) {
            accept(resObj.data[0].pid);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}

/*
   save delegate  record
 */
function createDelegate(obj) {
    return new Promise(function (accept,reject) {
        if(obj.status==1){
            updateCancelDelegateStatus(obj.id).then(function (data) {
                if(data.result="success"){
                    return insertDelegate(obj);
                }
            }).then(function (responseObj) {
                accept(responseObj);
            }).catch(function (e) {
                reject(e);
                console.log("save cancelDelegate error:", e);
            })
        }else{
            insertDelegate(obj).then(function (data) {
                accept(data);
            }).catch(function (e) {
                reject(e);
                console.log("save createDelegate error:", e);
            })
        }

    });
}

/*
   save delegate  record
 */
function insertDelegate(obj) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,fromaddress,type,toaddress,pid,createTime,status,value) VALUES (?,?,?,?,?,?,?,?,?)";
        var array = [null, obj.hash, obj.fromaddress,7,obj.toaddress,0,new Date(),obj.status,obj.value];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save createDelegate error:", e);
        })
    });
}

/*
 query transactions
 */

function queryTransactionDelegateList(address,type) {
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

/*
 query queryCancelDelegateList
 */

function queryCancelDelegateList(address,type) {
    return new Promise(function (accept,reject) {
        var sql = "select id,toaddress address,value amount from tb_transaction where type =? and fromaddress=? and status=0  order by id desc";
        var array = [type,address]
        sqlietDb.queryAllByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}


/*
   updtate Canceldelegate  status=2
 */
function updateCancelDelegateStatus(id) {
    return new Promise(function (accept,reject) {
        var sql = "update tb_transaction set status=? where id=?";
        var array = [2,id];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save createDelegate error:", e);
        })
    });
}

/*
   save createChildChain record
 */
function createChildChain(obj) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,fromaddress,type,chainId,chainName,pid,createTime,value) VALUES (?,?,?,?,?,?,?,?)";
        var array = [null, obj.hash, obj.fromaddress,8,obj.chainId,obj.chainName,0,new Date(),obj.value];
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

function queryTransactionChildList(address,type) {
    return new Promise(function (accept,reject) {
        var sql = "select hash,toaddress,value,chainId,chainName,fromaddress from tb_transaction where type =? and fromaddress=? order by id desc limit 10";
        var array = [type,address]
        sqlietDb.queryAllByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}


function addSetBlockReward(obj) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,fromaddress,type,chainId,chainName,pid,createTime,value) VALUES (?,?,?,?,?,?,?,?)";
        var array = [null, obj.hash, obj.fromaddress,9,obj.chainId,obj.chainName,0,new Date(),obj.value];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
        })
    });
}

function exportKeystone(path,pri,pasworrd) {
    return new Promise(function (accept,reject) {
        walletUtil.generateKeyStore(path,pri,pasworrd).then(function (resObj) {
            accept(resObj);
         }).catch(function (e) {
            reject(e);
        })
    });
}

function importErc20Account (privateKey,address) {
    var responseObj ={result:'success', data:{}, error:{}};
    responseObj.data=false;
    return new Promise(function (accept,reject) {
        queryErc20AddressExists(address).then(function (data) {
            if(data.result="success" && data.data.len==0){
                return addErc20Account(privateKey,address);
            }else{
                responseObj.result="error";
                responseObj.error="Erc20 Address already exists";
                reject(responseObj);
            }
        }).then(function (data) {
            if (data.result = "success") {
                queryAddressExists(address).then(function (data) {
                    if(data.result="success" && data.data.len==0){
                        responseObj.data=true;
                        return addAccount(privateKey,address);
                    }
                }).then(function () {
                    accept(responseObj);
                })
            }
        }).catch(function (e) {
            reject(e);
        })
    });
}


/*
   save tokenswap record
 */
function createTokenSwapInfo(obj) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_transaction(id,hash,fromaddress,type,toaddress,pid,createTime,status,value) VALUES (?,?,?,?,?,?,?,?,?)";
        var array = [null, obj.hash, obj.fromaddress,obj.type,obj.toaddress,0,new Date(),1,obj.value];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save createTokenSwapInfo error:", e);
        })
    });
}


function createErc20PiInfo(obj) {
    return new Promise(function (accept,reject) {
        var sql = "INSERT INTO tb_erc20_pi_transaction(id,chainId,funCode,preimage,ethContractId,piContractId,hash,fromaddress,toaddress,value,status,createTime) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
        var array = [null, obj.chainId, obj.funCode, obj.preimage, obj.ethContractId, obj.piContractId, obj.hash, obj.fromaddress,obj.toaddress,obj.value,obj.status,new Date()];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("save createTokenSwapInfo error:", e);
        })
    });
}

function queryTOaddress(hash,address) {
    return new Promise(function (accept,reject) {
        var sql = "select ethContractId,piContractId,preimage from tb_erc20_pi_transaction where hash=? and toaddress=? ";
        var array = [hash,address];
        sqlietDb.queryByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
        })
    });
}



function queryErc20PiInfoTXList(address,chainId) {
    return new Promise(function (accept,reject) {
        var sql = "select chainId,funCode,preimage,ethContractId,piContractId,hash,toaddress,fromaddress,value,status from tb_erc20_pi_transaction where fromaddress=? and chainId=? order by id desc limit 10";
        var array = [address,chainId];
        sqlietDb.queryAllByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}

function queryErc20PiStatusList(address,chainId,status) {
    return new Promise(function (accept,reject) {
        var sql = "select chainId,funCode,preimage,ethContractId,piContractId,hash,toaddress,fromaddress,value,status from tb_erc20_pi_transaction where fromaddress=? and chainId=? and status=? order by id asc";
        var array = [address,chainId,status];
        sqlietDb.queryAllByParam(sql,array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log(e, "error");
        })
    });
}

/*
 *   update status
 */
function updateErc20PiInfo(obj) {
    return new Promise(function (accept,reject) {
        var sql = "update tb_erc20_pi_transaction set status=?,ethContractId=?,piContractId=? where hash=? and chainId=?";

        var array = [obj.status,obj.ethContractId,obj.piContractId,obj.hash,obj.chainId];
        sqlietDb.execute(sql, array).then(function (resObj) {
            accept(resObj);
        }).catch(function (e) {
            reject(e);
            console.log("update Transaction status error:", e);
        })
    });
}
