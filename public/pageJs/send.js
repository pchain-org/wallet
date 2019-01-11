 angularApp.controller('myCtrl', function($scope, $http) {


     $scope.gasLimit = 21000;
     $scope.gasPrice = 10;
     $scope.nonce = 0;
     $scope.balance = 0;
     $scope.maxSendAmount = 0;

     $scope.showAddData = function() {
         $scope.addDataFlag = true;
     }
     $scope.getBalance = function() {
         $scope.spin = "myIconSpin";
         var obj = {};
         obj.chainId = $scope.chain.id;
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

         queryTransactionList($scope.account.address, $scope.chain.id).then(function(robj) {
             $scope.transactionList = robj.data;
             $scope.$apply();
         })
     }

     $scope.getMaxSendAmount = function() {
         let b = new BigNumber($scope.balance);
         let gl = new BigNumber($scope.gasLimit);
         let fee = gl.times($scope.gasPrice * Math.pow(10, 9)).dividedBy(Math.pow(10, 18));
         if(b.gt(fee)){
            $scope.maxSendAmount = b.minus(fee).decimalPlaces(18);
         }else{
            $scope.maxSendAmount = 0;
         }
     }

     $scope.nonceFlag = true;
     $scope.getNonce = function() {
         $scope.nonceFlag = false;
         var obj = {};
         obj.chainId = $scope.chain.id;
         obj.address = $scope.account.address;
         //console.log(obj);
         var url = APIHost + "/getNonce";
         $http({
             method: 'POST',
             url: url,
             data: obj
         }).then(function successCallback(res) {
             //console.log(res);
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
     //chain list

     $scope.chainList = new Array();
     $scope.chainList = [
         { name: "Main Chain", id: 0, chainId: "pchain" }
     ];

     $scope.chain = $scope.chainList[0]

     queryChainList().then(function(resData) {
         for (var i = 0; i < resData.data.length; i++) {
             var obj = {};
             obj.name = resData.data[i].chainName;
             obj.id = resData.data[i].id;
             obj.chainId = resData.data[i].chainId;
             $scope.chainList.push(obj);
             $scope.chain = $scope.chainList[0];
         }
     }).catch(function(e) {
         console.log(e, "queryChainList error.");
     });

     $scope.crossChain = 1;

     $scope.accountList = new Array();

     queryAccountList().then(function(resObj) {
         $scope.accountList = resObj.data;
         try {
             if ($scope.accountList.length > 0) {
                 $scope.account = $scope.accountList[0];
                 $scope.getBalance();
                 queryTransactionList($scope.account.address, $scope.chain.id).then(function(robj) {
                     $scope.transactionList = new Array();
                     $scope.transactionList = robj.data;
                 })
             }
             if ($scope.accountList.length == 0) {
                 removePageLoader();
                 window.location.href = "wallet.html";
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

             swal("Password error");
         })

     };

     $scope.selectAccount = function() {
         $scope.getNonce();
         $scope.getBalance();
     }

     $scope.showEnterPwd = function() {
         $scope.getMaxSendAmount();
         console.log($scope.maxSendAmount, $scope.toAmount);

         if ($scope.maxSendAmount < $scope.toAmount) {
             let tips1 = "Insufficient Balance ";
             let tips2 = "Max Amount :" + $scope.maxSendAmount + " PAI"
             swal(tips1, tips2, "error");
         } else {
             $('#enterPassword').modal('show');
         }
     }

     var web3 = new Web3();
     var toAmountValue;
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
             // const gasPrice = 20*Math.pow(10,9);

             const amount = web3.toWei($scope.toAmount, "ether");
             // const amount = web3.toWei(toAmountValue,"ether");            

             var nonce = $scope.nonce;
             var signRawObj = initSignRawPAI($scope.toAddress, amount, nonce, gasPrice, $scope.gasLimit, $scope.chain.chainId);

             if ($scope.data) signRawObj.data = $scope.data;

             var signData = signTx($scope.currentPrivateKey, signRawObj);

             var obj = {};
             obj.chainId = $scope.chain.id;
             obj.signData = signData;
             loading();
             var url = APIHost + "/sendTx";
             $http({
                 method: 'POST',
                 url: url,
                 data: obj
             }).then(function successCallback(res) {
                 removeLoading();
                 if (res.data.result == "success") {
                     $('#transaction').modal('hide');
                     var hash = res.data.data;
                     var url = "index.html?key=" + hash + "&chain=" + $scope.chain;
                     var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                     successNotify(html);
                     var objt = {};
                     objt.hash = hash;
                     objt.nonce = nonce;
                     objt.fromaddress = $scope.account.address;
                     objt.toaddress = $scope.toAddress;
                     objt.value = $scope.toAmount;
                     objt.gas = $scope.gasLimit;
                     objt.gasPrice = gasPrice;
                     objt.chainId = $scope.chain.id;
                     objt.data = $scope.data;
                     objt.chainName = $scope.chain.name;
                     addTransaction(objt).then(function(aobj) {
                         if (aobj.result == "success") {
                             queryTransactionList($scope.account.address, $scope.chain.id).then(function(robj) {
                                 $scope.transactionList = robj.data;
                                 $scope.$apply();
                             })
                         }
                     })
                 } else {
                     swal(res.data.error);
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

     $scope.cutWords = function(words) {
         let result = words;
         if (words.length > 12) {
             result = words.substr(0, 6) + "..." + words.substr(-6, 6);
         }
         return result;
     }

 });
 $(function() {
     menuActive(3);
 });