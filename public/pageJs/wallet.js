    var Accounts = new Accounts();
    var web3 = new Web3();
    $('.collapse').collapse();

     angularApp.controller('myCtrl',function ($scope, $http){


        $scope.txList = [
        {id:1,from:"Main Chain",to:"Child Chain 1",value:"1.23456789",showDetail:false,tx:[
        {from:"0xea674fdde714fd979de3edf0f56aa9716b898ec8",to:"0xea674fdde714fd979de3edf0f56aa9716b898ec8",hash:"0x190b398c154697605bf545ec8f23ef196fa62d2fe7245c9a98cecfe9b5cb00e3",chain:"Main Chain",id:0},
        {from:"0xea674fdde714fd979de3edf0f56aa9716b898ec8",to:"0xea674fdde714fd979de3edf0f56aa9716b898ec8",hash:"0x190b398c154697605bf545ec8f23ef196fa62d2fe7245c9a98cecfe9b5cb00e3",chain:"Child Chain 1",id:1}
        ]}
        ];

        $scope.showTxDetail = (index)=>{
            
           $scope.txList[index].showDetail = !$scope.txList[index].showDetail;

        }
         // $scope.chain.id = 0;
         $scope.chainList = new Array();
         $scope.chainList2 = new Array();
         $scope.chainList = [
             {name:"Main Chain",id:0,chainId:"pchain"}
         ];
         $scope.chain=$scope.chainList[0];
         queryChainList().then(function (resData) {
             for(var i=0;i<resData.data.length;i++){
                 var obj = {};
                 obj.name = resData.data[i].chainName;
                 obj.id = resData.data[i].id;
                 obj.chainId = resData.data[i].chainId;
                 $scope.chainList.push(obj);
                 $scope.chainList2.push(obj);
             }
             $scope.crossChain=$scope.chainList2[0];
             // $scope.crossChain = 1;
             $scope.$apply();
         }).catch(function (e) {
             console.log(e, "queryChainList error.");
         })

        $scope.getBalance = function () {
            var obj = {};
            obj.chainId = $scope.chain.id;
            obj.address = $scope.account.address;
            // //console.log(obj);
            var url = APIHost +"/getBalance";
            $http({
                method:'POST',
                url:url,
                data:obj
            }).then(function successCallback(res){
                removePageLoader();
                if(res.data.result == "success"){
                    $scope.balance = res.data.data;
                }else{
                    swal(res.data.error);
                }

            },function errorCallback(res){
                swal("Internet error, please refresh the page");
            });
        }

         var clipboard2 = new Clipboard('.copyBtn2',{
                container: document.getElementById('accountDetail') 
            });

            clipboard2.on('success', function(e) {
                showNotification("alert-success","Copy successfully","bottom","center",1000);
            });

        $scope.openAccountDetail = function(){

           $('#accountDetail').modal('show');
            var qrnode = new AraleQRCode({text: $scope.account.address});

            $('#qrcode').html(qrnode);
        }

        $scope.pwdFormtype = 0;
        $scope.enterPassword = function(type){
            $scope.pwdFormtype = type;
            $('#enterPassword').modal('show');
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
                    if(chainId == $scope.chain.id){
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
         queryAccountList().then(function (resObj) {
             $scope.accountList = resObj.data;
            try{
                if($scope.accountList.length>0){
                        $scope.account = $scope.accountList[0];
                        $scope.getBalance();
                }
                if($scope.accountList.length == 0){
                    removePageLoader();
                    $('#newAccount').modal('show');
                }
            }catch(e){
                console.log(e);
            }
         }).catch(function (e) {
             console.log(e, "error");
         })

        $scope.balance = 0;
        $scope.gasLimit = 42000;
        $scope.gasPrice = 10;
        $scope.nonce = 0;
        $scope.nonce2 = 0;

        // $scope.crossChain.id = "1";


        $scope.selectChain = function () {
            $scope.chainList2 = new Array();
            if($scope.chain.id == 0){
                queryChainList().then(function (resData) {
                    for(var i=0;i<resData.data.length;i++){
                        var obj3 = {};
                        obj3.name = resData.data[i].chainName;
                        obj3.id = resData.data[i].id;
                        $scope.chainList2.push(obj3);
                        // $scope.crossChain.id = 0;
                    }
                    $scope.crossChain=$scope.chainList2[0];
                }).catch(function (e) {
                    console.log(e, "queryChainList error.");
                });

            }else{
                var obj4 = {name:"Main Chain",id:0,chainId:"pchain"};
                $scope.chainList2.push(obj4);
                // $scope.crossChain.id = 0;
                $scope.crossChain=$scope.chainList2[0];
            }
             $scope.getBalance();
        }

        $scope.newPrivateKet = function(){
            var newAccount = Accounts.new();
            return newAccount.unCryp.private;
        }

        $scope.add = function(){

            var newPrivateKey = $scope.newPrivateKet();

            var obj = {};
            
            obj.address = priToAddress(newPrivateKey);

            $scope.accountList.push(obj);
            // console.log(newPrivateKey,obj.address);

            var enPri = AESEncrypt(newPrivateKey,$scope.password);
            // console.log(enPri);

            // addAccount(obj.address,enPri).then()

            addAccount(enPri,obj.address).then(function (resObj) {
                if(resObj.result=="success"){
                    showPopup("Created successfully",1000);
                    $('#newAccount').modal('hide')

                    if($scope.accountList.length> 0){
                        $scope.account = $scope.accountList[$scope.accountList.length-1];
                    }
                    $scope.getBalance();
                }
                // console.log(resObj)
            }).catch(function (e) {
                console.log(e, "error");
            })

            // var dePri = AESDecrypt(enPri,$scope.password);
            // console.log(dePri);
            
        }

        var clipboard3 = new Clipboard('.copyBtn3',{
            container: document.getElementById('exportPrivateKey') 
        });

        clipboard3.on('success', function(e) {
            showNotification("alert-success","Copy successfully","bottom","center",1000);
        });

         $scope.currentPrivateKey = "";
         $scope.confirmPassword = function(){
             if($scope.account==undefined){
                 swal("Please create a wallet address at first");
                 return;
             }
            queryPrivateKey($scope.account.address).then(function (result) {

                if(result.result=="success"){
                    var dePri = AESDecrypt(result.data.privateKey,$scope.inputPassword);
                    if(dePri){
                        $scope.currentPrivateKey = dePri;
                        $scope.inputPassword = "";
                        $scope.$apply();
                        $('#enterPassword').modal('hide');

                        if($scope.pwdFormtype == 1){  //export Private key
                            
                            $('#exportPrivateKey').modal('show');
                        }else{   //send tx
                            $scope.submit();
                        }
                    }else{
                        swal("Password error");
                    }
                }else{
                    swal("Password error");
                }
            }).catch(function (e) {

                swal("Password error");
            })
            
         };
         
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

            $scope.getNonce($scope.chain.id);

            $('#transaction').modal('show');
        }

        $scope.sendTx = function () {
            loading();
            if($scope.chain.id == 0){
                    $scope.mainToChild();
            }else{

                    $scope.childToMain();
            }
        }


        $scope.checkRecipt = function(txHash,chainId,type,childToMainAmount,pid,flag){

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
                                 $scope.confirmMainToChild(txHash,pid,flag);
                            },2000);
                        }else if(type == 2){
                            setTimeout(function(){
                                 $scope.checkChildTxInMaiChain(txHash,chainId,childToMainAmount,pid,flag);
                            },3000);
                            
                        }

                    }else{
                        setTimeout(function(){
                            $scope.checkRecipt(txHash,chainId,type,childToMainAmount,pid,flag);
                        },2000);
                    }

                },function errorCallback(res){
                    swal("Internet error, please refresh the page");

                });
        }

        $scope.checkChildTxInMaiChain = function(txHash,chainId,childToMainAmount){

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
                            $scope.checkChildTxInMaiChain(txHash,chainId,childToMainAmount);
                        },2000);
                    }else{
                        $scope.confirmChildToMain(txHash,childToMainAmount);
                    }
            

                },function errorCallback(res){
                    setTimeout(function(){
                        $scope.checkChildTxInMaiChain(txHash,chainId);
                    },2000);

                });
        }

        

        $scope.checkMainTxInChildChain = function(txHash,chainId,pid,flag){
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
                            $scope.checkMainTxInChildChain(txHash,chainId,pid,flag);
                        },2000);
                    }else{
                        $scope.confirmMainToChild(txHash,pid,flag);
                    }
            

                },function errorCallback(res){
                    setTimeout(function(){
                        $scope.checkMainTxInChildChain(txHash,chainId,pid);
                    },2000);

                });
        }

       $scope.getPlayLoad = function(abi,funName,paramArr) {

            var payloadData = TxData(abi,funName,paramArr);
            return payloadData;
        }


        $scope.mainToChild = function() {
            try{
                $scope.getNonce($scope.crossChain.id);

                const gasPrice = $scope.gasPrice*Math.pow(10,9);
                const amount = web3.toWei($scope.toAmount,"ether");

                // console.log(amount);

                const childChainId = "child_"+(Number($scope.crossChain.id) - 1);
                // const childChainId = "child_"+($scope.crossChain - 1);

                // var signRawObj = initSignRawDeposite($scope.account.address,amount,"",$scope.nonce,gasPrice,$scope.gasLimit,childChainId,0);

                var funcData = $scope.getPlayLoad(crossChainABI,"DepositInMainChain",[childChainId,amount]);

                var signRawObj = initSignRawCrosschain(funcData,$scope.nonce,gasPrice,$scope.gasLimit,0);



                //console.log("signRawObj _ mainToChild",signRawObj);
                var signData = signTx($scope.currentPrivateKey,signRawObj);

                // console.log(signData);

                var obj = {};
                obj.chainId = $scope.chain.id;
                obj.signData = signData;
                // console.log(obj);
                var url = APIHost +"/sendTx";
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
                    console.log(res);
                    if(res.data.result == "success"){
                        var depositeHash = res.data.data;
                        var objt = {};
                        objt.hash = depositeHash;
                        objt.nonce = $scope.nonce;
                        objt.fromaddress = $scope.account.address;
                        objt.value = $scope.toAmount;
                        objt.gas = $scope.gasLimit;
                        objt.gasPrice = gasPrice;
                        objt.chainId = $scope.chain.id;
                        objt.chainName = $scope.chain.name;
                        objt.crossChainId=$scope.crossChain.id;
                        objt.crossChainName=$scope.crossChain.name;
                        objt.flag=true;
                        console.log(objt)
                        addMultiChainTransaction(objt).then(function (aobj) {
                            console.log(aobj.data)
                            if(aobj.result=="success"){
                                $scope.checkMainTxInChildChain(depositeHash,$scope.crossChain.id,aobj.data,true);
                            }
                        })
                        // $scope.checkRecipt(depositeHash,$scope.chain,1);

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

        $scope.confirmMainToChild = function(depositeHash,pid,flag){
            const childChainId = "child_"+(Number($scope.crossChain.id) - 1);
            console.log(childChainId)
            
            // var signRawObj = initSignRawDeposite($scope.account.address,"",depositeHash,$scope.nonce2,0,0,childChainId,1);

            var funcData = $scope.getPlayLoad(crossChainABI,"DepositInChildChain",[childChainId,depositeHash]);

            var signRawObj = initSignRawCrosschain(funcData,$scope.nonce2,1000000000,0,Number($scope.crossChain.id));

            var signData = signTx($scope.currentPrivateKey,signRawObj);

            // console.log("signRawObj_ confirmMainToChild",signRawObj);

            var obj2 = {};
            obj2.chainId =  Number($scope.crossChain.id);
            obj2.signData = signData;

            console.log(obj2)
            
            var url = APIHost +"/sendTx";
            $http({
                method:'POST',
                url:url,
                data:obj2
            }).then(function successCallback(res){
                console.log(res);
                removeLoading();
                if(res.data.result == "success"){

                    $('#transaction').modal('hide');
                    // var hash = res.data.data;;
                    // var url =   "/index.html?key="+hash+"&chain="+$scope.crossChain;
                    var hash = depositeHash;
                    var url =   "index.html?key="+hash+"&chain="+$scope.chain.id;
                    var html = '<a href="'+url+'" >Transaction hash:'+hash+'</a>';
                    successNotify(html);
                    var objt = {};
                    objt.hash = res.data.data;
                    objt.nonce = $scope.nonce;
                    objt.fromaddress = $scope.account.address;
                    objt.value = $scope.toAmount;
                    objt.gas = $scope.gasLimit;
                    objt.gasPrice = $scope.gasLimit;
                    objt.chainId = $scope.chain.id;
                    objt.chainName = $scope.chain.name;
                    objt.crossChainId=$scope.crossChain.id;
                    objt.crossChainName=$scope.crossChain.name;
                    objt.pid=pid;
                    objt.flag=flag;
                    console.log(objt)
                    saveMultiChainChild3(objt).then(function (aobj) {
                        console.log(aobj)
                    })

                }else{
                    swal(res.data.error);
                }

            },function errorCallback(res){
                swal("Internet error, please refresh the page");
            });
        }

        $scope.childToMainAmount;
        $scope.childToMain = function() {

            try{

                $scope.getNonce($scope.crossChain.id);

                const gasPrice = $scope.gasPrice*Math.pow(10,9);
                const amount = web3.toWei($scope.toAmount,"ether");

                $scope.childToMainAmount = amount;
                // var signRawObj = initSignRawDeposite($scope.account.address,amount,"",$scope.nonce,gasPrice,$scope.gasLimit,"",2);


                const childChainId = "child_"+(Number( $scope.chain.id) - 1);

                var funcData = $scope.getPlayLoad(crossChainABI,"WithdrawFromChildChain",[childChainId,amount]);

                var signRawObj = initSignRawCrosschain(funcData,$scope.nonce,gasPrice,$scope.gasLimit,$scope.chain.id);

                // var funcData = $scope.getPlayLoad(crossChainABI,"",paramArr);

                // var signRawObj = initSignRawContract();
              
                var signData = signTx($scope.currentPrivateKey,signRawObj);

                var obj = {};
                obj.chainId = $scope.chain.id;
                obj.signData = signData;
               

                var url = APIHost +"/sendTx";
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){

                    console.log(res);
                    if(res.data.result == "success"){

                        var depositeHash = res.data.data;

                        console.log(amount);
                        var objt = {};
                        objt.hash = depositeHash;
                        objt.nonce = $scope.nonce;
                        objt.fromaddress = $scope.account.address;
                        objt.value = $scope.toAmount;
                        objt.gas = $scope.gasLimit;
                        objt.gasPrice = gasPrice;
                        objt.chainId = $scope.chain.id;
                        objt.chainName = $scope.chain.name;
                        objt.crossChainId=$scope.crossChain.id;
                        objt.crossChainName=$scope.crossChain.name;
                        objt.flag=false;
                        console.log(objt)
                        addMultiChainTransaction(objt).then(function (aobj) {
                            console.log(aobj.data)
                            if(aobj.result=="success"){
                                $scope.checkRecipt(depositeHash,$scope.chain.id,2,amount,aobj.data,false);
                            }
                        })

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

        $scope.confirmChildToMain = function(depositeHash,childToMainAmount,pid,flag){

            const childChainId = "child_"+($scope.chain.id - 1);


            var funcData = $scope.getPlayLoad(crossChainABI,"WithdrawFromMainChain",[childChainId,$scope.childToMainAmount,depositeHash]);

            // console.log(funcData);

                var signRawObj = initSignRawCrosschain(funcData,$scope.nonce2,1000000000,0,0);

                // console.log(signRawObj);

            // var signRawObj = initSignRawDeposite($scope.account.address,"",depositeHash,$scope.nonce2,0,0,childChainId,3);

            var signData = signTx($scope.currentPrivateKey,signRawObj);
            

            var obj2 = {};
            obj2.chainId =  Number($scope.crossChain.id);
            obj2.signData = signData;
             obj2.childId = Number($scope.chain.id);
            var url = APIHost +"/sendTx";

            // console.log(obj2);
            $http({
                method:'POST',
                url:url,
                data:obj2
            }).then(function successCallback(res){
                console.log(res);
                removeLoading();
                if(res.data.result == "success"){

                    $('#transaction').modal('hide');
                    // var hash = res.data.data;
                    // var url =   "/index.html?key="+hash+"&chain="+$scope.crossChain;
                    var hash = depositeHash;
                    var url =   "index.html?key="+hash+"&chain="+$scope.chain.id;
                    var html = '<a href="'+url+'">Transaction hash:'+hash+'</a>';
                    successNotify(html);
                    var objt = {};
                    objt.hash = res.data.data;
                    objt.nonce = $scope.nonce;
                    objt.fromaddress = $scope.account.address;
                    objt.value = $scope.toAmount;
                    objt.gas = $scope.gasLimit;
                    objt.gasPrice = $scope.gasLimit;
                    objt.chainId = $scope.chain.id;
                    objt.chainName = $scope.chain.name;
                    objt.crossChainId=$scope.crossChain.id;
                    objt.crossChainName=$scope.crossChain.name;
                    objt.pid=pid;
                    objt.flag=flag;
                    console.log(objt)
                    saveMultiChainChild3(objt).then(function (aobj) {
                        console.log(aobj)
                    })
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