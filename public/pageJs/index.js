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

        $scope.addrPageSize = 20;
        $scope.addrPageNo = 1;
        $scope.blockPageSize = 20;
        $scope.blockPageNo = 1;
        $scope.txTotal;
        $scope.txListChain;
        $scope.txListKey;
        $scope.search = function(key, chain,searchType) {

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
            if(addressReg.test(keyWord) || searchType == 1){
                api = APIHost + "/getScanTxList"
                if(searchType == 1){
                    resultObj.type = "blockTxs";
                    resultObj.name = "Block Transaction Information";

                    obj.blockHash = keyWord;
                    obj.pageNo = $scope.blockPageNo;
                    obj.pageSize = $scope.blockPageSize;
                }else{
                    resultObj.type = "address";
                    resultObj.name = "Address Transaction Information";

                    obj.address = keyWord;
                    obj.pageNo = $scope.addrPageNo;
                    obj.pageSize = $scope.addrPageSize;
                }
                $scope.txListKey = keyWord;
                $scope.txListChain = $scope.chainId;

            }else if (hashReg.test(keyWord)) {
                api = APIHost + "/getScanTx"
                resultObj.type = "tx";
                resultObj.name = "Transaction Information";

                obj.hash = keyWord;
            } else if (keyWord == 0 || (keyWord.indexOf("0x") == -1 && blockNumberReg.test(keyWord))) {
                api = APIHost + "/getScanBlockInfo"
                resultObj.type = "block";
                resultObj.name = "Block Information";

                obj.blockKey = keyWord;
            } else {
                swal("Data format error");
                removeLoading();
                return false;
            }

            $scope.type = resultObj.type;

            if (api) {
                obj.chainId = $scope.chainId;
                console.log(obj);
                $http({
                    method: 'POST',
                    url: api,
                    data: obj
                }).then(function successCallback(res) {
                    removeLoading();
                    console.log(res);
                    if (res.data.result == "success") {
                        if(resultObj.type == "block" || resultObj.type == "tx"){
                            resultObj.data = $scope.fliterBlockInfo(res.data.data);
                            $scope.result = resultObj;
                        }else{
                           resultObj.data = res.data.data;
                           $scope.result = resultObj;
                           $scope.txList = res.data.data;
                           $scope.txTotal = res.data.total;
                        }
                    
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

        $scope.moreTx = function(){
            var obj = {}; 
            obj.chainId = $scope.txListChain;

            if($scope.result.type == "blockTxs"){
                obj.blockHash = $scope.txListKey;
                obj.pageNo = $scope.blockPageNo++;
                obj.pageSize = $scope.blockPageSize;
            }else{
                obj.address = $scope.txListKey;
                obj.pageNo = $scope.addrPageNo++;
                obj.pageSize = $scope.addrPageSize;
            }
            loading();
            console.log(obj);
            api = APIHost + "/getScanTxList"
            $http({
                method: 'POST',
                url: api,
                data: obj
            }).then(function successCallback(res) {
                removeLoading();
                console.log(res);
                if (res.data.result == "success") {
                    $scope.txList = _.concat($scope.txList,res.data.data);
                    $scope.txTotal = res.data.total;
                } 

            }, function errorCallback(res) {
                removeLoading();
            });
        }


        $scope.getBlockList = function(){
                var obj = {}; 
                obj.chainId = 0; //default main chain
                obj.pageNo = 1;
                obj.pageSize = 20;
                obj.blockKey = "";
                console.log(obj);
                api = APIHost + "/getScanBlockList"
                $http({
                    method: 'POST',
                    url: api,
                    data: obj
                }).then(function successCallback(res) {
                    removeLoading();
                    console.log(res);
                    if (res.data.result == "success") {
                        $scope.blockList = res.data.data;
                    } 

                }, function errorCallback(res) {
                    removeLoading();
                });
        }

        var key = GetQueryString("key");
        var chain = Number(GetQueryString("chain"));
        if(chain == "pchain"){
            chain = 0;
        }else if(chain == "child_0"){
            chain = 1;
        }
        var type = Number(GetQueryString("type"));
        if (key) {
            $scope.search(key, chain,type);
        }else{
            $scope.getBlockList();
        }

        $scope.fliterBlockInfo = function(bObj){
            const web3 = new Web3();
            var result = {};
            var current = _.omit(bObj,["arrived","createdAt","fork","id","propagation","updatedAt","time","logsBloom","difficulty"]);
            current.chainId = $scope.switchChainId(current.chainId);
            current.timestamp = (new Date(current.timestamp*1000)).toGMTString();
            if(current.value)
            current.value = web3.fromWei(current.value,'ether')+" PI";
            if(current.gasPrice)
            current.gasPrice = web3.fromWei("0x"+current.gasPrice,'gwei') + "gwei";
            result = current;
            return result;


        }

        $scope.switchChainId = function(cId){
            if(cId == 0){
                return "pchain";
            }else if(cId == 1){
                return "child_0";
            }
        }

        $scope.processData = function(val,key){
            var result = val;
            if(key == "timestamp"){
                var time = new Date(val*1000);
                result = time;
            }

            return result;

        }

    });
    $(function() {
        menuActive(1);
        removePageLoader();
    });