 angularApp.controller('myCtrl', function($scope, $http) { 
     $scope.gasPrice = 10;
     $scope.balance = 0;
     $scope.minValidators = 1;
     $scope.minDepositAmount = 100000;

     let web3Util = new Web3();     

     $scope.accountList = new Array();

     // $scope.RPCUrl = "http://54.189.122.88:6969/pchain";

    $scope.getBalance = function(){
        $scope.spin = "myIconSpin";
        web3Util.eth.getBalance($scope.account,(err,result)=>{
            console.log(err,result);
            if(!err){
                $scope.spin = "";
                $scope.balance = web3Util.fromWei(result,"ether");
                $scope.$apply();
            }else{
                swal({title:"RPC Error",text:err.toString(),icon:"error"});
            }
        })
     }

    $scope.getAccountList = function(){
        web3Util.eth.getAccounts((err,result)=>{
            if(!err){
                $scope.accountList = result;
                if(result.length > 0){
                    $scope.account = $scope.accountList[0];  
                    $scope.getBalance();

                    queryTransactionDevList($scope.account,3).then(function(robj) {
                        console.log(robj)
                        $scope.childChainList = robj.data;
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

     $scope.createChildChain = function(){
         let minValidators= "0x"+decimalToHex($scope.minValidators);
         let minDepositAmount= "0x"+decimalToHex(web3Util.toWei($scope.minDepositAmount,'ether'));
         let startBlock= "0x"+decimalToHex($scope.startBlock);
         let endBlock= "0x"+decimalToHex($scope.endBlock);
         let gas="0x"+decimalToHex(42000);
         let gasPrice ="0x"+decimalToHex( $scope.gasPrice*Math.pow(10,9));
        web3Util.chain.createChildChain($scope.account,$scope.newChainId,minValidators,minDepositAmount,startBlock,endBlock,gas,gasPrice,(err,result)=>{
            if(!err){
                jQuery("#createChainModal").modal("hide");
                swal({title:"createChildChain",text:result,icon:"success"});
                var hash = result;
                // var url = "search.html?key=" + hash;
                // var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                // successNotify(html);
                var objt = {};
                objt.hash = hash;
                objt.fromaddress = $scope.account;
                objt.chainName = $scope.newChainId;
                objt.status=0;
                createChildChain(objt).then(function(aobj) {
                    if (aobj.result == "success") {
                        queryTransactionDevList($scope.account,3).then(function(robj) {
                            $scope.childChainList = robj.data;
                            $scope.$apply();
                        })
                    }
                })

            }else{
                let error = err.toString();
                swal({title:"Error",text:error,icon:"error"});
            }

        })

     }


     $scope.joinChildChain = function(){
         // let depositAmount= "0x"+decimalToHex($scope.depositAmount);
         let depositAmount= "0x"+decimalToHex(web3Util.toWei($scope.depositAmount,'ether'));
         let gas="0x"+decimalToHex(42000);
         let gasPrice ="0x"+decimalToHex( $scope.gasPrice*Math.pow(10,9));
         // console.log($scope.account,$scope.pubkey,$scope.pchainId,depositAmount,gas,gasPrice,$scope.blsPrivateKey)
         let account=$scope.account;
         let blsPrivateKey="0x"+$scope.blsPrivateKey;

         web3Util.chain.signAddress(account,blsPrivateKey,(err,result)=>{
             if(!err){
             web3Util.chain.joinChildChain($scope.account,$scope.pubkey,$scope.pchainId,depositAmount,result,gas,gasPrice,(err,result)=>{
                 if(!err){
                     jQuery("#joinChainModal").modal("hide");
                     swal({title:"joinChainModal",text:result,icon:"success"});
                     var hash = result;
                     // var url = "search.html?key=" + hash;
                     // var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                     // successNotify(html);
                     var objt = {};
                     objt.hash = hash;
                     objt.fromaddress = $scope.account;
                     objt.chainName = $scope.pchainId;
                     objt.status=1;
                     createChildChain(objt).then(function(aobj) {
                         if (aobj.result == "success") {
                             queryTransactionDevList($scope.account,3).then(function(robj) {
                                 $scope.childChainList = robj.data;
                                 $scope.$apply();
                             })
                         }
                     })
                 }else{
                     let error = err.toString()
                     swal({title:"Error",text:error,icon:"error"});
                 }
             })
             }else{
                 let error = err.toString();
                 swal({title:"Error",text:error,icon:"error"});
             }
         })
     }

 });
 $(function() {
     menuActive(3);
 });