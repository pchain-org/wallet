 angularApp.controller('myCtrl',function ($scope, $http,$cookieStore){


        $scope.gasLimit = 200000;
        $scope.gasPrice = 10;
        $scope.nonce = 0;
        $scope.winner = {address:"0x",number:"0"};
        $scope.luckNumber = 1;

        $scope.maxNumber = Math.pow(2,256);

        $scope.endTime = new Date(1538928000000);

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

                if(res.data.result == "success"){
                    $scope.balance = res.data.data;
                }else{
                    showPopup(res.data.error,3000);
                }

            },function errorCallback(res){
                showPopup("Internet error, please refresh the page");
            });
        }

        $scope.nonceFlag = true;
        $scope.getNonce = function(type){
            $scope.nonceFlag = false;
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
                //console.log(res);
                if(res.data.result == "success"){
                    $scope.nonce = Number(res.data.data);
                    if(type == 1){
                        $scope.draw();
                    }
                }else{
                    showPopup(res.data.message,3000);
                }

            },function errorCallback(res){
                showPopup("Internet error, please refresh the page");
            });
        }

        $scope.chainId = 1;

        $scope.accountList = new Array();
        var accountStr = $cookieStore.get("account");
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
                   $scope.getNonce();
                }else{
                    window.location.href = "/wallet.html"
                }
            }else{
                window.location.href = "/wallet.html"
            }
        }catch(e){
            //console.log(e);
        }

        $scope.gasChanged = function(){
            $scope.gasPrice = jQuery("#gasPrice").val();

        }

        $scope.selectAccount = function(){
           $scope.getNonce(); 
           $scope.getBalance();
        }


        $scope.contractAddr = "0x3F1882bC62e491d435191bD3fE72b7085d0748c2";

        $scope.ABI = [
                        {
                            "constant": false,
                            "inputs": [
                                {
                                    "name": "u",
                                    "type": "uint256"
                                }
                            ],
                            "name": "draw",
                            "outputs": [],
                            "payable": false,
                            "stateMutability": "nonpayable",
                            "type": "function"
                        },
                        {
                            "anonymous": false,
                            "inputs": [
                                {
                                    "indexed": false,
                                    "name": "user",
                                    "type": "address"
                                },
                                {
                                    "indexed": false,
                                    "name": "number",
                                    "type": "uint256"
                                }
                            ],
                            "name": "DrawEvent",
                            "type": "event"
                        },
                        {
                            "inputs": [],
                            "payable": false,
                            "stateMutability": "nonpayable",
                            "type": "constructor"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "counter",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "end",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "getWinner",
                            "outputs": [
                                {
                                    "name": "user",
                                    "type": "address"
                                },
                                {
                                    "name": "n",
                                    "type": "uint256"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "start",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "winner",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "address"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        },
                        {
                            "constant": true,
                            "inputs": [],
                            "name": "winnerNumber",
                            "outputs": [
                                {
                                    "name": "",
                                    "type": "uint256"
                                }
                            ],
                            "payable": false,
                            "stateMutability": "view",
                            "type": "function"
                        }
                    ]


        var SolidityFunction = require("solidityFunction");

       $scope.getPlayLoad = function(abi,funName,paramArr) {

          // console.log(paramArr);
          var funJson = _.find(abi, { name: funName });

          //console.log("funJson",funJson);


            var solidityFunction = new SolidityFunction('', funJson, '');

            var payloadData = solidityFunction.toPayload(paramArr).data;
            //console.log("payloadData");
            //console.log(payloadData);

            return payloadData;
        }

        
        $scope.getWinner = function(){

            try{
                var paramArr = new Array();
                var funcData = $scope.getPlayLoad($scope.ABI,"getWinner",paramArr);

                var callObj = {to:$scope.contractAddr,data:funcData};

                var obj = {};
                obj.chainId = $scope.chainId;
                obj.callObj = callObj;
                obj.outputs = [
                                {
                                    "name": "user",
                                    "type": "address"
                                },
                                {
                                    "name": "n",
                                    "type": "uint256"
                                }
                            ];
                obj.abi = $scope.ABI;
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
                        // console.log(res.data);
                        $scope.winner.address = res.data.data.user;
                        $scope.winner.number = res.data.data.n;
                    }
                    
                },function errorCallback(res){
                    showPopup("Internet error, please refresh the page");
                });
            }catch(e){
                swal(e.toString());
            }


        }    

        $scope.getWinner(); 

        $scope.isLessThan = function(my,min){

            var bMy = BigNumber(my);
            var bMin = BigNumber(min);
            var b = bMy.lt( bMin );
            if(bMin.eq(0)) b = true;
            // console.log(bMy,bMin,b);
            return b;
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
                    
                   // console.log(res);
                   
                   if(res.data.data){
                        $scope.getWinner();
                        var logs = res.data.data.logs;
                        if(logs.length > 0){
                            var yourNumber = "0x"+logs[0].data.substr(66);
                            var str;
                            if( $scope.isLessThan(yourNumber,$scope.winner.number) ) {
                                str = "Congratulations! Your draw number is the minimum number. You are the current winner!";
                            }else{
                                str = "Thank you for your participation."+"Your draw number is "+BigNumber(yourNumber);
                            }
                            swal(str);
                        }else{
                            swal("Internet error, please refresh the page");
                        }
                        
                        var url =   "/index.html?key="+txHash+"&chain="+$scope.chainId;
                        var html = '<a href="'+url+'" target="_blank">Transaction hash:'+txHash+'</a>';
                        successNotify(html);
                    }else{
                        setTimeout(function(){
                            $scope.checkRecipt(txHash,chainId);
                        },2000);
                    }
                    removeLoading();

                },function errorCallback(res){
                    swal("Internet error, please refresh the page");

                });
        }

        $scope.readyToDraw = function(){
            loading();
            $scope.getNonce(1);
        }

        $scope.draw = function () {

            try{

                const gasPrice = $scope.gasPrice*Math.pow(10,9);

                const amount = 0;
                // console.log(amount);

                var paramArr = new Array();
                var funcData;

                paramArr.push($scope.luckNumber);
                funcData = $scope.getPlayLoad($scope.ABI,"draw",paramArr);

                var signRawObj = initSignRawContract($scope.contractAddr,funcData,$scope.nonce,gasPrice,$scope.gasLimit,amount);
                // console.log(signRawObj);

                var signData = signTx($scope.account.private,signRawObj);

                //console.log(signData);

                var obj = {};
                obj.chainId = $scope.chainId;
                obj.signData = signData;
                //console.log(obj);
                var url = APIHost +"/sendTx";
                // loading();
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
                    // console.log(res);
                    // removeLoading();
                    if(res.data.result == "success"){
                        var hash = res.data.data;
                       $scope.checkRecipt(hash,$scope.chainId);
                    }else{
                        swal(res.data.error);
                    }

                },function errorCallback(res){
                    showPopup("Internet error, please refresh the page");
                });
            }catch(e){
                removeLoading();
                // console.log(e);
                swal(e.toString());
            }
        }  

     });
     $(function(){
         menuActive(7);
     });