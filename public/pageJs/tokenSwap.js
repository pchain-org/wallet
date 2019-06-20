var Accounts = new Accounts();
const {ipcRenderer} = require('electron');
const {shell} = require('electron');


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
         var callObj = { to: contractAddress, data: funcData };
         var obj = {};
         obj.callObj = callObj;
         var url = APIHost + "/getErc20Balance";
         $http({
             method: 'POST',
             url: url,
             data: obj
         }).then(function successCallback(res) {
             console.log(res)
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

         queryTransactionChildList($scope.erc20account.address, 10).then(function(robj) {
             console.log(robj)
             $scope.transactionList = robj.data;
             $scope.$apply();
         })
     }

    $scope.getMaxSendAmount = function() {
        let b = new BigNumber($scope.balance);
        $scope.maxSendAmount = b.decimalPlaces(18);
    }


     $scope.nonceFlag = true;
     $scope.getNonce = function() {
         $scope.nonceFlag = false;
         var obj = {};
         obj.address = $scope.erc20account.address;
         //console.log(obj);
         var url = APIHost + "/getErc20Nonce";
         $http({
             method: 'POST',
             url: url,
             data: obj
         }).then(function successCallback(res) {
             console.log(res);
             if (res.data.result == "success") {
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
     })


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
     })



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
         })

     };

     $scope.selectAccount = function() {
         // $scope.getNonce();
         // $scope.getBalance();
     }

     $scope.selectErc20Account = function() {
         $scope.getNonce();
         $scope.getBalance();
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

    $scope.getPlayLoad = function(abi, funName, paramArr) {
        var playLoadData = TxData(abi, funName, paramArr);
        return playLoadData;
    }


     var web3 = new Web3();
     $scope.submit = function() {
         $scope.getNonce();
         var txFee = $scope.gasLimit * $scope.gasPrice * Math.pow(10, 9);
         $scope.txFee = web3.fromWei(txFee, 'ether');
         $('#transaction').modal('show');
     }

     
     $scope.gasChanged = function() {
         $scope.gasPrice = jQuery("#gasPrice").val();

     }
     $scope.sendTx = function() {

         try {
             const gasPrice = $scope.gasPrice * Math.pow(10, 9);
             // console.log("gasPrice"+gasPrice)
             const amount = web3.toWei($scope.toAmount, "ether");
             // console.log("amount"+amount)
             let paramArr = [swapAddr,amount];
             // console.log("paramArr"+paramArr)
             var data = $scope.getPlayLoad(transferABI,"transfer",paramArr);
             // console.log("data"+data)
             var nonce = $scope.nonce;
             var signRawObj = initEthSignRawContract(nonce, gasPrice, $scope.gasLimit,contractAddress,data);
             // console.log(signRawObj)
             var signData = signEthTx($scope.currentPrivateKey, signRawObj);
             // console.log("signData"+signData)
             $scope.currentPrivateKey = "";

             var obj = {};
             obj.piAddress = $scope.account.address;
             obj.erc20Address = $scope.erc20account.address;
             obj.toAmount = $scope.toAmount;
             obj.signData = signData;
             obj.nonce = nonce;
             console.log(obj)

             loading();
             var url = APIHost + "/sendErc20Tx";
             $http({
                 method: 'POST',
                 url: url,
                 data: obj
             }).then(function successCallback(res) {
                 console.log(res)
                 removeLoading();
                 if (res.data.result == "success") {
                     $('#transaction').modal('hide');
                     showPopup("Token swap is in progress, please check the balance later, thank you", 5000);
                     var hash = res.data.data;
                     var url = "https://etherscan.io/tx/" + hash;
                     var html = 'Transaction hash:' + hash;
                     successNotify(html);
                     shell.openExternal(url);
                     var objt = {};
                     objt.hash = hash;
                     objt.fromaddress = $scope.erc20account.address;
                     objt.toaddress = $scope.account.address;
                     objt.value=$scope.toAmount;
                     createTokenSwapInfo(objt).then(function(aobj) {
                         if (aobj.result == "success") {
                             queryTransactionChildList($scope.erc20account.address, 10).then(function(robj) {
                                 console.log(robj.data)
                                 $scope.transactionList = robj.data;
                                 $scope.$apply();
                             })
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
             showPopup(e.toString());
         }

     }

    $scope.openExternal = function(hash) {
        shell.openExternal("https://etherscan.io/tx/"+hash);
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
         if(fileJson.address && fileJson.crypto && fileJson.id){
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