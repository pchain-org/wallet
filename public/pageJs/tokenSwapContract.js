var Accounts = new Accounts();
const {ipcRenderer} = require('electron');
const {shell} = require('electron');
const schedule = require('node-schedule');

angularApp.controller('myCtrl', function($scope, $http) {
     $scope.gasLimit = 60000;
     $scope.gasPrice = 10;
     $scope.nonce = 0;
     $scope.balance = 0;
     $scope.maxSendAmount = 0;

    $scope.getPlayLoad = function(abi, funName, paramArr) {
        var playLoadData = TxData(abi, funName, paramArr);
        return playLoadData;
    }

     $scope.getBalance = function() {
         $scope.spin = "myIconSpin";
         var funcData = $scope.getPlayLoad(balanceABI, "balanceOf", [$scope.erc20account.address]);
         var callObj = { to: PAIStandardTokenContractAddress, data: funcData };
         // var callObj = { to: contractAddress, data: funcData };
         var obj = {};
         obj.callObj = callObj;

         var url = localhostHost + "/getErc20Balance";
         // var url = APIHost + "/getErc20Balance";

         $http({
             method: 'POST',
             url: url,
             data: obj
         }).then(function successCallback(res) {
             $scope.spin = "";
             removePageLoader();
             if (res.data.result == "success") {
                 $scope.balance = res.data.data;
                 $scope.getMaxSendAmount();
             } else {
                 showPopup(res.data.error, 3000);
             }

         }, function errorCallback(res) {
             showPopup("Internet error, please refresh the page");
         });

         queryErc20PiInfoTXList($scope.erc20account.address, ethChainId).then(function(robj) {
             $scope.transactionERC20List = robj.data;
             $scope.$apply();
         });

     }

    $scope.getMaxSendAmount = function() {
        let b = new BigNumber($scope.balance);
        $scope.maxSendAmount = b.decimalPlaces(18);
    }

     $scope.nonceFlag = true;
     $scope.getErc20Nonce = function() {
         $scope.nonceFlag = false;
         var obj = {};
         obj.address = $scope.erc20account.address;
         //console.log(obj);
         // obj.chainId = 1;
         // var url = APIHost + "/getNonce";
         var url = localhostHost + "/getErc20Nonce";
         $http({
             method: 'POST',
             url: url,
             data: obj
         }).then(function successCallback(res) {
             if (res.data.result == "success") {
                 console.log(res);
                 $scope.nonce = Number(res.data.nonce);
                 $scope.gasPrice=res.data.gas;
                 $scope.nonceFlag = true;

             } else {
                 showPopup(res.data.message, 3000);
             }
         }, function errorCallback(res) {
             showPopup("Internet error, please refresh the page");
         });
     }

    $scope.childNonceFlag = true;
    $scope.getChildNonce = function(withdrawHelper) {
        $scope.childNonceFlag = false;
        var obj = {};
        obj.address = withdrawHelper;
        // var url = APIHost + "/getNonce";
        var url = localhostHost + "/getChildNonce";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            console.log(res, " ====================getChildNonce============== " );
            if (res.data.result == "success") {
                // console.log(res);
                $scope.childNonce = Number(res.data.nonce);
                $scope.childNonceFlag = true;
            } else {
                showPopup(res.data.message, 3000);
            }
        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });
    }

    $scope.refundNonceFlag = true;
    $scope.getErc20RefundFromNonce = function() {
        $scope.refundNonceFlag = false;
        var obj = {};
        obj.address = $scope.refundFrom;
        // obj.chainId = 1;
        // var url = APIHost + "/getNonce";
        var url = localhostHost + "/getErc20Nonce";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            if (res.data.result == "success") {
                console.log(res);
                $scope.refundFromNonce = Number(res.data.nonce);
                $scope.refundNonceFlag = true;
            } else {
                showPopup(res.data.message, 3000);
            }
        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });
    }


     $scope.accountList = new Array();

     $scope.erc20accountList = new Array();

     queryErc20AccountList().then(function(resObj) {
         $scope.erc20accountList = resObj.data;
         try {
             if ($scope.erc20accountList.length > 0) {
                 $scope.erc20account = $scope.erc20accountList[0];
                 $scope.getBalance();
             }
             if ($scope.erc20accountList.length == 0) {
                 removePageLoader();
             }
         } catch (e) {
             console.log(e);
         }
     }).catch(function(e) {
         console.log(e, "error");
     });

     queryAccountList().then(function(resObj) {
         $scope.accountList = resObj.data;
         try {
             if ($scope.accountList.length > 0) {
                 $scope.account = $scope.accountList[0];
                 // $scope.getBalance();
             }
             if ($scope.accountList.length == 0) {
                 removePageLoader();
             }
         } catch (e) {
             console.log(e);
         }
     }).catch(function(e) {
         console.log(e, "error");
     });


     $scope.currentPrivateKey = "";
     $scope.confirmPassword = function() {
         if ($scope.account == undefined) {
             swal("Please create a wallet address at first");
             return;
         }
         queryErc20PrivateKey($scope.erc20account.address).then(function(result) {
             if (result.result == "success") {
                 var dePri = AESDecrypt(result.data.privateKey, $scope.inputPassword);
                 if (dePri) {
                     $scope.currentPrivateKey = dePri;
                     $scope.inputPassword = "";
                     $scope.$apply();
                     $('#enterPassword').modal('hide');
                     $scope.submit();

                 } else {
                     swal("Password error");
                 }
             } else {
                 swal("Password error");
             }
         }).catch(function(e) {
            console.log(e);
             swal("Password error");
         });
     };

    // $scope.showEnterPwdPI = function(swapToHash,swapTo) {
    //
    //     $scope.swapToHash = swapToHash;
    //
    //     $scope.swapTo = swapTo;
    //
    //     $scope.getChildNonce();
    //
    //     $('#enterPasswordPI').modal('show');
    //
    // }

    $scope.showEnterRefundPI = function(refundHash,refundFrom) {

        $scope.refundHash = refundHash;


        queryToChainIdHash($scope.refundHash,ethChainId).then(function(wdata) {
            if (wdata.result == "success") {

                console.log(wdata);

                $scope.ethContractId = wdata.data.ethContractId;

                var obj = {};
                obj.ethContractId = $scope.ethContractId;
                obj.HashedTimelockERC20ContractAddress = HashedTimelockERC20ContractAddress;

                var url = localhostHost + "/getContract";

                // var url = APIHost + "/getContract";

                $http({
                    method: 'POST',
                    url: url,
                    data: obj
                }).then(function successCallback(res) {
                    if (res.data.result == "success" && res.data.contract != undefined) {

                        $scope.refundFrom = refundFrom;

                        console.log(res.data.contract.sender,res.data.contract.timelock,nowSeconds(),res.data.contract.withdrawn,"=============getContract");

                        if ($scope.refundFrom == res.data.contract.sender && res.data.contract.withdrawn == false && res.data.contract.timelock < nowSeconds()) {

                            $scope.getErc20RefundFromNonce();

                            $('#enterPasswordRefundPI').modal('show');

                        } else {

                            $scope.refundFrom = "";

                            swal("Refund time: " + res.data.contract.timelock ,"Refund time not arrive yet, please try refund after !","error");
                        }
                    } else {
                        swal("The contract time lock-in on the Ethernet is not overtime",res.data.message.toString(),"error");
                    }
                }, function errorCallback(res) {
                    showPopup("Internet error, please refresh the page");
                });
            } else {
                showPopup("Internet error, please refresh the page");
            }
        });
    }


     $scope.selectAccount = function() {
         // $scope.getNonce();
         // $scope.getBalance();
         // queryErc20PiInfoTXList($scope.account.address, ethChainId).then(function(robj) {
         //     $scope.transactionList = robj.data;
         //     $scope.$apply();
         // });
     }

     $scope.selectErc20Account = function() {
         $scope.getErc20Nonce();
         $scope.getBalance();
     }

    $scope.showEnterPwd = function() {
        $scope.getMaxSendAmount();
        // prd
        if ($scope.maxSendAmount.lt(new BigNumber($scope.toAmount))) {
            let tips1 = "Insufficient Balance ";
            let tips2 = "Max Amount :" + $scope.maxSendAmount + " PI";
            swal(tips1, tips2, "error");
        } else {
            $('#enterPassword').modal('show');
        }
        $('#enterPassword').modal('show');
    }

    $scope.getPlayLoad = function(abi, funName, paramArr) {
        var playLoadData = TxData(abi, funName, paramArr);
        return playLoadData;
    }


     var web3 = new Web3();
     $scope.submit = function() {
         $scope.getErc20Nonce();
         var txFee = $scope.gasLimit * $scope.gasPrice * Math.pow(10, 9);
         $scope.txFee = web3.fromWei(txFee, 'ether');
         $('#transaction').modal('show');
     }

     $scope.gasChanged = function() {
         $scope.gasPrice = jQuery("#gasPrice").val();

     }

    $scope.checkAllowance = function() {

        var obj = {};
        obj.funCode = ALLOWANCE;
        obj.owner = $scope.erc20account.address;
        obj.spender = HashedTimelockERC20ContractAddress;
        obj.PAIStandardTokenContractAddress = PAIStandardTokenContractAddress;
        obj.amount = $scope.toAmount;
        // var url =   APIHost + "/checkAllowance";
        var url = localhostHost + "/checkAllowance";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            $('#transaction').modal('hide');

            console.log(res.data.allowance, "' " ,$scope.toAmount, res , ":::::" + $scope.currentPrivateKey);

            if (res.data.result == "success") {

                $scope.allowance = res.data.allowance;
                const amount = web3.toWei($scope.toAmount, "ether");

                if (Number($scope.allowance) == 0) {

                    console.log("直接调用approve", $scope.toAmount);

                    if ($scope.currentPrivateKey) {
                        $scope.approve($scope.toAmount);
                    } else {
                        $('#enterPassword').modal('show');
                    }

                }else if (Number($scope.allowance) >= Number(amount)) {

                    console.log("直接运行newContract");

                    if ($scope.currentPrivateKey) {
                        $scope.sendTx();
                    } else {
                        $('#enterPassword').modal('show');
                    }

                    // $scope.approve(0); //0 , 5,     ====> 3 < 5

                } else if (Number($scope.allowance) < Number(amount)) {
                    console.log("先把amount设置为0，然后再设置成当前amount");

                    if ($scope.currentPrivateKey) {
                        $scope.approve(0); //0 , 5,     ====> 3 < 5

                    } else {
                        $('#enterPassword').modal('show');
                    }

                }
            } else {
                showPopup(res.data.message, 3000);
                $('#transaction').modal('hide');
            }
        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
            $('#transaction').modal('hide');
        });
    }

    $scope.approve = function(v) {
        try {

            if (v == undefined) {
                $scope.amount = 0;
            } else {
                $scope.amount = v;
            }
            const amount = web3.toWei($scope.amount, "ether");

            var paramArr = [HashedTimelockERC20ContractAddress,amount];

            var data = $scope.getPlayLoad(approveABI,APPROVE,paramArr);

            var nonce = $scope.nonce;

            var GASPRICE = 20000000000;
            var GASLIMIT = 600000;

            var signRawObj = initEthSignRawContract(nonce, GASPRICE, GASLIMIT,PAIStandardTokenContractAddress,data);

            var signData = signEthTx($scope.currentPrivateKey, signRawObj);

            var obj = {};
            obj.crossType = crossType;
            obj.signData = signData;
            obj.funCode = APPROVE;
            obj.chainId = ethChainId;

            // var url = APIHost + "/sendRawTxCrossToken";
            var url = localhostHost + "/sendRawTxCrossToken";
            $http({
                method: 'POST',
                url: url,
                data: obj
            }).then(function successCallback(res) {
                $('#transaction').modal('hide');

                if (res.data.result == "success") {
                    swal("Success","Token swap is in progress, please check the status later, thank you","success");

                    var objt = {};
                    objt.chainId = ethChainId;
                    objt.funCode = APPROVE;
                    objt.preimage = 0;
                    objt.fromaddress = $scope.erc20account.address;
                    objt.toaddress = $scope.account.address;
                    objt.value = $scope.toAmount;
                    objt.ethContractId = 0;
                    objt.piContractId = 0;
                    objt.hash = res.data.hash;
                    objt.withdrawHelper = 0;
                    objt.withdrawHelperPriv = 0;
                    objt.status= STATUS_DEFAULT;
                    createErc20PiInfo(objt).then(function(aobj) {
                        if (aobj.result == "success") {
                            queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                $scope.transactionERC20List = robj.data;
                                $scope.$apply();
                            });
                        }
                    });

                    console.log("Approve Success!");

                } else {
                    $('#transaction').modal('hide');
                    showPopup("Approve Error!",res.message.toString(),5000);
                }
            }, function errorCallback(res) {
                $('#transaction').modal('hide');
                console.log(res);
                showPopup("Internet error, please refresh the page");
            });
        } catch (e) {
            $('#transaction').modal('hide');
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }


    $scope.sendTx = function() {
        try {

            var hashPair = newSecretHashPair();
            var hashlock = hashPair.hash;
            var preimage = hashPair.secret;

            var duration = 3600 * 4;
            var timelock = nowSeconds() + duration;

            // $scope.preimageAESEncrypt = AESEncrypt(hashPair.secret,$scope.currentPrivateKey);
            // console.log(hashPair.secret, "+" , $scope.currentPrivateKey,"preimageAESEncrypt==============",preimageAESEncrypt);
            // var gasPrice = $scope.gasPrice * Math.pow(10, 9);

            // var toAmount = $scope.toAmount;
            const toAmount = web3.toWei($scope.toAmount, "ether");

            // k,v
            var newPrivateKey = $scope.newPrivateKet();

            $scope.withdrawHelper = priToAddress(newPrivateKey);

            $scope.withdrawHelperPriv = newPrivateKey;

            console.log("withdrawHelperPriv ===============>>> ",$scope.withdrawHelperPriv, $scope.withdrawHelper )


            var paramArr = [company, $scope.account.address, $scope.withdrawHelper, hashlock, timelock, PAIStandardTokenContractAddress, toAmount];

            var data = $scope.getPlayLoad(newContractABIETH,NEWCONTRACT,paramArr);

            var nonce = $scope.nonce;

            var GASPRICE = 20000000000;
            var GASLIMIT = 800000;

            var signRawObj = initEthSignRawContract(nonce, GASPRICE, GASLIMIT,HashedTimelockERC20ContractAddress,data);

            var signData = signEthTx($scope.currentPrivateKey, signRawObj);

            // $scope.currentPrivateKey = "";

            var obj = {};
            obj.crossType = crossType;
            obj.signData = signData;
            obj.funCode = NEWCONTRACT;
            obj.chainId = ethChainId;

            loading();

            var url = localhostHost + "/sendRawTxCrossToken";
            // var url =  APIHost + "/sendRawTxCrossToken";
            $http({
                method: 'POST',
                url: url,
                data: obj
            }).then(function successCallback(res) {
                // $scope.getChildNonce();
                //swal("Success","Token swap is in progress, please check the status later, thank you","success");

                $('#transaction').modal('hide');

                if (res.data.result == "success" && res.data.hash != undefined) {
                    console.log("withdrawHelperPriv =============22==>>> ",$scope.withdrawHelperPriv, $scope.withdrawHelper )

                    var objt = {};
                    objt.chainId = ethChainId;
                    objt.funCode = NEWCONTRACT;
                    objt.preimage = preimage;
                    objt.fromaddress = $scope.erc20account.address;
                    objt.toaddress = $scope.account.address;
                    objt.value = $scope.toAmount;
                    objt.ethContractId = 0;
                    objt.piContractId = 0;
                    objt.hash = res.data.hash;
                    objt.withdrawHelper = $scope.withdrawHelper;
                    objt.withdrawHelperPriv = $scope.withdrawHelperPriv;
                    objt.status= STATUS_DEFAULT;
                    createErc20PiInfo(objt).then(function(aobj) {
                        if (aobj.result == "success") {
                            queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                $scope.transactionERC20List = robj.data;
                                $scope.$apply();
                            });
                        }
                    });
                } else {
                    var objt = {};
                    objt.chainId = ethChainId;
                    objt.funCode = NEWCONTRACT;
                    objt.preimage = preimage;
                    objt.fromaddress = $scope.erc20account.address;
                    objt.toaddress = $scope.account.address;
                    objt.value = $scope.toAmount;
                    objt.ethContractId = 0;
                    objt.piContractId = 0;
                    objt.hash = 0;
                    objt.withdrawHelper = $scope.withdrawHelper;
                    objt.withdrawHelperPriv = $scope.withdrawHelper;
                    objt.status= STATUS_FAIL;
                    createErc20PiInfo(objt).then(function(aobj) {
                        if (aobj.result == "success") {
                            queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                $scope.transactionERC20List = robj.data;
                                $scope.$apply();
                            });
                        }
                    });
                    $('#transaction').modal('hide');
                    //insufficient funds for gas * price + value
                    removeLoading();
                }

            }, function errorCallback(res) {
                console.log(res);
                $('#transaction').modal('hide');
                showPopup("Internet error, please refresh the page");
                removeLoading();
            });

            removeLoading();
        } catch (e) {
            console.log(e);
            $('#transaction').modal('hide');
            showPopup("Internet error, please refresh the page");
            removeLoading();
        }
    }

    $scope.newContractIdPI = function(ethContractIdHash,ethContractId) {
        try {

            $scope.ethContractIdHash = ethContractIdHash;
            $scope.ethContractId = ethContractId;

            var rawdata = {};
            rawdata.ethContractId = $scope.ethContractId;
            var objData = require('querystring').stringify(rawdata);
            $http({
                method: 'POST',
                url: wrul + "/newContractOnPchain?" + objData
            }).then(function successCallback(pres) {

                // console.log(pres.data.result, "-----newContractOnPchain--result------------", pres.data.piContractId);

                $scope.piContractId = pres.data.piContractId;

                if (pres.data.result == "success") {
                    var uobj = {};
                    uobj.hash = $scope.ethContractIdHash;
                    uobj.ethContractId = $scope.ethContractId;
                    uobj.piContractId = $scope.piContractId;
                    uobj.status = STATUS_SUCCESS2;
                    uobj.chainId = ethChainId;
                    updateErc20PiInfo(uobj).then(function(udata) {
                        if (udata.result == "success") {
                            console.log( "update data or withdraw");

                            $scope.withdraw($scope.ethContractIdHash,ethChainId);

                            queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(urdata) {
                                $scope.transactionERC20List = urdata.data;
                                $scope.$apply();
                            });
                        }
                    });
                } else {
                    var pobj = {};
                    pobj.hash = ethContractIdHash;
                    pobj.ethContractId = ethContractId;
                    pobj.piContractId = 0;
                    pobj.status = STATUS_FAIL;
                    pobj.chainId = ethChainId;
                    updateErc20PiInfo(pobj).then(function(pudata) {
                        if (pudata.result == "success") {
                            queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(ursdata) {
                                $scope.transactionERC20List = ursdata.data;
                                $scope.$apply();
                            });
                        }
                    });
                }
            });
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }

    $scope.sysNewContractIdPI = function(address,chainId,status) {
        try {
            if (address) {
                queryErc20PiStatusList(address,chainId,status).then(function(robj) {
                    if (robj.data.length > 0) {
                        console.log("sysNewContractIdPI : ",robj);

                        for (var i=0; i<robj.data.length; i++) {

                            var ethContractIdHash = robj.data[i].hash;

                            var ethContractId = robj.data[i].ethContractId;

                            $scope.newContractIdPI(ethContractIdHash,ethContractId);
                        }

                    } else {

                        console.log(" sysNewContractIdPI , There is currently no data that needs to be modified !");

                    }
                });
            } else {
                console.log(" address is not null !");
            }
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }

    //每隔1分钟执行
    var rule1 = new schedule.RecurrenceRule();
    var times = [];
    for(var i=1; i<60; i++){
        times.push(i);
    }
    rule1.minute = times;
    var b=0;
    schedule.scheduleJob(rule1, function(){
        b++;

        if ($scope.erc20account.address != undefined) {

            console.log(b, " : Task  sysReceipt : ", new Date().toLocaleString());

            $scope.sysReceiptETH($scope.erc20account.address,ethChainId,STATUS_DEFAULT);

            $scope.sysReceiptETH($scope.erc20account.address,ethChainId,STATUS_REFUND);

            $scope.sysReceiptPI($scope.erc20account.address,ethChainId,STATUS_SUCCESS);
            //
            // $scope.sysReceiptPI($scope.erc20account.address,ethChainId,STATUS_APPROVE);
            //
            $scope.sysReceiptPI($scope.erc20account.address,ethChainId,STATUS_WITHDRAW);

        }
    });

    $scope.sysReceiptETH = function(address,chainId,status) {
        try {
            if (address) {
                queryErc20PiStatusList(address,chainId,status).then(function(robj) {
                    if (robj.data.length > 0) {
                        console.log("sysReceipt : ",robj);

                        for (var i=0; i<robj.data.length; i++) {

                            var hash = robj.data[i].hash;

                            var funCode = robj.data[i].funCode;

                            var ethContractId = robj.data[i].ethContractId;

                            var piContractId = robj.data[i].piContractId;

                            var withdrawHash = robj.data[i].withdrawHash;

                            $scope.getReceipt(ethContractId,piContractId,hash,withdrawHash,funCode,chainId,status);
                        }

                    } else {

                        console.log("sysReceipt , There is currently no data that needs to be modified !");

                    }
                });
            } else {
                console.log("address is not null!");
            }
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }

    $scope.sysReceiptPI = function(address,chainId,status) {
        try {
            if (address) {
                queryErc20PiStatusList(address,chainId,status).then(function(robj) {
                    if (robj.data.length > 0) {


                        console.log("sysReceipt sysReceiptPI : ",robj);

                        for (var i=0; i<robj.data.length; i++) {

                            if (status == STATUS_SUCCESS && robj.data[i].ethContractId != undefined) {

                                $scope.newContractIdPI(robj.data[i].hash, robj.data[i].ethContractId);

                            } else {
                                var hash = robj.data[i].hash;

                                var funCode = robj.data[i].funCode;

                                var ethContractId = robj.data[i].ethContractId;

                                var piContractId = robj.data[i].piContractId;

                                var withdrawHash = robj.data[i].withdrawHash;

                                $scope.getReceipt(ethContractId,piContractId,hash,withdrawHash,funCode,chainId,status);
                            }
                        }
                    } else {
                        console.log("sysReceipt , There is currently no data that needs to be modified !");
                    }
                });
            } else {
                console.log("address is not null!");
            }
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }


    $scope.getReceipt = function(ethContractId,piContractId,hash,withdrawHash,funCode,chainId,status) {
        try {
            var object = {};

            if (status == STATUS_WITHDRAW) {
                object.signedTx = withdrawHash;
                object.funCode = WITHDRAW;
                object.chainId = piChainId;
            } else if (status == STATUS_REFUND) {
                object.signedTx = hash;
                object.funCode = REFUND;
                object.chainId = ethChainId;
            } else if (status == "0xa") {
                object.signedTx = hash;
                object.funCode = APPROVE;
                object.chainId = ethChainId;
            } else {
                object.signedTx = hash;
                object.funCode = funCode;
                object.chainId = ethChainId;
            }


            $scope.ethHash = hash;
            $scope.funCode = object.funCode;
            $scope.receiptChainId = object.chainId;

            object.ethContractId = ethContractId;
            object.piContractId = piContractId;

            console.log($scope.ethHash, object.funCode,$scope.receiptChainId, status , "-------------" );

            var url = localhostHost + "/getTransactionReceipt";
            // var url =  APIHost + "/getTransactionReceipt";
            $http({
                method: 'POST',
                url: url,
                data: object
            }).then(function successCallback(res) {

                console.log(res, "-------------------------");

                if (res.data.result == "success" && res.data.receipt.status == STATUS_SUCCESS) {

                    var obj = {};
                    if ($scope.funCode == APPROVE && $scope.receiptChainId == ethChainId) {
                        obj.ethContractId = ethContractId;
                        obj.piContractId = piContractId;
                        obj.status= STATUS_APPROVE;
                        $scope.transactionHash = res.data.receipt.transactionHash;

                    } else if ($scope.funCode == NEWCONTRACT && $scope.receiptChainId == ethChainId) {
                        $scope.ethContractId = res.data.receipt.logs[1].topics[1];
                        $scope.transactionHash = res.data.receipt.transactionHash;

                        obj.ethContractId = res.data.receipt.logs[1].topics[1];
                        obj.piContractId = piContractId;
                        obj.status= STATUS_SUCCESS;
                        $scope.status = STATUS_SUCCESS;
                    } else if ($scope.funCode == WITHDRAW && $scope.receiptChainId == piChainId) {
                        console.log("-------------------")
                        obj.ethContractId = ethContractId;
                        obj.piContractId = piContractId;
                        obj.withdrawHash = withdrawHash;
                        obj.status= E_FINISH;
                        $scope.status = E_FINISH;
                    } else if ($scope.funCode == REFUND && $scope.receiptChainId == ethChainId) {
                        obj.ethContractId = ethContractId;
                        obj.piContractId = piContractId;
                        obj.withdrawHash = withdrawHash;
                        obj.status= E_FAIL;
                        $scope.status = E_FAIL;
                    }
                    obj.chainId = ethChainId;
                    obj.hash = $scope.ethHash;

                    console.log(obj);

                    updateErc20PiInfo(obj).then(function(aobj) {


                        if (aobj.result == "success") {

                            if ($scope.funCode == APPROVE && $scope.receiptChainId == ethChainId) {

                                $scope.getErc20Nonce();

                                setTimeout(function() {
                                    queryToChainIdHash($scope.transactionHash,ethChainId).then(function(app) {

                                        // console.log(app);

                                        // if ($scope.allowance == 0 || $scope.amount >= $scope.toAmount) {
                                        //     $scope.sendTx();
                                        // }

                                        if (app.data.value) {
                                            $scope.toAmount = app.data.value;
                                            console.log($scope.toAmount);
                                            $scope.checkAllowance();

                                            queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                                $scope.transactionERC20List = robj.data;
                                                $scope.$apply();
                                            });
                                            // var eobj = {};
                                            // eobj.ethContractId = 0;
                                            // eobj.piContractId = 0;
                                            // eobj.chainId = ethChainId;
                                            // eobj.hash = app.data.hash;
                                            // eobj.status= "0xapp";
                                            // updateErc20PiInfo(eobj).then(function(errobj) {
                                            //     if (errobj.result == "success") {
                                            //
                                            //         $scope.toAmount = app.data.value;
                                            //         console.log($scope.toAmount);
                                            //
                                            //         $scope.checkAllowance();
                                            //
                                            //         queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                            //             $scope.transactionERC20List = robj.data;
                                            //             $scope.$apply();
                                            //         });
                                            //     }
                                            // });
                                        }
                                    });
                                },10000);
                            }else if ($scope.funCode == NEWCONTRACT && $scope.receiptChainId == ethChainId &&  $scope.status == STATUS_SUCCESS) {

                                $scope.newContractIdPI($scope.transactionHash, $scope.ethContractId);

                                queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                    $scope.transactionERC20List = robj.data;
                                    $scope.$apply();
                                });
                            }else {
                                console.log("--------------------queryErc20PiInfoTXList-------------------")

                                queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                    $scope.transactionERC20List = robj.data;
                                    $scope.$apply();
                                });
                            }

                        }
                    });
                } else {
                    if (res.data.receipt != undefined) {
                        var eobj = {};
                        eobj.ethContractId = ethContractId;
                        eobj.piContractId = piContractId;
                        eobj.chainId = $scope.receiptChainId;
                        eobj.hash = $scope.ethHash;
                        eobj.status= STATUS_FAIL;
                        updateErc20PiInfo(eobj).then(function(errobj) {
                            if (errobj.result == "success") {
                                queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(robj) {
                                    $scope.transactionERC20List = robj.data;
                                    $scope.$apply();
                                });
                            }
                        });
                    } else {
                        console.log("getReceipt , Current hash is not packaged in blocks ！");
                    }
                }
            }, function errorCallback(res) {
                console.log(res);
                showPopup("Internet error, please refresh the page");
            });
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }

    $scope.refund = function() {
        try {
            queryPrivateKey($scope.refundFrom).then(function(result) {

                if (result.result == "success") {

                    var accountPri = AESDecrypt(result.data.privateKey, $scope.inputPasswordRefundPI);

                    if (accountPri) {
                        $scope.currentPrivateKeyETH = accountPri;

                        var paramArr = [$scope.ethContractId];

                        var data = $scope.getPlayLoad(refundABI,REFUND,paramArr);

                        var nonce = $scope.refundFromNonce;

                        var GASPRICE = 2000000000;
                        var GASLIMIT = 600000;

                        var signRawObj = initEthSignRawContract(nonce, GASPRICE, GASLIMIT,HashedTimelockERC20ContractAddress,data);

                        var signData = signEthTx($scope.currentPrivateKeyETH, signRawObj);

                        $scope.currentPrivateKeyETH = "";

                        var obj = {};
                        obj.crossType = crossType;
                        obj.signData = signData;
                        obj.funCode = REFUND;
                        obj.chainId = ethChainId;

                        var wurl = localhostHost + "/sendRawTxCrossToken";
                        // var wurl = APIHost + "/sendRawTxCrossToken";
                        $http({
                            method: 'POST',
                            url: wurl,
                            data: obj
                        }).then(function successCallback(wres) {
                            showPopup("Token swap is in progress, Refund Success, thank you", 8000);

                            $('#enterPasswordRefundPI').modal('hide');

                            if (wres.data.result == "success") {
                                var uobj = {};
                                uobj.hash = $scope.refundHash;
                                uobj.ethContractId = 0;
                                uobj.piContractId = 0;
                                uobj.withdrawHash = 0;
                                uobj.status = STATUS_REFUND;
                                uobj.chainId = ethChainId;
                                updateErc20PiInfo(uobj).then(function(wdobj) {
                                    if (wdobj.result == "success") {
                                        queryErc20PiInfoTXList($scope.refundFrom,ethChainId).then(function(wddata) {
                                            $scope.transactionERC20List = wddata.data;
                                            $scope.$apply();
                                        });
                                    }
                                });
                            } else {
                                swal("Refund Error",wres.data.message.toString(),"error");
                            }
                        });
                    } else {
                        $('#enterPasswordPI').modal('hide');
                        swal("Query error");
                    }
                } else {

                    $('#enterPasswordPI').modal('hide');
                    swal("Query error");
                }
            }).catch(function(e) {
                $('#enterPasswordPI').modal('hide');
                swal("Query error");
            });
        } catch (e) {
            console.log(e);
            showPopup("Internet error, please refresh the page");
        }
    }

    $scope.withdraw = function(ethContractIdHash,chainId) {
        try {

            $scope.ethContractIdHash = ethContractIdHash;

            queryToChainIdHash($scope.ethContractIdHash,chainId).then(function(wddata) {

                if (wddata.result == "success") {

                    $scope.fromaddress = wddata.data.fromaddress;
                    $scope.ethContractId = wddata.data.ethContractId;
                    $scope.piContractId = wddata.data.piContractId;
                    $scope.preimage = wddata.data.preimage;
                    $scope.withdrawHelper = wddata.data.withdrawHelper;
                    $scope.withdrawHelperPriv = wddata.data.withdrawHelperPriv;
                    console.log("withdrawHelperPriv =============withdraw==>>> ",$scope.withdrawHelperPriv, $scope.withdrawHelper )

                    var wparamArr = [$scope.piContractId, $scope.preimage];

                    var wdata = $scope.getPlayLoad(withdrawABIPI,WITHDRAW,wparamArr);

                    var pnonce = 0;
                    if ($scope.childNonce != undefined) {
                        pnonce = $scope.childNonce;
                    }

                    var GASPRICE = 100000000000;
                    var GASLIMIT = 500000;

                    //toAddress, data, nonce, gasPrice, gasLimit, amount, chainId
                    var wsignRawObj = initSignRawContract(HashedTimelockContractAddress, wdata, pnonce, GASPRICE, GASLIMIT, 0, piChainId);

                    var wsignData = signTx($scope.withdrawHelperPriv, wsignRawObj);

                    $scope.withdrawHelperPriv = "";

                    var obj = {};
                    obj.crossType = crossType;
                    obj.signData = wsignData;
                    obj.funCode = WITHDRAW;
                    obj.chainId = piChainId;

                    var wurl = localhostHost + "/sendRawTxCrossToken";

                    // var wurl = APIHost + "/sendRawTxCrossToken";
                    $http({
                        method: 'POST',
                        url: wurl,
                        data: obj
                    }).then(function successCallback(wres) {
                        if (wres.data.result == "success") {
                            console.log("------success------wres-------", wres);
                            var uobj = {};
                            uobj.hash = $scope.ethContractIdHash;
                            uobj.ethContractId = $scope.ethContractId;
                            uobj.piContractId = $scope.piContractId;
                            uobj.status = STATUS_WITHDRAW;
                            uobj.chainId = ethChainId;
                            uobj.withdrawHash = wres.data.hash;
                            updateErc20PiInfo(uobj).then(function(wdobj) {
                                // console.log(wdobj, "----withdraw-----------------");
                                if (wdobj.result == "success") {
                                    queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(wsdata) {
                                        $scope.transactionERC20List = wsdata.data;
                                        $scope.$apply();
                                    });
                                }
                            });
                        } else {
                            var ueobj = {};
                            ueobj.hash = $scope.ethContractIdHash;
                            ueobj.ethContractId = $scope.ethContractId;
                            ueobj.piContractId = $scope.piContractId;
                            ueobj.status = STATUS_FAIL;
                            ueobj.chainId = ethChainId;
                            updateErc20PiInfo(ueobj).then(function(wdeobj) {
                                if (wdeobj.result == "success") {
                                    queryErc20PiInfoTXList($scope.erc20account.address,ethChainId).then(function(wddata) {
                                        $scope.transactionERC20List = wddata.data;
                                        $scope.$apply();
                                    });
                                }
                            });
                            swal("Withdraw Error",wres.data.message.toString(),"error");
                        }
                    });
                } else {
                    console.log("Query is null ！");
                }

            });
        } catch (e) {
            // console.log(e);
            // $('#enterPasswordPI').modal('hide');
            showPopup("Internet error, please refresh the page");
        }
    }

     // $scope.sendTx = function() {
     //
     //     try {
     //         const gasPrice = $scope.gasPrice * Math.pow(10, 9);
     //         const amount = web3.toWei($scope.toAmount, "ether");
     //         let paramArr = [swapAddr,amount];
     //         var data = $scope.getPlayLoad(transferABI,"transfer",paramArr);
     //         var nonce = $scope.nonce;
     //         var signRawObj = initEthSignRawContract(nonce, gasPrice, $scope.gasLimit,contractAddress,data);
     //         var signData = signEthTx($scope.currentPrivateKey, signRawObj);
     //         $scope.currentPrivateKey = "";
     //
     //         var obj = {};
     //         obj.piAddress = $scope.account.address;
     //         obj.erc20Address = $scope.erc20account.address;
     //         obj.toAmount = $scope.toAmount;
     //         obj.signData = signData;
     //         obj.nonce = nonce;
     //         console.log(obj);
     //
     //         loading();
     //
     //         // var url = APIHost + "/sendErc20Tx";
     //
     //         var url = "http://localhost:3038/tokenSwapContracts";
     //         $http({
     //             method: 'POST',
     //             url: url,
     //             data: obj
     //         }).then(function successCallback(res) {
     //
     //             console.log("-----------------------", res);
     //             removeLoading();
     //             if (res.data.result == "success") {
     //                 showPopup("Token swap is in progress, please check the balance later, thank you", 8000);
     //                 $('#transaction').modal('hide');
     //                 var hash = res.data.data;
     //                 var url = "https://etherscan.io/tx/" + hash;
     //                 var html = 'Transaction hash:' + hash;
     //                 successNotify(html);
     //                 shell.openExternal(url);
     //                 var objt = {};
     //                 objt.hash = hash;
     //                 objt.type = 10;
     //                 objt.fromaddress = $scope.erc20account.address;
     //                 objt.toaddress = $scope.account.address;
     //                 objt.value=$scope.toAmount;
     //                 createTokenSwapInfo(objt).then(function(aobj) {
     //                     if (aobj.result == "success") {
     //                         queryTransactionChildList($scope.erc20account.address, 10).then(function(robj) {
     //                             console.log(robj.data)
     //                             $scope.transactionList = robj.data;
     //                             $scope.$apply();
     //                         })
     //                     }
     //                 })
     //             } else {
     //                 $('#transaction').modal('hide');
     //                 showPopup(res.data.error,5000);
     //             }
     //
     //         }, function errorCallback(res) {
     //             console.log(res);
     //             showPopup("Internet error, please refresh the page");
     //         });
     //
     //     } catch (e) {
     //         console.log(e);
     //         showPopup(e.toString());
     //     }
     //
     // }

    $scope.openExternal = function(hash) {
        shell.openExternal("https://ropsten.etherscan.io/tx/"+hash);
    }


    $scope.openExternalIntro = function() {
        shell.openExternal("https://pchaindoc.readthedocs.io/en/latest/introduction/tokenswap.html");
    }
     $scope.cutWords = function(words) {
         let result = words;
         if (words !=null && words.length > 12) {
             result = words.substr(0, 6) + "..." + words.substr(-6, 6);
         }
         return result;
     }


     $scope.keystorePath = "";
     $scope.keystoreJson;

     $scope.selectKeystore = function(){
         ipcRenderer.send('open-keystore-file');
     }

     ipcRenderer.on('selected-keystore',(event,path,fileJson)=>{
         if(fileJson.address && (fileJson.crypto || fileJson.Crypto) && fileJson.id){
             $scope.keystorePath = path;
             $scope.keystoreJson = fileJson;
             $scope.keystoreJson.address = "0x"+$scope.keystoreJson.address;
         }else{
             $scope.keystorePath = "";
             $scope.keystoreJson = "";
             showPopup("Error","Incorrect Format Keystore","error");
         }
         $scope.$apply();
     })

     $scope.importKeystoreFile = function(){
         const eWallet = require('ethereumjs-wallet');
         try{
             const keystoreInstance = eWallet.fromV3($scope.keystoreJson,$scope.keystorePassword);
             let newPrivateKey = keystoreInstance.getPrivateKey().toString("hex");
             var enPri = AESEncrypt(newPrivateKey,$scope.keystorePassword);
             $scope.keystorePassword = "";

             importErc20Account(enPri,$scope.keystoreJson.address).then(function (resObj) {
                 if(resObj.result=="success"){
                     showPopup("Import Keystore Successfully",1000);
                     $('#importKeystore').modal('hide');
                     $scope.keystoreJson = "";
                     $scope.keystorePath = "";
                     var obj = {};
                     obj.address = priToAddress(newPrivateKey);
                     $scope.erc20accountList.push(obj);

                     if($scope.erc20accountList.length> 0){
                         $scope.erc20account = $scope.erc20accountList[$scope.erc20accountList.length-1];
                     }
                     if(resObj.data){
                         $scope.accountList.push(obj);

                         if($scope.accountList.length> 0){
                             $scope.account = $scope.accountList[$scope.accountList.length-1];
                         }
                     }
                     $scope.getBalance();
                 }else{
                     showPopup(resObj.error,1000);
                 }
             }).catch(function (e) {
                 showPopup(e.error,1000);
             })
         }catch(e){
             console.log(e);
             swal("Import Error",e.toString(),"error");
         }
     }


     $scope.importPrivateKey = function(){

         var newPrivateKey = $scope.newPrivate;

         var obj = {};

         obj.address = priToAddress(newPrivateKey);

         var enPri = AESEncrypt(newPrivateKey,$scope.password2);
         $scope.password2 = "";
         $scope.repeatPassword2 = "";
         $scope.newPrivate = "";
         newPrivateKey = "";

         importErc20Account(enPri,obj.address).then(function (resObj) {
             if(resObj.result=="success"){
                 showPopup("Import Successfully",1000);
                 $('#importAccount').modal('hide');

                 $scope.erc20accountList.push(obj);

                 if($scope.erc20accountList.length> 0){
                     $scope.erc20account = $scope.erc20accountList[$scope.erc20accountList.length-1];
                 }
                if(resObj.data){
                    $scope.accountList.push(obj);

                    if($scope.accountList.length> 0){
                        $scope.account = $scope.accountList[$scope.accountList.length-1];
                    }
                }

                 $scope.getBalance();
             }
         }).catch(function (e) {
             showPopup(e.error,2000);
             $('#importAccount').modal('hide');
             $scope.password2 = "";
             $scope.repeatPassword2 = "";
             $scope.newPrivate = "";
         })

     }

     $scope.newPrivateKet = function() {
         var newAccount = Accounts.new();
         return newAccount.unCryp.private;
     }

     $scope.add = function() {

         var newPrivateKey = $scope.newPrivateKet();

         var obj = {};

         obj.address = priToAddress(newPrivateKey);

         $scope.accountList.push(obj);
         var enPri = AESEncrypt(newPrivateKey, $scope.password);
         addAccount(enPri, obj.address).then(function(resObj) {
             if (resObj.result == "success") {
                 showPopup("Created successfully", 1000);
                 $('#newAccount').modal('hide')

                 if ($scope.accountList.length > 0) {
                     $scope.account = $scope.accountList[$scope.accountList.length - 1];
                 }
                 $scope.getBalance();
             }
         }).catch(function(e) {
             console.log(e, "error");
         })
     }

 });
 $(function() {
     menuActive(10);
 });
