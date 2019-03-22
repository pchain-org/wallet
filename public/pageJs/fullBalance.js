 angularApp.controller('myCtrl', function($scope, $http) {

     var web3 = new Web3();
     $scope.gasLimit = 21000;
     $scope.gasPrice = 10;
     $scope.balance = 0;


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
             console.log(res);
             if (res.data.result == "success") {
                 $scope.fullBalance = res.data.data;
                 $scope.balance = web3.fromWei($scope.fullBalance.balance,'ether');
             } else {
                 showPopup(res.data.error, 3000);
             }

         }, function errorCallback(res) {
             showPopup("Internet error, please refresh the page");
         });
     }

    $scope.weiToPi = function(b){
        return web3.fromWei(b,"ether");
    }

     //chain list

     $scope.chainList = new Array();
     $scope.chainList = [
         // { name: "Main Chain", id: 0, chainId: "pchain"
         { name: "Main Chain", id: 0, chainId: "testnet" }
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

     $scope.selectAccount = function() {
         $scope.getBalance();
     }

 });
 $(function() {
     menuActive(6);
 });