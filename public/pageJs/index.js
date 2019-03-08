    var web3 = new Web3();

    angularApp.controller('myCtrl', function($scope, $http) {

        $scope.gasPrice = 10;
        $scope.chainList = [
            {name:"Main Chain",id:0,chainId:"pchain"}
        ];
        queryChainList().then(function (resData) {
             for(var i=0;i<resData.data.length;i++){
                 var obj = {};
                 obj.name = resData.data[i].chainName;
                 obj.id = resData.data[i].id;
                 obj.chainId = resData.data[i].chainId;
                 $scope.chainList.push(obj);
             }
             $scope.$apply();
         }).catch(function (e) {
             console.log(e, "queryChainList error.");
         })

        $scope.chainId = 0;

        $scope.result = {};

        $scope.type;

        $scope.search = function(key, chain) {

            var keyWord = key ? key : $scope.key;
            var currentId = angular.copy($scope.chainId)
            $scope.chainId = chain ? chain : currentId

            var resultObj = {};

            loading();
            var obj = {};

            var api;

            var addressReg = /^[a-fA-F0-9]{40}$|^(0x)?[0-9a-fA-F]{40}$/;
            var hashReg = /^[a-fA-F0-9]{64}$|^(0x)?[0-9a-fA-F]{64}$/;
            var blockNumberReg = /^[1-9]|[1-9][0-9]*$/;
            // if(addressReg.test(keyWord)){
            //     api = "getAddress"
            //     resultObj.type = "address";
            //     resultObj.name = "Block Information";
            // }else 
            if (hashReg.test(keyWord)) {
                api = APIHost + "/getTxHash"
                resultObj.type = "tx";
                resultObj.name = "Transaction Information";

                obj.txHash = keyWord;
            } else if (keyWord == 0 || (keyWord.indexOf("0x") == -1 && blockNumberReg.test(keyWord))) {
                api = APIHost + "/getBlock"
                resultObj.type = "block";
                resultObj.name = "Block Information";

                obj.blockNumber = keyWord;
            } else {
                showPopup("Data format error");
                removeLoading();
                return false;
            }

            $scope.type = resultObj.type;

            if (api) {
                obj.chainId = $scope.chainId;
                // console.log(obj);
                $http({
                    method: 'POST',
                    url: api,
                    data: obj
                }).then(function successCallback(res) {
                    removeLoading();
                    // console.log(res);
                    if (res.data.result == "success") {

                        resultObj.data = res.data.data;
                        $scope.result = resultObj;
                        // console.log($scope.result);
                    } else {
                        var str = "Sorry, we are unable to locate this Transaction Hash"
                        if (resultObj.type == "block") {
                            str = "Unable to locate Block #" + keyWord;
                        }
                        showPopup(str);

                    }

                }, function errorCallback(res) {
                    // console.log(res);
                    removeLoading();
                     var str = "Sorry, we are unable to locate this Transaction Hash"
                    if (resultObj.type == "block") {
                        str = "Unable to locate Block #" + keyWord;
                    }
                    showPopup(str);
                });
            }

        }

        var key = GetQueryString("key");
        var chain = Number(GetQueryString("chain"));
        if (key) {
            $scope.search(key, chain);
        }

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