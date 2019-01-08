    angularApp.controller('myCtrl', function($scope, $http) {

        let web3Util = new Web3(); 

        $scope.gasPrice = 0;
        $scope.RPCUrl = "http://34.219.35.90:6969/pchain";

        $scope.search = function(key) {

            var keyWord = key ? key : $scope.key;
            $scope.key = keyWord;
            var resultObj = {};

            loading();

            var addressReg = /^[a-fA-F0-9]{40}$|^(0x)?[0-9a-fA-F]{40}$/;
            var hashReg = /^[a-fA-F0-9]{64}$|^(0x)?[0-9a-fA-F]{64}$/;
            var blockNumberReg = /^[1-9]|[1-9][0-9]*$/;

            if (hashReg.test(keyWord)) {
                resultObj.type = "tx";
                resultObj.name = "Transaction Hash";

                web3Util.eth.getTransaction(keyWord,(err,result)=>{
                    removeLoading();
                    console.log(err,result);
                    if(!err){
                       resultObj.data = result?result:{};
                       $scope.result = resultObj;
                       $scope.$apply();
                    }else{
                        let error = err.toString();
                        swal({title:"Account Unlock",text:error,icon:"error"});
                    }
                })
                
            } else if (keyWord == 0 || (keyWord.indexOf("0x") == -1 && blockNumberReg.test(keyWord))) {
                resultObj.type = "block";
                resultObj.name = "Block Number";

                web3Util.eth.getBlock(keyWord,(err,result)=>{
                    removeLoading();
                    console.log(err,result);
                    if(!err){
                       resultObj.data = result?result:{};
                       $scope.result = resultObj;
                       console.log($scope.result);
                       $scope.$apply();
                    }else{
                        let error = err.toString();
                        swal({title:"Account Unlock",text:error,icon:"error"});
                    }
                })

            } else {
                swal("Data format error");
                removeLoading();
                return false;
            }

        }

        $scope.initWeb3 = function(){
        removePageLoader();
         try{
            web3Util.setProvider(new web3Util.providers.HttpProvider($scope.RPCUrl));
            if(web3Util.isConnected()){
                console.log("connected");
                var key = GetQueryString("key");
                if (key) {
                    $scope.search(key);
                }
            }else{
                console.log("not connected");
                swal({title:"RPC Connect",text:"Not possible to connect to the RPC. Make sure the RPC is running and a connection is open."});
            }
        }catch(e){
            console.log(e);
        }
     }

     $scope.initWeb3();


    $scope.processData = function(val,key){
        var result = val;
        if(key == "timestamp"){
            var time = new Date(val*1000);
            result = val + " ("+time+")";
        }

        return result;

    }


    });
    $(function() {
        menuActive(1);
        removePageLoader();
    });