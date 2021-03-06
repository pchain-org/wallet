/**
 * Created by skykingit on 2018/12/30.
 */
const Web3 = require("pweb3");
const EthTx = require("pchainjs-tx");
const TxData = require("txdata");
const CryptoJS = require("crypto-js");
const BnbApiClient = require('@binance-chain/javascript-sdk');
const crypto = BnbApiClient.crypto
const BigNumber = require('bignumber.js');
const _ = require("lodash");
window.angularApp = angular.module('myApp', []);

angularApp.filter('gmtTime', function() {
        return function(d) {
            var gt = new Date(d*1000);
            return gt.toGMTString();
        }
});

angularApp.filter('weiToPI', function() {
        return function(v) {
            const web3 = new Web3();
            return web3.fromWei(v,'ether')+" PI";
        }
});

function AESEncrypt(msg, password) {
    return CryptoJS.AES.encrypt(msg, password).toString();
}

function AESDecrypt(enMsg, password) {
    return CryptoJS.AES.decrypt(enMsg, password).toString(CryptoJS.enc.Utf8);
}

function loading() {
    var html = '<div class="loading"><div class="pic"><div class="myloader"></div></div></div>';
    $('body').append(html);
}

function removeLoading() {
    $('body').find('.loading').remove();
}

function removePageLoader() {
    $(".page-loader-wrapper").hide();
}

setTimeout(removePageLoader, 1500);

function showPopup(str, time, callback) {
    if (!time) time = 3000;
    var html = '<div class="popup"><div class="pContent"><p>' + str + '</p></div></div>';
    $('body').append(html);
    setTimeout(function() {
        removePopup();
        if (callback)
            callback();
    }, time)
}

function removePopup() {
    $('body').find('.popup').remove();
}

function showNotification(colorName, text, placementFrom, placementAlign, animateEnter, animateExit, time) {
    if (colorName === null || colorName === '') { colorName = 'bg-black'; }
    if (text === null || text === '') { text = 'Turning standard Bootstrap alerts'; }
    if (animateEnter === null || animateEnter === '') { animateEnter = 'animated fadeInDown'; }
    if (animateExit === null || animateExit === '') { animateExit = 'animated fadeOutUp'; }
    if (time === null || time === '') { time = 2000; }

    var allowDismiss = true;

    $.notify({
        message: text
    }, {
        type: colorName,
        allow_dismiss: allowDismiss,
        newest_on_top: true,
        timer: time,
        placement: {
            from: placementFrom,
            align: placementAlign
        },
        animate: {
            enter: animateEnter,
            exit: animateExit
        },
        template: '<div data-notify="container" class="bootstrap-notify-container myNotify alert alert-dismissible {0} ' + (allowDismiss ? "p-r-35" : "") + '" role="alert">' +
            '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
            '<span data-notify="icon"></span> ' +
            '<span data-notify="title">{1}</span> ' +
            '<span data-notify="message" class="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
            '</div>'
    });
}

function successNotify(text) {
    showNotification("alert-success", text, "bottom", "center", 400000);
}
const Clipboard = require("clipboard");
var clipboard = new Clipboard('.copyBtn');

clipboard.on('success', function(e) {
    showNotification("alert-success", "Copy successfully", "bottom", "center", 1000);
});

function menuActive(index) {
    var menuEle = $("html #leftsidebar .menu li");
    if (menuEle.length < 1) {
        setTimeout(function() { menuActive(index); }, 2000);
    } else {
        menuEle.removeClass("active");
        menuEle.removeClass("open");
        menuEle.eq(index).addClass("active");
        menuEle.eq(index).addClass("open");
    }
}

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (decodeURI(r[2]));
    return null;
}

function priToAddress(pri) {
    const ethUtil = require("ethereumjs-util");
    if (pri.length == 64) {
        pri = "0x" + pri;
    };
    var addr = "0x" + ethUtil.privateToAddress(pri).toString('hex');
    return addr;
}

function signTx(pri, txObj) {

    var Tx = require("pchainjs-tx");

    var privateKey = new Buffer(pri, 'hex')

    var tx = new Tx(txObj);

    tx.sign(privateKey);

    var serializedTx = tx.serialize();

    var txData = "0x" + serializedTx.toString('hex');

    return txData;
}


function signMsg(pri) {
    const ethUtil = require("ethereumjs-util");
    const privateKey = new Buffer(pri, 'hex');
    const msg=ethUtil.rlphash("pchain");
    var msgdata=ethUtil.ecsign(msg, privateKey);
    var msgStr=ethUtil.toRpcSig(msgdata.v,msgdata.r,msgdata.s);
    return msgStr;
}


function signEthTx(pri, txObj) {

    var Tx = require("ethereumjs-tx");

    var privateKey = new Buffer(pri, 'hex')

    var tx = new Tx(txObj);

    tx.sign(privateKey);

    var serializedTx = tx.serialize();

    var txData = "0x" + serializedTx.toString('hex');

    return txData;
}


function convert(num) {
    var x = new BigNumber(num);
    var s = "0x" + x.toString(16);
    return s;
}

function padLeftEven(hex) {
    hex = hex.length % 2 != 0 ? '0' + hex : hex;
    return hex;
};

function sanitizeHex(hex) {
    hex = hex.substring(0, 2) == '0x' ? hex.substring(2) : hex;
    if (hex == "") return "";
    return '0x' + padLeftEven(hex);
};



function decimalToHex(dec) {
    return new BigNumber(dec).toString(16);
};

function getHexValue(val) {
    var s = sanitizeHex(decimalToHex(val));
}

