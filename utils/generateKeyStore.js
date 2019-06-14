const fs = require("fs")
const wallet = require("ethereumjs-wallet")
const path = require('path');
var keyStoneObj = {};
var responseObj = {
    result: 'success',
    data: {},
    error: {}
};
keyStoneObj.generateKeyStore = function (dpath, pri, pasworrd) {
    return new Promise(function (accept, reject) {
        const pk = new Buffer.from(pri, 'hex');
        const account = wallet.fromPrivateKey(pk);
        const password = pasworrd;
        const content = JSON.stringify(account.toV3(password));
        const address = account.getAddress().toString('hex');
        const file = `UTC--${new Date().toISOString().replace(/[:]/g, '-')}--${address}`;
        fs.writeFile(path.join(dpath, file), content, function (err) {
            if (!err) {
                accept(responseObj);
            } else {
                responseObj.result = "error";
                responseObj.error = err;
                reject(responseObj);
            }

        })

    })
}
module.exports = keyStoneObj;