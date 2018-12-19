    // var Accounts = new Accounts();
    var web3 = new Web3();

     angularApp.controller('myCtrl',function ($scope, $http){
        //chain list
        $scope.chainList = [
            {name:"Main Chain",id:0}
        ];
        for(var i=0;i<2;i++){
            var obj = {};
            obj.name = "Child Chain"+(i+1);
            obj.id = (i+1);
            $scope.chainList.push(obj);
        }

        $scope.chain = 0;

        $scope.chainList2 = new Array();

        for(var i=0;i<2;i++){
            var obj2 = {};
            obj2.name = "Child Chain"+(i+1);
            obj2.id = (i+1);
            $scope.chainList2.push(obj2);
        }

        $scope.crossChain = 1;

        $scope.getBalance = function () {
            var obj = {};
            obj.chainId = $scope.chain;
            obj.address = $scope.account.address;
            // //console.log(obj);
            var url = APIHost +"/getBalance";
            $http({
                method:'POST',
                url:url,
                data:obj
            }).then(function successCallback(res){
                // //console.log(res);
                if(res.data.result == "success"){
                    $scope.balance = res.data.data;
                }else{
                    swal(res.data.error);
                }

            },function errorCallback(res){
                swal("Internet error, please refresh the page");
            });
        }

        


        $scope.nonceFlag = true;
        $scope.getNonce = function(chainId){

            $scope.nonceFlag = false;
            var obj = {};
            obj.chainId = chainId;
            obj.address = $scope.account.address;
            // //console.log(obj);
            var url = APIHost +"/getNonce";
            $http({
                method:'POST',
                url:url,
                data:obj
            }).then(function successCallback(res){
                if(res.data.result == "success"){
                    // //console.log(res);
                    if(chainId == $scope.chain){
                        $scope.nonce = Number(res.data.data);
                    }else{
                        $scope.nonce2 = Number(res.data.data);
                    }
                    $scope.nonceFlag = true;
                }else{
                    showPopup(res.data.message,3000);
                }

            },function errorCallback(res){
                showPopup("Internet error, please refresh the page");
            });
        }


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
                // //console.log($scope.accountList);
                if($scope.accountList.length > 0){
                    $scope.account = $scope.accountList[0];
                    // //console.log($scope.account);
                   $scope.getBalance();
                }
            }
        }catch(e){
            //console.log(e);
        }



        if($scope.accountList.length == 0){
            $('#newAccount').modal('show');
        }

        $scope.balance = 0;
        $scope.gasLimit = 42000;
        $scope.gasPrice = 10;
        $scope.nonce = 0;
        $scope.nonce2 = 0;

        $scope.selectChain = function () {

            $scope.chainList2 = new Array();
            if($scope.chain == 0){
                for(var i=0;i<2;i++){
                    var obj3 = {};
                    obj3.name = "Child Chain"+(i+1);
                    obj3.id = (i+1);
                    $scope.chainList2.push(obj3);
                }

                $scope.crossChain = 1;
            }else{
                var obj4 = {name:"Main Chain",id:0};
                $scope.chainList2.push(obj4);
                $scope.crossChain = 0;
            }
             $scope.getBalance();
        }

        $scope.generate = function(){
            var newAccount = Accounts.new();
            $scope.newPrivate = newAccount.unCryp.private;
        }

        $scope.add = function(){
            var obj = {};
            obj.private = $scope.newPrivate;
            obj.address = priToAddress($scope.newPrivate);

            $scope.accountList.push(obj);

            var listStr = JSON.stringify($scope.accountList);
            $cookieStore.put("account",listStr);
            $('#newAccount').modal('hide')
            if($scope.accountList.length == 1){
                $scope.account = $scope.accountList[0];
            }
            $scope.getBalance();
            $scope.newPrivate = "";
        }
        $scope.getChainNameByid = function (id) {
            var name = "Main Chain";
            if(id > 0){
                name = "Child Chain "+id;
            }
            return name;
        }
        var web3 = new Web3();
        $scope.submit = function () {
            var txFee = $scope.gasLimit*$scope.gasPrice*Math.pow(10,9);
            $scope.txFee = web3.fromWei(txFee,'ether');

            $scope.getNonce($scope.chain);

            $('#transaction').modal('show');
        }

        $scope.sendTx = function () {
            loading();
            if($scope.chain == 0){
                    $scope.mainToChild();
            }else{

                    $scope.childToMain();
            }
        }


        $scope.checkRecipt = function(txHash,chainId,type){

                var obj = {};
                obj.txHash = txHash;
                obj.chainId = chainId;
                // //console.log(obj);
                var url = APIHost +"/getTxRecipt";
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
                    // console.log(res,"checkRecipt---------------");
                    if(res.data.data){
                        if(type == 1){
                            setTimeout(function(){
                                 $scope.confirmMainToChild(txHash);
                            },2000);
                        }else if(type == 2){
                            setTimeout(function(){
                                 $scope.checkChildTxInMaiChain(txHash,chainId);
                            },3000);
                            
                        }

                    }else{
                        setTimeout(function(){
                            $scope.checkRecipt(txHash,chainId,type);
                        },2000);
                    }

                },function errorCallback(res){
                    swal("Internet error, please refresh the page");

                });
        }

        $scope.checkChildTxInMaiChain = function(txHash,chainId){

                var obj = {};
                obj.txHash = txHash;
                obj.chainId = chainId;
               
                var url = APIHost +"/getChildTxInMainChain";
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
                    console.log(res);
                    if(res.data.result == "error"){
                        setTimeout(function(){
                            $scope.checkChildTxInMaiChain(txHash,chainId);
                        },2000);
                    }else{
                        $scope.confirmChildToMain(txHash);
                    }
            

                },function errorCallback(res){
                    setTimeout(function(){
                        $scope.checkChildTxInMaiChain(txHash,chainId);
                    },2000);

                });
        }

        

        $scope.checkMainTxInChildChain = function(txHash,chainId){

                var obj = {};
                obj.txHash = txHash;
                obj.chainId = chainId;
               
                var url = APIHost +"/getMainTxInChildChain";
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
                    
                    if(!res.data.data){
                        setTimeout(function(){
                            $scope.checkMainTxInChildChain(txHash,chainId);
                        },2000);
                    }else{
                        $scope.confirmMainToChild(txHash);
                    }
            

                },function errorCallback(res){
                    setTimeout(function(){
                        $scope.checkMainTxInChildChain(txHash,chainId);
                    },2000);

                });
        }



        $scope.mainToChild = function() {

            try{

                $scope.getNonce($scope.crossChain);

                const gasPrice = $scope.gasPrice*Math.pow(10,9);
                const amount = web3.toWei($scope.toAmount,"ether");

                // console.log(amount);

                const childChainId = "child_"+($scope.crossChain - 1);
                // const childChainId = "child_"+($scope.crossChain - 1);

                var signRawObj = initSignRawDeposite($scope.account.address,amount,"",$scope.nonce,gasPrice,$scope.gasLimit,childChainId,0);
                //console.log("signRawObj _ mainToChild",signRawObj);
                var signData = signTx($scope.account.private,signRawObj);
                // //console.log(signData);

                var obj = {};
                obj.chainId = $scope.chain;
                obj.signData = signData;
                // //console.log(obj);
                var url = APIHost +"/sendTx";
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
                    // //console.log(res);
                    if(res.data.result == "success"){

                        var depositeHash = res.data.data;
                        // $scope.checkRecipt(depositeHash,$scope.chain,1);
                        $scope.checkMainTxInChildChain(depositeHash,$scope.crossChain);

                    }else{
                        swal(res.data.error);
                        removeLoading();
                    }

                },function errorCallback(res){
                    swal("Internet error, please refresh the page");
                });

            }catch(e){
                console.log(e);
                swal(e.toString());
            }

        }

        $scope.confirmMainToChild = function(depositeHash){
            const childChainId = "child_"+($scope.crossChain - 1);
            
            var signRawObj = initSignRawDeposite($scope.account.address,"",depositeHash,$scope.nonce2,0,0,childChainId,1);
            var signData = signTx($scope.account.private,signRawObj);

            // console.log("signRawObj_ confirmMainToChild",signRawObj);

            var obj2 = {};
            obj2.chainId =  Number($scope.crossChain);
            obj2.signData = signData;
            
            var url = APIHost +"/sendTx";
            $http({
                method:'POST',
                url:url,
                data:obj2
            }).then(function successCallback(res){
                // console.log(res);
                removeLoading();
                if(res.data.result == "success"){

                    $('#transaction').modal('hide');
                    // var hash = res.data.data;;
                    // var url =   "/index.html?key="+hash+"&chain="+$scope.crossChain;
                    var hash = depositeHash;;
                    var url =   "/index.html?key="+hash+"&chain="+$scope.chain;
                    var html = '<a href="'+url+'" target="_blank">Transaction hash:'+hash+'</a>';
                    successNotify(html);
                }else{
                    swal(res.data.error);
                }

            },function errorCallback(res){
                swal("Internet error, please refresh the page");
            });
        }

        $scope.childToMain = function() {

            try{

                $scope.getNonce($scope.crossChain);

                const gasPrice = $scope.gasPrice*Math.pow(10,9);
                const amount = web3.toWei($scope.toAmount,"ether");

                var signRawObj = initSignRawDeposite($scope.account.address,amount,"",$scope.nonce,gasPrice,$scope.gasLimit,"",2);
              
                var signData = signTx($scope.account.private,signRawObj);

                var obj = {};
                obj.chainId = $scope.chain;
                obj.signData = signData;
               

                var url = APIHost +"/sendTx";
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
                    if(res.data.result == "success"){

                        var depositeHash = res.data.data;

                        $scope.checkRecipt(depositeHash,$scope.chain,2);


                    }else{
                        swal(res.data.error);
                        removeLoading();
                    }

                },function errorCallback(res){
                    swal("Internet error, please refresh the page");
                });

            }catch(e){
                console.log(e);
                swal(e.toString());
            }

        }

        $scope.gasChanged = function(){
            $scope.gasPrice = jQuery("#gasPrice").val();

        }

        $scope.confirmChildToMain = function(depositeHash){
            const childChainId = "child_"+($scope.chain - 1);
            var signRawObj = initSignRawDeposite($scope.account.address,"",depositeHash,$scope.nonce2,0,0,childChainId,3);
            var signData = signTx($scope.account.private,signRawObj);
            

            var obj2 = {};
            obj2.chainId =  Number($scope.crossChain);
            obj2.signData = signData;
             obj2.childId = Number($scope.chain);
            var url = APIHost +"/sendTx";
            $http({
                method:'POST',
                url:url,
                data:obj2
            }).then(function successCallback(res){
    
                removeLoading();
                if(res.data.result == "success"){

                    $('#transaction').modal('hide');
                    // var hash = res.data.data;
                    // var url =   "/index.html?key="+hash+"&chain="+$scope.crossChain;
                    var hash = depositeHash;
                    var url =   "/index.html?key="+hash+"&chain="+$scope.chain;
                    var html = '<a href="'+url+'" target="_blank">Transaction hash:'+hash+'</a>';
                    successNotify(html);
                }else{
                    swal(res.data.error);
                }

            },function errorCallback(res){
                swal("Internet error, please refresh the page");
            });

        }

     });
     $(function(){
         menuActive(2);
     });