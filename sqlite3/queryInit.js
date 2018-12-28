/**
 *@author cybaoz@163.com
 *@description
 *@date 2018/12/27
 */
var Promise = require("bluebird");

class initChild{
     queryChild() {
        return new Promise(function (resolve, reject) {
            resolve("ok");

        })

    }
}
module.exports = new initChild();