 angularApp.controller('myCtrl', function($scope, $http) {
     $scope.gasPrice = 0;
     $scope.balance = 0;
     // $scope.minVoteAmount = 100000;

     let web3Util = new Web3();

     $scope.accountList = new Array();

     // $scope.RPCUrl = "http://54.189.122.88:6969/pchain";

    $scope.getBalance = function(){
        $scope.spin = "myIconSpin";
        web3Util.eth.getBalance($scope.account,(err,result)=>{
            if(!err){
                $scope.spin = "";
                $scope.balance = web3Util.fromWei(result,"ether");
                $scope.$apply();
            }else{
                swal({title:"RPC Error",text:err.toString(),icon:"error"});
            }
        })

        web3Util.pi.getBlockNumber((err,result)=>{
            if(!err){
                $scope.currentBlockNumber = result;
                $scope.$apply();
            }else{
                swal({title:"RPC Error",text:err.toString(),icon:"error"});
            }
        })

        web3Util.tdm.getNextEpochValidators(function(err, result) {
            if(!err){
                $scope.nextValidators=result;
                $scope.$apply();
            }else{
                $scope.nextValidators=[];
                $scope.err_title=err.toString().replace("Error","Notice");
            }
        });
     }

    $scope.getAccountList = function(){
        web3Util.eth.getAccounts((err,result)=>{
            if(!err){
                $scope.accountList = result;
                if(result.length > 0){
                    $scope.account = $scope.accountList[0];
                    $scope.getBalance();
                }
                $scope.getCurrentEpoch();
                $scope.$apply();
            }else{
                let error = err.toString();
                swal({title:"Error",text:error,icon:"error"});
            }
        })
     }

     // $scope.initWeb3 = function(){
     //    removePageLoader();
     //     try{
     //        web3Util.setProvider(new web3Util.providers.HttpProvider($scope.RPCUrl));
     //        if(web3Util.isConnected()){
     //            console.log("connected");
     //            $scope.getAccountList();
     //        }else{
     //            console.log("not connected");
     //            swal({title:"RPC Connect Error",text:"Not possible to connect to the RPC provider. Make sure the provider is running and a connection is open.",icon:"error",button:"Go To Set RPC"}).then((v)=>{
     //                window.location.href = "accountDev.html";
     //            })
     //        }
     //    }catch(e){
     //        console.log(e);
     //    }
     // }

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

     $scope.currentEpochNumber;
     $scope.epochList = new Array();
     $scope.getCurrentEpoch = function(){
        web3Util.tdm.getCurrentEpochNumber((err,result)=>{
            if(!err){
                $scope.currentEpochNumber = new BigNumber(result).toString(10);
                for(var i=0;i<result;i++)
                    $scope.epochList.push(i+1);
                web3Util.tdm.getEpoch(result,(err,result)=>{
                    if(!err){
                       $scope.epochInfo = $scope.dataformat(result);
                       $scope.$apply();
                    }else{
                        let error = err.toString();
                        swal({title:"Error",text:error,icon:"error"});
                    }
                })
            }else{
                let error = err.toString();
                swal({title:"Error",text:error,icon:"error"});
            }
        })
     }

     $scope.selectEpoch = function(){
         var a=new BigNumber($scope.currentEpochNumber);
         var result=a.toString(16);
         web3Util.tdm.getEpoch("0x"+result,(err,result)=>{
            if(!err){
               $scope.epochInfo = $scope.dataformat(result);
               $scope.$apply();
            }else{
                let error = err.toString();
                swal({title:"Error",text:error,icon:"error"});
            }
        })
     }

     $scope.selectAccount = function(){
        $scope.getBalance();
     }
     $scope.voteNextEpoch = function(){
        //num to hex string
        //  if ($scope.minVoteAmount>( new BigNumber($scope.amount))) {
        //      let tips1 = "Amount error";
        //      let tips2 = "min :" + $scope.minVoteAmount + " PI"
        //      swal(tips1, tips2, "error");
        //      return;
        //  }
        //  console.log($scope.account,$scope.pubKey,$scope.salt,$scope.amount)
         let voteAmount = "0x"+decimalToHex(web3Util.toWei($scope.amount,'ether'));
         let voteHash = web3Util.getVoteHash($scope.account,$scope.pubKey,voteAmount,$scope.salt);
        web3Util.tdm.voteNextEpoch($scope.account,voteHash,(err,result)=>{
            if(!err){
                jQuery("#voteNextEpochModal").modal("hide");
                swal({title:"Transaction",text:result,icon:"success"});
                 var hash = result;
                 var url = "search.html?key=" + hash + "&chain=" + $scope.chain;
                 var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                 successNotify(html);
            }else{
                let error = err.toString();
                swal({title:"Error",text:error,icon:"error"});
            }
        })
     }

     $scope.revealVote = function(){
        //num to hex string
        //  if ($scope.minVoteAmount>( new BigNumber($scope.amount))) {
        //      let tips1 = "Amount error";
        //      let tips2 = "min :" + $scope.minVoteAmount + " PI"
        //      swal(tips1, tips2, "error");
        //      return;
        //  }
        //  console.log($scope.account,$scope.pubKey,$scope.salt,$scope.amount)
        let voteAmount = "0x"+decimalToHex(web3Util.toWei($scope.amount,'ether'));
         web3Util.chain.signAddress($scope.account,"0x"+$scope.blsPrivateKey,(err,signature)=>{
            if(!err){
                web3Util.tdm.revealVote($scope.account,$scope.pubKey,voteAmount,$scope.salt,signature,(err,result)=>{
                    if(!err){
                        jQuery("#revealVoteModal").modal("hide");
                        swal({title:"Transaction",text:result,icon:"success"});
                         var hash = result;
                         var url = "search.html?key=" + hash + "&chain=" + $scope.chain;
                         var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                         successNotify(html);
                    }else{
                        let error = err.toString();
                        console.log(error)
                        swal({title:"Error",text:error,icon:"error"});
                    }
                })


            }else{
                let error = err.toString();
                console.log(error)
                swal({title:"Error",text:error,icon:"error"});
            }
        })
     }


     $scope.dataformat= function(obj){
         for(var k in obj) {
             if($scope.valueOf(obj[k]).substr(0,2)=='0x'){
                 obj[k]=parseInt(obj[k],16)
             }
         }
         return obj;
     }

     $scope.valueOf=function(obj){
         return (obj == null) ? "null" : obj.toString();
     }

 });
 $(function() {
     menuActive(4);
 });
