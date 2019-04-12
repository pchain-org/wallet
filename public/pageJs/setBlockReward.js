 angularApp.controller('myCtrl', function($scope, $http) {


     $scope.gasLimit = 21000;
     $scope.gasPrice = 10;
     $scope.nonce = 0;
     $scope.balance = 0;
     $scope.toAmount = 0;

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
             } else {
                 showPopup(res.data.error, 3000);
             }

         }, function errorCallback(res) {
             showPopup("Internet error, please refresh the page");
         });

         queryTransactionChildList($scope.account.address, 9).then(function(robj) {
             $scope.transactionList = robj.data;
             $scope.$apply();
         })
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

     queryChainList().then(function(resData) {
         for (var i = 0; i < resData.data.length; i++) {
             var obj = {};
             obj.name = resData.data[i].chainName;
             obj.id = resData.data[i].id;
             obj.chainId = resData.data[i].chainId;
             $scope.chainList.push(obj);
             if(i == 0)
                $scope.chain = obj;
         }
         console.log($scope.chain);
         $scope.$apply();
     }).catch(function(e) {
         console.log(e, "queryChainList error.");
     });

     $scope.accountList = new Array();

     queryAccountList().then(function(resObj) {
         $scope.accountList = resObj.data;
         try {
             if ($scope.accountList.length > 0) {
                 $scope.account = $scope.accountList[0];
                 $scope.getBalance();
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
            console.log(e);
             swal("Password error");
         })

     };

     $scope.selectAccount = function() {
         $scope.getNonce();
         $scope.getBalance();
     }

     $scope.showEnterPwd = function() {
        $('#blockRewardModal').modal('hide');
        $('#enterPassword').modal('show');
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
         let rewardAmount = web3.toWei($scope.rewardAmount,"ether"); 
         let paramArr = [$scope.chain.chainId,rewardAmount];
         $scope.data = $scope.getPlayLoad(ChainABI,"SetBlockReward",paramArr);
         console.log(paramArr,$scope.data);
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
             var signRawObj = initSignBuildInContract($scope.data, nonce, gasPrice, $scope.gasLimit,$scope.chain.chainId, amount);

             var signData = signTx($scope.currentPrivateKey, signRawObj);
             $scope.currentPrivateKey = "";

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
                     var url = "index.html?key=" + hash + "&chain=" + $scope.chain.id;
                     var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                     successNotify(html);
                     var objt = {};
                     objt.hash = hash;
                     objt.fromaddress = $scope.account.address;
                     objt.chainName = $scope.chain.chainId;
                     objt.value=$scope.rewardAmount;
                     console.log(objt)
                     addSetBlockReward(objt).then(function(aobj) {
                         if (aobj.result == "success") {
                             queryTransactionChildList($scope.account.address, 9).then(function(robj) {
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
     menuActive(8);
 });