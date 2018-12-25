 angularApp.controller('myCtrl',function ($scope, $http){


        $scope.gasLimit = 25000;
        $scope.gasPrice = 10;
        $scope.nonce = 0;

        $scope.showAddData = function(){
            $scope.addDataFlag = true;
        }

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

        $scope.nonceFlag = true;
        $scope.getNonce = function(){
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
                    $scope.nonceFlag = true;
                }else{
                    showPopup(res.data.message,3000);
                }

            },function errorCallback(res){
                showPopup("Internet error, please refresh the page");
            });
        }
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

        $scope.chainId = 0;

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
                   $scope.getNonce();
                }else{
                    // window.location.href = "wallet.html"
                }
            }else{
                // window.location.href = "wallet.html"
            }
        }catch(e){
            //console.log(e);
        }

         $scope.selectAccount = function(){
           $scope.getNonce(); 
           $scope.getBalance();
        }

        var web3 = new Web3();
        var toAmountValue ;
        $scope.submit = function () {
            $scope.getNonce();
            var txFee = $scope.gasLimit*$scope.gasPrice*Math.pow(10,9);
            $scope.txFee = web3.fromWei(txFee,'ether');

            // toAmountValue = jQuery("#toAmount").val();

            // jQuery("#modalToAmount").html(toAmountValue+"TPAI");

            // console.log(toAmountValue);

            $('#transaction').modal('show');
        }

        $scope.gasChanged = function(){
            $scope.gasPrice = jQuery("#gasPrice").val();

        }

         
         $scope.sendTx = function () {

            try{
                const gasPrice = $scope.gasPrice*Math.pow(10,9);
                // const gasPrice = 20*Math.pow(10,9);

                const amount = web3.toWei($scope.toAmount,"ether");
                 // const amount = web3.toWei(toAmountValue,"ether");            

                var nonce = $scope.nonce;
                var signRawObj = initSignRawPAI($scope.toAddress, amount,nonce,gasPrice,$scope.gasLimit);

                if($scope.data) signRawObj.data = $scope.data;

                var signData = signTx($scope.account.private,signRawObj);

                var obj = {};
                obj.chainId = $scope.chainId;
                obj.signData = signData;
                // console.log(obj);
                loading();
                var url = APIHost +"/sendTx";
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
                    removeLoading();
                    if(res.data.result == "success"){

                        $('#transaction').modal('hide');
                        var hash = res.data.data;
                        var url =   "index.html?key="+hash+"&chain="+$scope.chainId;
                        var html = '<a href="'+url+'"   target="_blank">Transaction hash:'+hash+'</a>';
                       successNotify(html);
                    }else{
                        swal(res.data.error);
                    }

                },function errorCallback(res){
                    console.log(res);
                    showPopup("Internet error, please refresh the page");
                });

            }catch(e){
                console.log(e);
                swal(e.toString());
            }
            
        }

     });
     $(function(){
         menuActive(3);
     });