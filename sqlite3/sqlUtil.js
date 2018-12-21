/**
 *@author cybaoz@163.com
 *@description sqlite3 Package function
 *@date 2018/12/21
 */
var sqlietDb = require("./db");

var sqlone = "INSERT INTO tb_account(id,privateKey,address,createTime) VALUES (?,?,?,?)";
var array=[null,"dec606ecbb60e2c9471baeb1aa161cd570448bf134385e742dc6b9c93737f060","0x9622dcf40b4c71d4fe23f2665d836dc6a7e4ff17",new Date()]
var results = sqlietDb.execute(sqlone, array);

sqlietDb.execute(sqlone, array).then(function (resObj) {
    console.log(resObj);
    response.data = bchAddr;
    res.json(response);
}).catch(function (e) {
    console.log(e, "newAddr error");
})
console.log(results)

var sqltwo = "select * from tb_account";
var resultsObj = sqlietDb.query(sqltwo);
console.log(resultsObj)





