 angularApp.controller('myCtrl', function($scope, $http) { 
     $scope.gasPrice = 0;
     $scope.balance = 0;

     let web3Util = new Web3();     

     $scope.accountList = new Array();

     $scope.RPCUrl = "http://54.189.122.88:6969/pchain";

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
                }
                $scope.getCurrentEpoch();
                $scope.$apply();
            }else{
                let error = err.toString();
                swal({title:"Error",text:error,icon:"error"});
            }
        })
     }

     $scope.initWeb3 = function(){
        removePageLoader();
         try{
            web3Util.setProvider(new web3Util.providers.HttpProvider($scope.RPCUrl));
            if(web3Util.isConnected()){
                console.log("connected");
                $scope.getAccountList();
            }else{
                console.log("not connected");
                swal({title:"RPC Connect Error",text:"Not possible to connect to the RPC provider. Make sure the provider is running and a connection is open.",icon:"error",button:"Go To Set RPC"}).then((v)=>{
                    window.location.href = "accountDev.html";
                })
            }
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
                $scope.currentEpochNumber = result;
                for(var i=0;i<result;i++)
                    $scope.epochList.push(i+1);
                web3Util.tdm.getEpoch(result,(err,result)=>{
                    if(!err){
                       $scope.epochInfo = result;
                       $scope.$apply();
                       console.log($scope.epochInfo);
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
        console.log("in selectEpoch",$scope.currentEpochNumber);
         web3Util.tdm.getEpoch($scope.currentEpochNumber,(err,result)=>{
            if(!err){
               $scope.epochInfo = result;
               $scope.$apply();
               console.log($scope.epochInfo);
            }else{
                let error = err.toString();
                swal({title:"Error",text:error,icon:"error"});
            }
        })
     }

     $scope.selectAccount = function(){
        $scope.getBalance();
     }

     $scope.voteNextEpochChain = function(){
        //num to hex string
        let voteAmount = "0x"+decimalToHex($scope.amount);
        let voteHash = web3Util.getVoteHash($scope.account,$scope.pubKey,voteAmount,$scope.salt);

        console.log(voteHash);

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
        let voteAmount = "0x"+decimalToHex($scope.amount);
        let signature = web3Util.chain.signAddress($scope.account,$scope.blsPrivateKey,(err,result)=>{
            if(!err){
                web3Util.chain.revealVote($scope.account,$scope.pubKey,voteAmount,$scope.salt,signature,(err,result)=>{
                    if(!err){
                        jQuery("#revealVoteModal").modal("hide");
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


            }else{
                let error = err.toString();
                swal({title:"Error",text:error,icon:"error"});
            }
        })
     }

 });
 $(function() {
     menuActive(4);
 });