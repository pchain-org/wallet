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
                queryTransactionDevList($scope.account,6).then(function(robj) {
                    console.log(robj)
                    $scope.candidateList = robj.data;
                    $scope.$apply();
                })
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

     $scope.cancelCandidate = function(){
         // var gasPrice =null;
         console.log($scope.account)
        web3Util.del.cancelCandidate($scope.account,(err,result)=>{
            if(!err){
                jQuery("#cancelCandidateModal").modal("hide");
                swal({title:"cancelCandidateModal",text:result,icon:"success"});
                var hash = result;
                console.log(hash)
                // var url = "search.html?key=" + hash;
                // var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                // successNotify(html);
                var objt = {};
                objt.hash = hash;
                objt.fromaddress = $scope.account;
                objt.value = $scope.candidateList[0].value;
                objt.data = $scope.candidateList[0].data;
                objt.status= 1;
                console.log(objt)
                createCandidate(objt).then(function(aobj) {
                    console.log(aobj)
                    if (aobj.result == "success") {
                        queryTransactionDevList($scope.account,6).then(function(robj) {
                            console.log(robj)
                            $scope.candidateList = robj.data;
                            $scope.$apply();
                        })
                    }
                })

            }else{
                let error = err.toString();
                console.log(error)
                swal({title:"Error",text:error,icon:"error"});
            }

        })

     }


     $scope.applyCandidate = function(){
         let securityDeposit= "0x"+decimalToHex(web3Util.toWei($scope.securityDeposit,'ether'));
         let gasPrice =null;
         console.log($scope.account,securityDeposit,$scope.commission)
         web3Util.del.applyCandidate($scope.account,securityDeposit,$scope.commission,gasPrice,(err,result)=>{
             if(!err){
                 jQuery("#applyCandidateModal").modal("hide");
                 swal({title:"applyCandidateModal",text:result,icon:"success"});
                 var hash = result;
                 // var url = "search.html?key=" + hash;
                 // var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                 // successNotify(html);
                 console.log(hash)
                 var objt = {};
                 objt.hash = hash;
                 objt.fromaddress = $scope.account;
                 objt.value = $scope.securityDeposit;
                 objt.data = $scope.commission;
                 objt.status=0;
                 console.log(objt)
                 createCandidate(objt).then(function(aobj) {
                     console.log(aobj)
                     if (aobj.result == "success") {
                         queryTransactionDevList($scope.account,6).then(function(robj) {
                             console.log(robj)
                             $scope.candidateList = robj.data;
                             $scope.$apply();
                         })
                     }
                 })

             }else{
                 let error = err.toString();
                 console.log(error)
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
     menuActive(6);
 });