function initSignRawPAI(toAddress, amount, nonce, gasPrice, gasLimit, chainId) {
    const rawTx = {
        nonce: convert(nonce),
        gasPrice: convert(gasPrice),
        gasLimit: convert(gasLimit),
        to: toAddress,
        value: convert(amount),
        chainId: chainId
    };

    return rawTx;
}

function initSignBuildInContract(data, nonce, gasPrice, gasLimit, chainId,amount) {
    const rawTx = {
        nonce: convert(nonce),
        gasPrice: convert(gasPrice),
        gasLimit: convert(gasLimit),
        to: "0x0000000000000000000000000000000000000065",
        value: convert(amount),
        data: data,
        chainId: chainId
    };

    return rawTx;
}

function initSignRawCrosschain(data, nonce, gasPrice, gasLimit, chainId) {
    const rawTx = {
        nonce: convert(nonce),
        gasPrice: convert(gasPrice),
        gasLimit: convert(gasLimit),
        data: data,
        to: "0x0000000000000000000000000000000000000065",
        chainId: chainId
    };
    return rawTx;
}

function initSignRawContract(toAddress, data, nonce, gasPrice, gasLimit, amount, chainId) {
    const rawTx = {
        nonce: convert(nonce),
        gasPrice: convert(gasPrice),
        gasLimit: convert(gasLimit),
        to: toAddress,
        data: data,
        value: convert(amount),
        chainId: chainId
    };
    return rawTx;
}


function initSignRawContracttest(toAddress, data, gasPrice, gasLimit) {
    const rawTx = {
        from: "79cd31b59e3faab6deea68fbbaafa4da748bbdf6",
        gasPrice: convert(30000000000 ),
        gasLimit: convert(700000000),
        // to: "",
        data: data,
        // value: convert(0),
        // chainId: "0x1941638642218601557581943248374279636706439064705103919961555643535977130293"
    };
    return rawTx;
}


function initEthSignRawContract(nonce, gasPrice, gasLimit, contract, data) {
    const rawTx = {
        nonce: convert(nonce),
        gasPrice: convert(gasPrice),
        gasLimit: convert(gasLimit),
        to: contract,
        data: data,
    };
    return rawTx;
}


const getClient = async () => {
    const client = new BnbApiClient(APIBNB)
    await client.initChain();
    return client
}

async function getPIBNBBalance(address) {
    const client = await getClient();
    return new Promise(function (accept, reject) {
        client.getBalance(address).then((result) => {
            if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i].symbol == symbol) {
                        accept(result[i].free);
                        break;
                    }
                }
            } else {
                accept(0);
            }
        }).catch((error) => {
            accept(0);
            console.error('error', error);
        });
    });
}


const symbol='PIBNB-43C';

const APIHost = "https://api.pchain.org";

const APIBNB = 'https://dex.binance.org/'; /// api string

const contractAddress="0xB9bb08AB7E9Fa0A1356bd4A39eC0ca267E03b0b3";

const swapAddr="0x7429f3eca2dca9f12fe0728c2f1ac198dbb64f85";

const swap_pibnb_toAddress="0xc66e0de96483fcaec958cf25e1d9cbfaba145e65";

const swap_bnbpi_toAddress="bnb1p0t3yamtw0qkecvf2m435zkvz9sv4uyrw8dhqz";


var crossChainABI = [{
        "type": "function",
        "name": "DepositInMainChain",
        "constant": false,
        "inputs": [{
                "name": "chainId",
                "type": "string"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "DepositInChildChain",
        "constant": false,
        "inputs": [{
                "name": "chainId",
                "type": "string"
            },
            {
                "name": "txHash",
                "type": "bytes32"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "WithdrawFromChildChain",
        "constant": false,
        "inputs": [{
                "name": "chainId",
                "type": "string"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "WithdrawFromMainChain",
        "constant": false,
        "inputs": [{
                "name": "chainId",
                "type": "string"
            },
            {
                "name": "amount",
                "type": "uint256"
            },
            {
                "name": "txHash",
                "type": "bytes32"
            }
        ],
        "outputs": []
    }
]

var DelegateABI = [{
        "type": "function",
        "name": "Delegate",
        "constant": false,
        "inputs": [
            {
                "name": "candidate",
                "type": "address"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "CancelDelegate",
        "constant": false,
        "inputs": [
            {
                "name": "candidate",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "outputs": []
    }];


var ChainABI = [{
        "type": "function",
        "name": "CreateChildChain",
        "constant": false,
        "inputs": [
            {
                "name": "chainId",
                "type": "string"
            },
            {
                "name": "minValidators",
                "type": "uint16"
            },
            {
                "name": "minDepositAmount",
                "type": "uint256"
            },
            {
                "name": "startBlock",
                "type": "uint256"
            },
            {
                "name": "endBlock",
                "type": "uint256"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "SetBlockReward",
        "constant": false,
        "inputs": [
            {
                "name": "chainId",
                "type": "string"
            },
            {
                "name": "reward",
                "type": "uint256"
            }
        ],
        "outputs": []
    }];


var balanceABI =[{
        "constant": true,
        "inputs": [{
            "name": "_owner",
            "type": "address"
        }],
        "name": "balanceOf",
        "outputs": [{
            "name": "balance",
            "type": "uint256"
        }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }];


var transferABI=[{
        "constant": false,
        "inputs": [{
            "name": "_to",
            "type": "address"
        }, {
            "name": "_value",
            "type": "uint256"
        }],
        "name": "transfer",
        "outputs": [{
            "name": "success",
            "type": "bool"
        }],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }];

var extractRewardABI=[
    {
        "type": "function",
        "name": "ExtractReward",
        "constant": false,
        "inputs": [{
            "name": "address",
            "type": "address"
        }],
        "outputs": []
    }
]

