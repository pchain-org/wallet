 angularApp.controller('myCtrl', function($scope, $http) {

    var web3 = new Web3();
     $scope.gasLimit = 21000;
     $scope.gasPrice = 10;
     $scope.nonce = 0;
     $scope.balance = 0;
     $scope.maxSendAmount = 0;


     queryCancelDelegateList($scope.account,7).then(function(robj) {
         console.log(robj)
         let DefaultDelegatedListOption = {"address":"CUSTOM"};
         let delegatedList = robj.data;
         $scope.delegatedList = _.concat(DefaultDelegatedListOption,delegatedList);
         $scope.currentCandidate = DefaultDelegatedListOption;
         $scope.$apply();
     })

     $scope.selectCandidate = function(){
        if($scope.currentCandidate != DefaultDelegatedListOption){
            $scope.cancleCandidate = $scope.currentCandidate.address;
            $scope.cancleAmount = $scope.currentCandidate.amount;
        }else{
            $scope.cancleCandidate = "";
            $scope.cancleAmount = 0;
        }
     }

     $scope.showAddData = function() {
         $scope.addDataFlag = true;
     }

     $scope.fullBalance;
     $scope.getBalance = function() {
         $scope.spin = "myIconSpin";
         var obj = {};
         obj.chainId = $scope.chain.id;
         obj.address = $scope.account.address;
         var url = APIHost + "/getFullBalance";
         $http({
             method: 'POST',
             url: url,
             data: obj
         }).then(function successCallback(res) {
             $scope.spin = "";
             removePageLoader();
             if (res.data.result == "success") {
                console.log(res);
                $scope.fullBalance = res.data.data;
                 $scope.balance = web3.fromWei($scope.fullBalance.balance,'ether');
                 $scope.delegateBalance = web3.fromWei($scope.fullBalance.delegateBalance,'ether');
                 $scope.getMaxSendAmount();
             } else {
                 showPopup(res.data.error, 3000);
             }

         }, function errorCallback(res) {
             showPopup("Internet error, please refresh the page");
         });

         queryTransactionDelegateList($scope.account,7).then(function(robj) {
             console.log(robj)
             $scope.delegateList2 = robj.data;
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

     $scope.delegateType;
     $scope.showEnterPwd = function(type) {
        $scope.delegateType = type;
         $scope.getMaxSendAmount();
         if ($scope.maxSendAmount < $scope.toAmount) {
             let tips1 = "Insufficient Balance ";
             let tips2 = "Max Amount :" + $scope.maxSendAmount + " PAI"
             swal(tips1, tips2, "error");
         } else {
             $('#enterPassword').modal('show');
         }
     }

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

    $scope.getPlayLoad = function(abi, funName, paramArr) {
            var payloadData = TxData(abi, funName, paramArr);
            return payloadData;
    }

     $scope.sendTx = function() {

         try {
             const gasPrice = $scope.gasPrice * Math.pow(10, 9);
             let amount;           
             var nonce = $scope.nonce;
             var funcData;
             var signRawObj;
             if($scope.delegateType == 0){
                 //delegate
                 // amount = web3.toWei($scope.toAmount, "ether");
                  amount= "0x"+decimalToHex(web3.toWei($scope.toAmount,'ether'));

                funcData = $scope.getPlayLoad(DelegateABI, "Delegate", [$scope.toAddress]);
                signRawObj = initSignBuildInContract(funcData, nonce, gasPrice, $scope.gasLimit, $scope.chain.chainId,amount);
                console.log(funcData)
                 console.log(signRawObj)
             }else if($scope.delegateType == 1){  
                //cancle delegate
                // amount = web3.toWei($scope.cancleAmount, "ether");
                 amount= "0x"+decimalToHex(web3.toWei($scope.cancleAmount,'ether'));
                funcData = $scope.getPlayLoad(DelegateABI, "CancelDelegate", [$scope.cancleCandidate,amount]);
                amount = 0;
                signRawObj = initSignBuildInContract(funcData, nonce, gasPrice, $scope.gasLimit, $scope.chain.chainId,amount);
             }
             // console.log(signRawObj)

             var signData = signTx($scope.currentPrivateKey, signRawObj);

             var obj = {};
             obj.chainId = $scope.chain.id;
             obj.signData = signData;
             // console.log(obj)
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

                     if($scope.delegateType == 0){
                         objt.hash = hash;
                         objt.fromaddress = $scope.account;
                         objt.toaddress = $scope.toAddress;
                         objt.status=0;
                         console.log(objt)
                     }else if($scope.delegateType == 1){
                         objt.hash = hash;
                         objt.fromaddress = $scope.account;
                         objt.toaddress = $scope.cancleCandidate;
                         objt.status=1;
                         console.log(objt)
                     }
                     createDelegate(objt).then(function(aobj) {
                         console.log(aobj)
                         if (aobj.result == "success") {
                             queryTransactionDelegateList($scope.account,7).then(function(robj) {
                                 console.log(robj)
                                 $scope.delegateList2 = robj.data;
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
     menuActive(5);
 });