const {shell} = require('electron');

angularApp.controller('myCtrl', function($scope, $http) {
     $scope.gasLimit = 42000;
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
                $scope.getMaxSendAmount();
            } else {
                showPopup(res.data.error, 3000);
            }

        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });

        queryTransactionChildList($scope.account.address, 11).then(function(robj) {
            $scope.transactionList = robj.data;
            $scope.$apply();
        });

        $scope.getBBNBalance();
    }

    $scope.getBBNBalance = function() {
        var address = $scope.pibnbaccount.address;
        getPIBNBBalance(address).then(function (result) {
            $scope.pibnbBalance=result;
            $scope.$apply();
        });


    }


    $scope.getMaxSendAmount = function() {
        let b = new BigNumber($scope.balance);
        let gl = new BigNumber($scope.gasLimit);
        let fee = gl.times($scope.gasPrice * Math.pow(10, 9)).dividedBy(Math.pow(10, 18));
        if (b.gt(fee)) {
            $scope.maxSendAmount = b.minus(fee).decimalPlaces(18);
        } else {
            $scope.maxSendAmount = new BigNumber(0);
        }
    }


    $scope.nonceFlag = true;
    $scope.getNonce = function() {
        $scope.nonceFlag = false;
        var obj = {};
        obj.chainId = 0;
        obj.address = $scope.account.address;
        var url = APIHost + "/getNonce";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            if (res.data.result == "success") {
                $scope.nonce = Number(res.data.data);
                $scope.nonceFlag = true;
            } else {
                showPopup(res.data.message, 3000);
            }

        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });


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



     $scope.currentPrivateKey = "";
     $scope.confirmPassword = function() {
         if ($scope.account == undefined) {
             swal("Please create a wallet address at first");
             return;
         }
         queryPrivateKey($scope.account.address).then(function(result) {
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
         $scope.getNonce();
         $scope.getBalance();
     }

     $scope.selectPIBNBAccount = function() {
         $scope.getBBNBalance();
     }


    $scope.enterPassword = function () {
            $('#enterBNBPassword').modal('show');
    }


    $scope.showEnterPwd = function() {
        $scope.getMaxSendAmount();
        if ($scope.maxSendAmount.lt(new BigNumber($scope.toAmount))) {
            let tips1 = "Insufficient Balance ";
            let tips2 = "Max Amount :" + $scope.maxSendAmount + " PI"
            swal(tips1, tips2, "error");
        } else {
            $('#enterPassword').modal('show');
        }
    }



     var web3 = new Web3();
     $scope.submit = function() {
         $scope.getNonce();
         var txFee = $scope.gasLimit * $scope.gasPrice * Math.pow(10, 9);
         $scope.txFee = web3.fromWei(txFee, 'ether');
         $scope.data='PI to PIBNB';
         $('#transaction').modal('show');
     }

     
     $scope.gasChanged = function() {
         $scope.gasPrice = jQuery("#gasPrice").val();

     }

    $scope.sendTx = function() {
        try {
            const gasPrice = $scope.gasPrice * Math.pow(10, 9);
            const amount = web3.toWei($scope.toAmount, "ether");
            var nonce = $scope.nonce;

            var signRawObj = initSignRawPAI(swap_pibnb_toAddress, amount, nonce, gasPrice, $scope.gasLimit, 'pchain');
            if ($scope.data) signRawObj.data = $scope.data;
            var signData = signTx($scope.currentPrivateKey, signRawObj);
            $scope.currentPrivateKey = "";

            var obj = {};
            obj.piAddress = $scope.account.address;
            obj.pibnbAddress = $scope.pibnbaccount.address;
            obj.toAmount = $scope.toAmount;
            obj.signData = signData;
            obj.nonce = nonce;

            loading();
            var url = APIHost + "/sendBnbTx";
            $http({
                method: 'POST',
                url: url,
                data: obj
            }).then(function successCallback(res) {
                removeLoading();
                if (res.data.result == "success") {
                    $('#transaction').modal('hide');
                    var hash = res.data.data;
                    var url = "index.html?key=" + hash + "&chain=0";
                    var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                    successNotify(html);
                    var objt = {};
                    objt.hash = hash;
                    objt.type = 11;
                    objt.toaddress = $scope.pibnbaccount.address;
                    objt.fromaddress = $scope.account.address;
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
        shell.openExternal("https://pchaindoc.readthedocs.io/en/latest/introduction/pitopibnb.html");
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



    var clipboard = new Clipboard('.copyBtn', {
        container: document.getElementById('newAccount')
    });


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