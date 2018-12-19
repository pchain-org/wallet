     angularApp.controller('myCtrl',function ($scope, $http){

        var web3 = new Web3();
        $scope.getBalance = function () {
            var obj = {};
            obj.chainId = $scope.chainId;
            obj.address = $scope.account.address;
            //console.log(obj);
            var url = APIHost +"/getBalance";
            $http({
                method:'POST',
                url:url,
                data:obj
            }).then(function successCallback(res){
                //console.log(res);
                if(res.data.result == "success"){
                    $scope.balance = res.data.data;
                }else{
                    showPopup(res.data.error,3000);
                }

            },function errorCallback(res){
                showPopup("Internet error, please refresh the page");
            });
        }

        $scope.getNonce = function(){

            $scope.nonce = -1;
            var obj = {};
            obj.chainId = $scope.chainId;
            obj.address = $scope.account.address;
            //console.log(obj);
            var url = APIHost +"/getNonce";
            $http({
                method:'POST',
                url:url,
                data:obj
            }).then(function successCallback(res){
                if(res.data.result == "success"){
                    //console.log(res);
                    $scope.nonce = Number(res.data.data);
                }else{
                    showPopup(res.data.error,3000);
                }

            },function errorCallback(res){
                showPopup("Internet error, please refresh the page");
            });
        }

        //chain list
        $scope.chainList = new Array();
        for(var i=0;i<2;i++){
            var obj = {};
            obj.name = "Child Chain "+(i+1);
            obj.id = (i+1);
            $scope.chainList.push(obj);
        }


        $scope.chainId = 1;

        $scope.deployGas = 7000000;

        $scope.balance = 0;
        $scope.gasLimit = 300000;
        $scope.gasPrice = 10;
        $scope.nonce = 0;
        $scope.amount = 0;

        $scope.gasLimitTx = 3000000;

         $scope.accountList = new Array();
        var accountStr = "";
        try{
            if(accountStr){

                 var accountCookieList = JSON.parse(accountStr)
                for(var i=0;i<accountCookieList.length;i++){
                    var obj = {};
                    obj.address = accountCookieList[i].address;
                    obj.private = accountCookieList[i].private;
                    $scope.accountList.push(obj);
                }
                //console.log($scope.accountList);
                if($scope.accountList.length > 0){
                    $scope.account = $scope.accountList[0];
                    //console.log($scope.account);
                   $scope.getBalance();
                }else{
                    // window.location.href = "wallet.html"
                }
            }else{
                // window.location.href = "wallet.html"
            }
        }catch(e){
            //console.log(e);
        }

        $scope.gasChanged = function(){
            $scope.gasPrice = jQuery("#gasPrice").val();

        }

        $scope.access = function(){
            var abi = $scope.abi;

            try{
                var abiJson = JSON.parse($scope.abi);

                $scope.orignABI = angular.copy(abiJson);

                $scope.ABIJson = abiJson.filter(function(item){
                    if(item.type == "fallback")
                        item.name = "fallback";
                    //console.log(item);
                    return (item.type == "function" || item.type == "fallback");
                }) ;


                $scope.gasLimit = 3000000;

                //console.log($scope.ABIJson);

            }catch(e){
                //console.log(e);
                swal(" Please enter a valid ABI");
            }
        }

       // var SolidityFunction = require("solidityFunction");

       $scope.getPlayLoad = function(abi,funName,paramArr) {

          //console.log(typeof abi,funName,paramArr);
          var funJson = _.find(abi, { name: funName });

          //console.log("funJson",funJson);


            var solidityFunction = new SolidityFunction('', funJson, '');

            var payloadData = solidityFunction.toPayload(paramArr).data;
            //console.log("payloadData");
            //console.log(payloadData);

            return payloadData;
        }

        $scope.deploy = function(){
            $scope.getNonce();
            var gas = $scope.deployGas;
            $scope.gasLimit = gas;
            $scope.to = "";
            $scope.contractAddr = "";
            $scope.amount = 0;
            var txFee = $scope.gasLimit*$scope.gasPrice*Math.pow(10,9);
            $scope.txFee = web3.fromWei(txFee,'ether');
            $('#transaction').modal('show');
        }

        $scope.write = function(){

            try{
                 $scope.getNonce();

                var paramArr = new Array();
                var funcData;

                if($scope.funcObj.type == "fallback"){

                }else{
                    for(var i=0;i<$scope.funcObj.inputs.length;i++)
                    paramArr.push($scope.funcObj.inputs[i].value);
                    funcData = $scope.getPlayLoad($scope.ABIJson,$scope.funcObj.name,paramArr);
                }
                

                $scope.byteCode = funcData;

                $scope.gasLimit = jQuery("#gasLimit").val();
                // var gas = $scope.gasLimitTx
                // $scope.gasLimit = gas;

                var txFee = $scope.gasLimit*$scope.gasPrice*Math.pow(10,9);
                $scope.txFee = web3.fromWei(txFee,'ether');

                $('#transaction').modal('show');
            }catch(e){
                swal(e.toString());
            }

        }

         $scope.call = function(){

            try{
                var paramArr = new Array();
                for(var i=0;i<$scope.funcObj.inputs.length;i++)
                    paramArr.push($scope.funcObj.inputs[i].value);

                var funcData = $scope.getPlayLoad($scope.orignABI,$scope.funcObj.name,paramArr);

                //console.log(funcData);

                var callObj = {to:$scope.contractAddr,data:funcData};

                var obj = {};
                obj.chainId = $scope.chainId;
                obj.callObj = callObj;
                obj.outputs = $scope.funcObj.outputs;
                obj.abi = $scope.orignABI;
                // console.log(obj);
                // var url = APIHost +"/getCall";
                var url = APIHost +"/call";
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
                    // console.log(res);
                    if(res.data.result == "success"){
                        var result = res.data.data;
                        if($scope.funcObj.outputs.length == 1){
                            $scope.funcObj.outputs[0].value = result?result:"Null";
                        }else{
                            for(var i=0;i<result.length;i++)
                                $scope.funcObj.outputs[i].value = result[i]?result[i]:"Null";
                        }
                        $scope.showResult = true;
                    }else{
                        swal(res.data.error);
                    }

                },function errorCallback(res){
                    showPopup("Internet error, please refresh the page");
                });
            }catch(e){
                swal(e.toString());
            }


        }

        $scope.checkRecipt = function(txHash,chainId){

                var obj = {};
                obj.txHash = txHash;
                obj.chainId = chainId;

                var url = APIHost +"/getTxRecipt";
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
  
                   if(res.data.data){
                        if(res.data.data.contractAddress){
                            var contractAddr = res.data.data.contractAddress;

                             swal("Contract Address: "+ contractAddr);
                        }
                    

                    }else{
                        setTimeout(function(){
                            $scope.checkRecipt(txHash,chainId);
                        },2000);
                    }

                },function errorCallback(res){
                    swal("Internet error, please refresh the page");

                });
        }

        $scope.sendTx = function () {

            try{

                const gasPrice = $scope.gasPrice*Math.pow(10,9);

                const amount = web3.toWei($scope.amount,"ether");
                // console.log(amount);

                var signRawObj = initSignRawContract($scope.contractAddr,$scope.byteCode,$scope.nonce,gasPrice,$scope.gasLimit,amount);
                // console.log(signRawObj);

                var signData = signTx($scope.account.private,signRawObj);

                //console.log(signData);

                var obj = {};
                obj.chainId = $scope.chainId;
                obj.signData = signData;
                //console.log(obj);
                var url = APIHost +"/sendTx";
                loading();
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
                    //console.log(res);
                    removeLoading();
                    if(res.data.result == "success"){

                        $('#transaction').modal('hide');
                        var hash = res.data.data;
                        var url =   "/index.html?key="+hash+"&chain="+$scope.chainId;
                        var html = '<a href="'+url+'" target="_blank">Transaction hash:'+hash+'</a>';
                       successNotify(html);
                       $scope.checkRecipt(hash,$scope.chainId);
                    }else{
                        swal(res.data.error);
                    }

                },function errorCallback(res){
                    showPopup("Internet error, please refresh the page");
                });
            }catch(e){
                console.log(e);
                swal(e.toString());
            }
        }

     });
     $(function(){
         menuActive(4);
     });