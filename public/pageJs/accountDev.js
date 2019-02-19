 angularApp.controller('myCtrl', function($scope, $http) { 
     $scope.gasLimit = 21000;
     $scope.gasPrice = 0;
     $scope.nonce = 0;
     $scope.balance = 0;
     $scope.maxSendAmount = 0;

     let web3Util = new Web3();     

     $scope.accountList = new Array();


     $scope.showAddData = function() {
         $scope.addDataFlag = true;
     }

     // $scope.RPCUrl = "http://54.189.122.88:6969/pchain";
     $scope.RPCUrl = "http://18.237.37.188:6969/pchain";


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

                    queryTransactionDevList($scope.account,4).then(function(robj) {
                        console.log(robj)
                        $scope.transactionDevList = robj.data;
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
                        $scope.RPCUrl = "";
                        jQuery('#setRPCUrl').modal("show");
                    }
                }else{
                    console.log("not connected");
                    $scope.RPCUrl = "";
                    jQuery('#setRPCUrl').modal("show");
                }
             })
        }catch(e){
            console.log(e);
        }
     }

     $scope.initWeb3();


     $scope.setRPCUrl = function(){
        try{
            addRpcUrl($scope.RPCUrl).then(function (data) {
                if(data.result="success"){
                    web3Util.setProvider(new web3Util.providers.HttpProvider($scope.RPCUrl));
                    if(web3Util.isConnected()){
                        console.log("connected");
                        $scope.getAccountList();
                        jQuery('#setRPCUrl').modal("hide");
                    }else{
                        console.log("not connected");
                        swal({title:"RPC Error",text:"Not possible to connect to the RPC provider. Make sure the provider is running and a connection is open.",icon:"error"});
                    }
                }
            })
        }catch(e){
            console.log(e);
        }
     }

     $scope.selectAccount = function(){
        $scope.getBalance();
     }

     $scope.showConfirm = function(){
        // var txFee = $scope.gasLimit * $scope.gasPrice * Math.pow(10, 9);
        //  $scope.txFee = web3Util.fromWei(txFee, 'ether');
        jQuery('#transaction').modal("show");
     }

     $scope.unlockDuration = 0;
     $scope.unlockAccount = function(){
        web3Util.personal.unlockAccount($scope.account,$scope.accountPwd1,$scope.unlockDuration,(err,result)=>{
            console.log(err,result);
            if(!err){
                jQuery("#unlockAccountModal").modal("hide");
                swal({title:"Account Unlock",text:"Success",icon:"success"});
            }else{
                let error = err.toString();
                swal({title:"Account Unlock",text:error,icon:"error"});
            }
        })
     }

     $scope.lockAccount = function(){
        web3Util.personal.lockAccount($scope.account,(err,result)=>{
            console.log(err,result);
            if(!err){
                swal({title:"Account Lock",text:"Success",icon:"success"});
            }else{
                let error = err.toString();
                swal({title:"Account Unlock",text:error,icon:"error"});
            }
        })
     }

     $scope.newAccount = function(){
        web3Util.personal.newAccount($scope.accountPwd2,(err,result)=>{
            console.log(err,result);
            if(!err){
                jQuery("#newAccountModal").modal("hide");
                swal({title:"New Account",text:result,icon:"success"});
                $scope.getAccountList();
            }else{
                let error = err.toString();
                swal({title:"New Account",text:error,icon:"error"});
            }
        })
     }

     $scope.sendTx = function(){
        let txObj = {};
        txObj.from = $scope.account;
        txObj.to = $scope.toAddress;
        txObj.value = web3Util.toWei($scope.toAmount,'ether');
        if($scope.gasPrice)
            txObj.gasPrice = $scope.gasPrice*Math.pow(10,9);
        if($scope.data)
            txObj.data = $scope.data;

        web3Util.eth.sendTransaction(txObj,(err,result)=>{
            
            if(!err){
                jQuery("#transaction").modal("hide");
                swal({title:"Transaction",text:result,icon:"success"});
                 var hash = result;
                 var url = "search.html?key=" + hash;
                 var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                 successNotify(html);


                var objt = {};
                objt.hash = hash;
                objt.fromaddress = $scope.account;
                objt.toaddress = $scope.toAddress;
                objt.value = $scope.toAmount;
                objt.gas = $scope.gasLimit;
                objt.gasPrice =  $scope.gasPrice*Math.pow(10,9);
                objt.data = $scope.data;
                addTransactionDev(objt).then(function(aobj) {
                    if (aobj.result == "success") {
                        queryTransactionDevList($scope.account,4).then(function(robj) {
                            $scope.transactionDevList = robj.data;
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
         if (words!=null && words.length > 12) {
             result = words.substr(0, 6) + "..." + words.substr(-6, 6);
         }
         return result;
     }

 });
 $(function() {
     menuActive(2);
 });