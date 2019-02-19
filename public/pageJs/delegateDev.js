 angularApp.controller('myCtrl', function($scope, $http) { 
     $scope.gasPrice = 10;
     $scope.balance = 0;
     $scope.amount = 1000;

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

                    queryTransactionDevList($scope.account,5).then(function(robj) {
                        console.log(robj)
                        $scope.delegateList = robj.data;
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

     $scope.cancelDelegate = function(){
         let amount= "0x"+decimalToHex(web3Util.toWei($scope.amount,'ether'));
         let gasPrice =null;
         console.log($scope.account,$scope.candidate,amount)
         web3Util.del.cancelDelegate($scope.account,$scope.candidate,amount,gasPrice,(err,result)=>{
             if(!err){
                 jQuery("#cancelDelegateModal").modal("hide");
                 swal({title:"cancelDelegateModal",text:result,icon:"success"});
                 var hash = result;
                 // var url = "search.html?key=" + hash;
                 // var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                 // successNotify(html);
                 console.log(hash)
                 var objt = {};
                 objt.hash = hash;
                 objt.fromaddress = $scope.account;
                 objt.toaddress = $scope.candidate;
                 objt.status=1;
                 console.log(objt)
                 createDelegate(objt).then(function(aobj) {
                     console.log(aobj)
                     if (aobj.result == "success") {
                         queryTransactionDevList($scope.account,5).then(function(robj) {
                             console.log(robj)
                             $scope.delegateList = robj.data;
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


     $scope.delegate = function(){
         let amount= "0x"+decimalToHex(web3Util.toWei($scope.amount,'ether'));
         let gasPrice =null;
         console.log($scope.account,$scope.candidate,amount)
         web3Util.del.delegate($scope.account,$scope.candidate,amount,gasPrice,(err,result)=>{
             if(!err){
                 jQuery("#delegateModal").modal("hide");
                 swal({title:"delegateModal",text:result,icon:"success"});
                 var hash = result;
                 // var url = "search.html?key=" + hash;
                 // var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                 // successNotify(html);
                 console.log(hash)
                 var objt = {};
                 objt.hash = hash;
                 objt.fromaddress = $scope.account;
                 objt.toaddress = $scope.candidate;
                 objt.status=0;
                 console.log(objt)
                 createDelegate(objt).then(function(aobj) {
                     console.log(aobj)
                     if (aobj.result == "success") {
                         queryTransactionDevList($scope.account,5).then(function(robj) {
                             console.log(robj)
                             $scope.delegateList = robj.data;
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