const {shell} = require('electron');

angularApp.controller('myCtrl', function($scope, $http) {
    $scope.balance = 0;
    $scope.maxSendAmount = 0;
    $scope.bnbFee = 0.000375;

    $scope.getPlayLoad = function(abi, funName, paramArr) {
        var playLoadData = TxData(abi, funName, paramArr);
        return playLoadData;
    }

    $scope.accountList = new Array();

    $scope.pibnbaccountList = new Array();

    queryPiBnbAccountList().then(function(resObj) {
        $scope.pibnbaccountList = resObj.data;
        try {
            if ($scope.pibnbaccountList.length > 0) {
                $scope.pibnbaccount = $scope.pibnbaccountList[0];
                $scope.getBBNBalance();
            }
            if ($scope.pibnbaccountList.length == 0) {
                removePageLoader();
            }
        } catch (e) {
            console.log(e);
        }
    }).catch(function(e) {
        console.log(e, "error");
    })


    queryAccountList().then(function(resObj) {
        $scope.accountList = resObj.data;
        try {
            if ($scope.accountList.length > 0) {
                $scope.account = $scope.accountList[0];
                $scope.getBalance();
            }
            if ($scope.accountList.length == 0) {
                removePageLoader();
            }
        } catch (e) {
            console.log(e);
        }
    }).catch(function(e) {
        console.log(e, "error");
    })


    $scope.getBalance = function() {
        $scope.spin = "myIconSpin";
        var obj = {};
        obj.chainId = 0;
        obj.address = $scope.account.address;
        var url = APIHost + "/getBalance";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            $scope.spin = "";
            removePageLoader();
            if (res.data.result == "success") {
                $scope.balance = res.data.data;
            } else {
                showPopup(res.data.error, 3000);
            }

        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });

        queryTransactionChildList($scope.pibnbaccount.address, 12).then(function(robj) {
            $scope.transactionList = robj.data;
            $scope.$apply();
        });

        $scope.getBBNBalance();
    }

    $scope.getBBNBalance = function() {
        var address = $scope.pibnbaccount.address;
        getPIBNBBalance(address).then(function (result) {
            $scope.pibnbBalance=result;
            $scope.maxSendAmount=result;
            $scope.$apply();
        });
        queryTransactionChildList($scope.pibnbaccount.address, 12).then(function(robj) {
            $scope.transactionList = robj.data;
            $scope.$apply();
        });


    }

     $scope.currentPrivateKey = "";
     $scope.confirmPassword = function() {
         if ($scope.account == undefined) {
             swal("Please create a wallet address at first");
             return;
         }
         queryBNBPrivateKey($scope.pibnbaccount.address).then(function(result) {
             if (result.result == "success") {
                 var dePri = AESDecrypt(result.data.privateKey, $scope.inputPassword);
                 if (dePri) {
                     $scope.currentPrivateKey = dePri;
                     $scope.inputPassword = "";
                     $scope.$apply();
                     $('#enterPassword').modal('hide');
                     // $scope.submit();
                     $('#transaction').modal('show');

                 } else {
                     swal("Password error");
                 }
             } else {
                 swal("Password error");
             }
         }).catch(function(e) {
            console.log(e);
             swal("Password error");
         })

     };

    $scope.confirmBNBPassword = function() {
        if ($scope.account == undefined) {
            swal("Please create a PIBNB address at first");
            return;
        }
        queryBNBPrivateKey($scope.pibnbaccount.address).then(function(result) {
            if (result.result == "success") {
                var dePri = AESDecrypt(result.data.privateKey, $scope.inputPassword);
                if (dePri) {
                    console.log(dePri)
                    $scope.currentPrivateKey = dePri;
                    $scope.inputPassword = "";
                    $('#enterBNBPassword').modal('hide');
                    $('#exportPrivateKey').modal('show');
                    $scope.$apply();
                } else {
                    swal("Password error");
                }
            } else {
                swal("Password error");
            }
        }).catch(function(e) {
            console.log(e);
            swal("Password error");
        })

    };

    var clipboard3 = new Clipboard('.copyBtn3', {
        container: document.getElementById('exportPrivateKey')
    });

    clipboard3.on('success', function (e) {
        showNotification("alert-success", "Copy successfully", "bottom", "center", 1000);
        $('#exportPrivateKey').modal('hide');
    });

     $scope.selectAccount = function() {
         $scope.getBalance();
     }

     $scope.selectPIBNBAccount = function() {
         $scope.getBBNBalance();
     }


    $scope.enterPassword = function () {
            $('#enterBNBPassword').modal('show');
    }


    $scope.showEnterPwd = function() {
        if ($scope.maxSendAmount<(new BigNumber($scope.toAmount))) {
            let tips1 = "Insufficient Balance ";
            let tips2 = "Max Amount :" + $scope.maxSendAmount + " PIBNB";
            swal(tips1, tips2, "error");
        } else {
            $('#enterPassword').modal('show');
        }
    }



    $scope.transfer = async function(){
        const axios = require('axios');
        const BnbApiClient = require('@binance-chain/javascript-sdk');
        const httpClient = axios.create({ baseURL: APIBNB });
        const bnbclient = new BnbApiClient(APIBNB)
        await bnbclient.initChain();
        bnbclient.setPrivateKey($scope.currentPrivateKey)
        let addressFrom=$scope.pibnbaccount.address;
        let amount=$scope.toAmount;
        const sequenceURL = `${APIBNB}api/v1/account/${addressFrom}/sequence`
        loading();
        httpClient.get(sequenceURL).then((res) => {
            const sequence = res.data.sequence || 0
            console.log(addressFrom, swap_bnbpi_toAddress, amount, symbol, $scope.account.address, sequence)
             return bnbclient.transfer(addressFrom, swap_bnbpi_toAddress, amount, symbol, $scope.account.address, sequence)
        }).then((result) => {
            if (result.status === 200) {
                $scope.currentPrivateKey="";
                $('#transaction').modal('hide');
                $scope.sendTx(result.result[0].hash);
            } else {
                console.error('error', result);
                $scope.currentPrivateKey="";
                removeLoading();
                showPopup(result,5000);
            }
        }).catch((error) => {
            console.error('error', error);
            $scope.currentPrivateKey="";
            removeLoading();
            showPopup(error,5000);
        });
    }

    $scope.sendTx = function(hash) {
        try {
            var obj = {};
            obj.piAddress = $scope.account.address;
            obj.pibnbAddress = $scope.pibnbaccount.address;
            obj.toAmount = $scope.toAmount;
            obj.hash = hash;
            var url = APIHost + "/sendBnb2PITx";
            $http({
                method: 'POST',
                url: url,
                data: obj
            }).then(function successCallback(res) {
                console.log(res)
                removeLoading();
                if (res.data.result == "success") {
                    showPopup("Token swap is in progress, please check the balance later, thank you", 8000);
                    var url = "https://explorer.binance.org/tx/" + hash;
                    var html = 'Transaction hash:' + hash;
                    successNotify(html);
                    shell.openExternal(url);
                    var objt = {};
                    objt.hash = hash;
                    objt.type = 12;
                    objt.toaddress = $scope.account.address;
                    objt.fromaddress = $scope.pibnbaccount.address;
                    objt.value=$scope.toAmount;
                    createTokenSwapInfo(objt).then(function(aobj) {
                        if (aobj.result == "success") {
                            $scope.toAmount="";
                            $scope.getBalance();
                        }
                    })

                } else {
                    $('#transaction').modal('hide');
                    showPopup(res.data.error,5000);
                }

            }, function errorCallback(res) {
                console.log(res);
                showPopup("Internet error, please refresh the page");
            });

        } catch (e) {
            console.log(e);
            swal(e.toString());
        }

    }

    $scope.openExternalIntro = function() {
        shell.openExternal("https://pchaindoc.readthedocs.io/en/latest/introduction/pibnbtopi.html");
    }

    $scope.openExternal = function(hash) {
        shell.openExternal("https://explorer.binance.org/tx/"+hash);
    }

     $scope.cutWords = function(words) {
         let result = words;
         if (words !=null && words.length > 12) {
             result = words.substr(0, 6) + "..." + words.substr(-6, 6);
         }
         return result;
     }

    $scope.valueFormat = function(value) {
        let valueStr =new BigNumber(value).toString(10);
        return valueStr;
    }


     $scope.importPrivateKey = function(){

         var newPrivateKey = $scope.newPrivate;

         var obj = {};

         obj.address =crypto.getAddressFromPrivateKey(newPrivateKey, 'bnb');

         var enPri = AESEncrypt(newPrivateKey,$scope.password2);
         $scope.password2 = "";
         $scope.repeatPassword2 = "";
         $scope.newPrivate = "";
         newPrivateKey = "";

         $scope.pibnbaccountList.push(obj);
         addPIBNBAccount(enPri, obj.address).then(function(resObj) {
             if (resObj.result == "success") {
                 showPopup("Import successfully", 1000);
                 $('#importAccount').modal('hide')
                 if ($scope.pibnbaccountList.length > 0) {
                     $scope.pibnbaccount = $scope.pibnbaccountList[$scope.pibnbaccountList.length - 1];
                     $scope.$apply();
                 }
                 $scope.getBBNBalance();
             }
         }).catch(function(e) {
             console.log(e, "error");
         })

     }

     $scope.newBNBAccount = function(){
         $scope.walletSeed=crypto.generateMnemonic();
         $('#newAccount').modal('show');
     }

    $scope.importWalletSeed = function(){
        $scope.walletSeed='';
        $('#ImportWalletSeed').modal('show');
    }

     $scope.add = function() {
         try {
             var mnemonicTo = $scope.walletSeed;
             var newPrivateKey = crypto.getPrivateKeyFromMnemonic(mnemonicTo);
             var address = crypto.getAddressFromPrivateKey(newPrivateKey, 'bnb') //bnb for mainnet,tbnb for testnet the default prefix is tbnb
             var enPri = AESEncrypt(newPrivateKey, $scope.password);
             var obj = {};
             obj.address = address;
             newPrivateKey = "";
             $scope.password = "";
             $scope.walletSeed ="";
             $scope.pibnbaccountList.push(obj);
             addPIBNBAccount(enPri, address).then(function (resObj) {
                 if (resObj.result == "success") {
                     showPopup("Created successfully", 1000);
                     $('#newAccount').modal('hide');
                     $('#ImportWalletSeed').modal('hide')
                     if ($scope.pibnbaccountList.length > 0) {
                         $scope.pibnbaccount = $scope.pibnbaccountList[$scope.pibnbaccountList.length - 1];
                         $scope.$apply();
                     }
                     $scope.getBBNBalance();
                 }
             }).catch(function (e) {
                 console.log(e, "error");
             })
         }catch(e){
             console.log(e);
             swal("Import Error",e.toString(),"error");
         }
     }

 });
 $(function() {
     menuActive(10);
 });
