/**
 *@author cybaoz@163.com
 *@description
 *@date 2018/12/27
 */
var Promise = require("bluebird");
const PackageJson = require("../pkg/child/package.json");
// const Got = require("got");
// const gitPackageJsonUrl = "https://raw.githubusercontent.com/PchainJS/PchainWeb3/master/package.json";
var sqlite3 = require('sqlite3').verbose();
var Setting = require("../lib/setting.js");
const DBPath = Setting.DBPath;

let db;
let self;

class initChild{
    constructor(){
        self = this;
        self.currentVersion = "";
        self.latestVersion = "";
        db = new sqlite3.Database(DBPath,function(data){
            // console.log(data);
        });
    }

    queryChild() {
        return new Promise(function (resolve,reject) {
            self.getUpdate().then(function (data) {
                resolve(data);
            });
        });
    }

    // getLatestPackageJson(){
    //     return new Promise(function (accept,reject) {
    //         try{
    //             Got(gitPackageJsonUrl,{json:true}).then(function(result){
    //                 accept(true);
    //             }).catch(function(err){
    //                 reject(err);
    //             });
    //         }catch(error){
    //             reject(error);
    //         }
    //     });
    // }

    // get localPackageJson(){
    //     return PackageJson;
    // }


    getUpdate(){


        // self.currentVersion = currentVersion;
        return new Promise(function (accept,reject) {

            let currentVersion = PackageJson.version;
            let latestVersion = PackageJson.version_latest;
            // self.latestVersion = latestVersion;
            if(currentVersion == latestVersion){
                db.all("select * from tb_chain", function(err, row) {
                    console.log(row);
                    if(row.length == 0){
                        var sqlone1 = "INSERT INTO tb_chain(id,chainId,chainName) VALUES (?,?,?)";
                        var array1=["1","child_0","Child Chain1"];
                        self.excChain(sqlone1, array1);
                        var sqlone2 = "INSERT INTO tb_chain(id,chainId,chainName) VALUES (?,?,?)";
                        var array2=["2","child_1","Child Chain2"];
                        self.excChain(sqlone2, array2);
                        console.log("init tb_chain ...success!");
                        accept(true);
                    }else{
                        accept(true);
                    }
                });
             }else {
                var arr = latestVersion;
                var obj = eval(PackageJson);
                if(obj) {

                    db.all("select * from tb_chain", function(err, row) {
                        // console.log(" tb_chain ...", row);
                        if(row.length == 0){
                            var sqlone1 = "INSERT INTO tb_chain(id,chainId,chainName) VALUES (?,?,?)";
                            var array1=["1","child_0","Child Chain1"];
                            self.excChain(sqlone1, array1);
                            var sqlone2 = "INSERT INTO tb_chain(id,chainId,chainName) VALUES (?,?,?)";
                            var array2=["2","child_1","Child Chain2"];
                            self.excChain(sqlone2, array2);
                            // console.log("init tb_chain ...success!");
                            accept(true);
                        }else{
                            // console.log("insert into tb_chain..." );
                            for (var i=row.length; i<arr; i++) {
                                var sqlone = "INSERT INTO tb_chain(id,chainId,chainName) VALUES (?,?,?)";
                                var array=[obj.chain[i].id, obj.chain[i].chainId, obj.chain[i].chainName];
                                self.excChain(sqlone, array);
                            }
                            accept(true);
                        }
                    });
                }

            }

            // self.getLatestPackageJson().then(function(json){
            //     let latestVersion = json.version;
            //     self.latestVersion = latestVersion;

            // if(currentVersion == latestVersion){
            //     accept(false);
            // }else {
            //     var arr = latestVersion;
            //
            //     var obj = eval(PackageJson);
            //     if(obj) {
            //     }
            //     db.run("CREATE TABLE IF NOT EXISTS tb_chain(id text, chainId text,chainName text);");
            //     db.all("select * from tb_chain", function(err, row) {
            //         console.log(" tb_chain ...", row);
            //         if(!row){
            //             var sqlone1 = "INSERT INTO tb_chain(id,chainId,chainName) VALUES (?,?,?)";
            //             var array1=["1","child_0","Child Chain1"];
            //             self.excChain(sqlone1, array1);
            //             var sqlone2 = "INSERT INTO tb_chain(id,chainId,chainName) VALUES (?,?,?)";
            //             var array2=["2","child_1","Child Chain2"];
            //             self.excChain(sqlone2, array2);
            //             console.log("init tb_chain ...success!");
            //             accept(true);
            //         }else{
            //             console.log("insert into tb_chain..." );
            //             for (var i=row.length; i<arr; i++) {
            //                 if(obj){
            //                     var sqlone1 = "INSERT INTO tb_chain(id,chainId,chainName) VALUES (?,?,?)";
            //                     var array1=[obj.chain[i].id, obj.chain[i].chainId, obj.chain[i].chainName];
            //                     self.excChain(sqlone1, array1);
            //                 }
            //             }
            //             accept(true);
            //         }
            //     });
            //
            // }

            // }).catch(function(e){
            //     reject(e);
            // })

        });
    }

    excChain(sql,varArr) {
        return new Promise(function (accept,reject) {
            var stmt = db.prepare(sql);
            var flag = false;
            if(stmt.run.call(stmt,varArr)){
                flag = true;
            }
            stmt.finalize();
            if(flag){
                accept(flag);
            }else{
                reject(flag);
            }
        });
    }

}
module.exports = new initChild();