 angularApp.controller('myCtrl', function($scope, $http) { 
     $scope.gasPrice = 10;
     $scope.balance = 0;
     $scope.minValidators = 1;
     $scope.minDepositAmount = 100000;

     let web3Util = new Web3();     

     $scope.accountList = new Array();

    $scope.fullBalance; 
    $scope.getBalance = function(){
        $scope.spin = "myIconSpin";
        web3Util.eth.getFullBalance($scope.account,(err,result)=>{
            console.log(err,result);
            if(!err){
                $scope.spin = "";
                $scope.fullBalance = result;
                $scope.balance = web3Util.fromWei($scope.fullBalance.balance,"ether");
                $scope.$apply();
            }else{
                swal({title:"RPC Error",text:err.toString(),icon:"error"});
            }
        })
     }

    $scope.weiToPi = function(b){
        return web3Util.fromWei(b,"ether");
    }

    $scope.getAccountList = function(){
        web3Util.eth.getAccounts((err,result)=>{
            if(!err){
                $scope.accountList = result;
                if(result.length > 0){
                    $scope.account = $scope.accountList[0];  
                    $scope.getBalance();

                    queryTransactionDevList($scope.account,6).then(function(robj) {
                        console.log(robj)
                        $scope.candidateList = robj.data;
                        $scope.$apply();
                    })
                }
                $scope.$apply();
            }
        })
     }

     $scope.initWeb3 = function(){
         removePageLoader();
         try{
             queryRpcUrl().then(function (data) {
                 if(data.result=="success" && data.data.length>0){
                     web3Util.setProvider(new web3Util.providers.HttpProvider(data.data[0].url));
                     if(web3Util.isConnected()){
                         console.log("connected");
                         $scope.getAccountList();
                     }else{
                         console.log("not connected");
                         swal({title:"RPC Connect Error",text:"Not possible to connect to the RPC provider. Make sure the provider is running and a connection is open.",icon:"error",button:"Go To Set RPC"}).then((v)=>{
                             window.location.href = "accountDev.html";
                         })
                     }
                 }else{
                     console.log("not connected");
                     swal({title:"RPC Connect Error",text:"Not possible to connect to the RPC provider. Make sure the provider is running and a connection is open.",icon:"error",button:"Go To Set RPC"}).then((v)=>{
                         window.location.href = "accountDev.html";
                     })
                 }
             })
         }catch(e){
             console.log(e);
         }

     }

     $scope.initWeb3();

     $scope.selectAccount = function(){
        $scope.getBalance();
     }

 });
 $(function() {
     menuActive(7);
 });