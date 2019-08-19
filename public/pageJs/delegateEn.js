angularApp.controller('myCtrl', function($scope, $http) {

    var web3 = new Web3();
    $scope.gasLimit = 21000;
    $scope.gasPrice = 10;
    $scope.nonce = 0;
    $scope.balance = 0;
    $scope.maxSendAmount = 0;
    $scope.pid = 0;
    $scope.chainId=0;
    $scope.epochNumber=0;
    $scope.dminAmount = 1000;
    $scope.cminAmount = 1;
    $scope.pageSize = 10;
    $scope.accountList = new Array();

    queryAccountList().then(function(resObj) {
        $scope.accountList = resObj.data;
        try {
            if ($scope.accountList.length > 0) {
                $scope.account = $scope.accountList[0];
                $scope.getRecommendList();
                $scope.getDelegateRewardList();
                $scope.getDelegateHistoryList();
                $scope.getDelegateRewardInfo();
            }
            if ($scope.accountList.length == 0) {
                removePageLoader();
                window.location.href = "wallet.html";
            }
        } catch (e) {
            console.log(e);
        }
    }).catch(function(e) {
        console.log(e, "error");
    })

    $scope.getBalance = function () {

        $scope.spin = "myIconSpin";
        var obj = {};
        obj.chainId = $scope.chainId;
        obj.address = $scope.account.address;
        var url = APIHost + "/getBalance";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            removePageLoader();
            $scope.spin = "";
            if (res.data.result == "success") {
                $scope.balance = res.data.data;
                $scope.toAmount=res.data.data;
                $scope.getMaxSendAmount();
            } else {
                swal("Error", res.data.error, "error");
            }

        }, function errorCallback(res) {
            swal("Error", "Internet error, please refresh the page", "erro");
        });


    }

    $scope.getMaxSendAmount = function() {
        let b = new BigNumber($scope.balance);
        let gl = new BigNumber($scope.gasLimit);
        let fee = gl.times($scope.gasPrice * Math.pow(10, 9)).dividedBy(Math.pow(10, 18));
        if(b.gt(fee)){
            $scope.maxSendAmount = b.minus(fee).decimalPlaces(18);
        }else{
            $scope.maxSendAmount = new BigNumber( 0);
        }
    }

    $scope.nonceFlag = true;
    $scope.getNonce = function() {
        $scope.nonceFlag = false;
        var obj = {};
        obj.chainId = $scope.chainId;
        obj.address = $scope.account.address;
        var url = APIHost + "/getNonce";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            if (res.data.result == "success") {
                $scope.nonce = Number(res.data.data);
                $scope.nonceFlag = true;
            } else {
                showPopup(res.data.message, 3000);
            }

        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });


    }

    // $scope.chainList = new Array();
    // $scope.chainList = [
    //     { name: "Main Chain", id: 0, chainId: "pchain"},
    //     { name: "Child Chain", id: 1, chainId: "child_0"}
    // ];
    //
    // $scope.chain = $scope.chainList[0];

    $scope.chainList = new Array();
    $scope.chainList = [
        // { name: "Main Chain", id: 0, chainId: "pchain" }
        { name: "Main Chain", id: 0, chainId: "pchain"}
    ];

    $scope.chain = $scope.chainList[0]

    queryChainList().then(function(resData) {
        for (var i = 0; i < resData.data.length; i++) {
            var obj = {};
            obj.name = resData.data[i].chainName;
            obj.id = resData.data[i].id;
            obj.chainId = resData.data[i].chainId;
            $scope.chainList.push(obj);
            $scope.chain = $scope.chainList[0];
        }
    }).catch(function(e) {
        console.log(e, "queryChainList error.");
    });

    $scope.getRecommendList = function() {
        var obj = {};
        obj.address = $scope.account.address;
        var url = APILocalHost + "/getCandidateList";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            console.log(res.data)
            if (res.data.result == "success") {
                $scope.childTime="Child Chain 1: "+res.data.estimatedtime[0].estimatedTime;
                $scope.pchainTime="Main Chain: "+res.data.estimatedtime[1].estimatedTime;
                $scope.recommendList = res.data.candidateList;
            } else {
                showPopup(res.data.message, 3000);
            }

        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });


    }

    $scope.getDelegateRewardInfo = function() {
        var obj = {};
        obj.address = $scope.account.address;
        var url = APIHost + "/getDelegateRewardInfo";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            console.log(res.data)
            if (res.data.result == "success") {
                $scope.delegateAmount=res.data.total_delegateBalance;
                $scope.allRewards=res.data.total_rewardBalance;
                $scope.rateOfReturn=res.data.dailyrate;
                $scope.refunding=res.data.total_pendingRefundBalance;
                $scope.cnum=res.data.cnum;

            } else {
                showPopup(res.data.message, 3000);
            }

        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });
    }


    $scope.getDelegateRewardList = function() {
        var obj = {};
        obj.address = $scope.account.address;
        var url = APIHost + "/getDelegateRewardList";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            if (res.data.result == "success") {
                $scope.delegateRewardList = res.data.data;
            } else {
                showPopup(res.data.message, 3000);
            }

        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });

    }



    $scope.getDelegateHistoryList = function() {
        var obj = {};
        obj.address = $scope.account.address;
        var url = APIHost + "/getDelegateHistoryList";
        $http({
            method: 'POST',
            url: url,
            data: obj
        }).then(function successCallback(res) {
            if (res.data.result == "success") {
                console.log(res.data)
                $scope.delegateHistoryList = res.data.data;
            } else {
                showPopup(res.data.message, 3000);
            }

        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });

    }



    $scope.getRewardDetailList = function (pageNo,pageSize,pid) {
        var obj = {};
        obj.pageNo = pageNo;
        obj.pageSize = pageSize;
        obj.pid = pid;
        $http({
            method: 'POST',
            url: APIHost + "/getRewardDetailList",
            data: obj
        }).then(function successCallback(res) {
            $scope.rewardDetailList = res.data.data;
            $scope.pages = Math.ceil(res.data.total / $scope.pageSize);
            $scope.selPage = pageNo;
            $scope.newPageList = $scope.pageList;
            if ($scope.newPageList.length > 0) {
                $scope.pageList = $scope.newPageList;
            } else {
                $scope.newPages = $scope.pages > 5 ? 5 : $scope.pages;
                for (var i = 0; i < $scope.newPages; i++) {
                    $scope.pageList.push(i + 1);
                }
            }
        }, function errorCallback(res) {
            console.log('error');
        });
    };

    $scope.selectPage = function (page) {
        if (page < 1 || page > $scope.pages) return;

        if (page > 2) {
            var newpageList = [];
            for (var i = page - 3; i < (page + 2 > $scope.pages ? $scope.pages : page + 2); i++) {
                newpageList.push(i + 1);
            }
            $scope.pageList = newpageList;
        }
        $scope.selPage = page;
        $scope.isActivePage(page);
        $scope.getRewardDetailList(page, $scope.pageSize, $scope.pid);
    };

    $scope.isActivePage = function (page) {
        return $scope.selPage == page;
    };
    $scope.Previous = function () {
        $scope.selectPage($scope.selPage - 1);
    };
    $scope.Next = function () {
        $scope.selectPage($scope.selPage + 1);
    };


    $scope.showDetail=function(id){
        $scope.pageList = [];
        $scope.pid=id;
        $scope.getRewardDetailList(1,$scope.pageSize,$scope.pid);
        $('#rewardDetail').modal('show');

    }

    $scope.checkDelegate=function(item){
        console.log(item)
        $scope.toAmount="";
        $scope.invitationiCode="";
        $scope.toAddress="";
        if(item==undefined){
            $scope.custom=true;
            $scope.chainId=0;
        }else {
            $scope.custom="";
            $scope.chainId=item.chainId;
            $scope.toAddress=item.address;
        }
        $scope.getBalance();
        $('#delegateInfo').modal('show');

    }

    $scope.cancelDelegate=function(item){
        $scope.cancleAmount="";
        $scope.chainId=item.chainId;
        $scope.txStatus=item.tx_status;
        $scope.cancleCandidate=item.address;
        $('#cancelDelegateInfo').modal('show');
    }

    $scope.currentPrivateKey = "";
    $scope.confirmPassword = function() {
        if ($scope.account == undefined) {
            swal("Please create a wallet address at first!");
            return;
        }
        queryPrivateKey($scope.account.address).then(function(result) {

            if (result.result == "success") {
                var dePri = AESDecrypt(result.data.privateKey, $scope.inputPassword);
                if (dePri) {
                    $scope.currentPrivateKey = dePri;
                    $scope.inputPassword = "";
                    $scope.$apply();
                    $('#enterPassword').modal('hide');
                    $scope.submit();

                } else {
                    swal("Password error!");
                }
            } else {
                swal("Password error!");
            }
        }).catch(function(e) {
            swal("Password error!");
        })

    };


    $scope.selectchain = function(chainId) {
        $scope.chainId=chainId;
        $scope.getBalance();
    }


    $scope.delegateType;
    $scope.showEnterPwd = function(type) {
        if(type==0){
            if ($scope.dminAmount>( new BigNumber($scope.toAmount))) {
                let tips1 = "Amount error";
                let tips2 = "min :" + $scope.dminAmount + " PI"
                swal(tips1, tips2, "error");
                return;
            }
            $('#delegateInfo').modal('hide');
        }else{
            if ($scope.cminAmount>( new BigNumber($scope.cancleAmount))) {
                let tips1 = "Amount error";
                let tips2 = "min :" + $scope.cminAmount + " PI"
                swal(tips1, tips2, "error");
                return;
            }
            $('#cancelDelegateInfo').modal('hide');
        }
        $scope.delegateType = type;
        $scope.getMaxSendAmount();
        if (  $scope.maxSendAmount.lt( new BigNumber($scope.toAmount))) {
            let tips1 = "Insufficient Balance ";
            let tips2 = "Max Amount :" + $scope.maxSendAmount + " PI"
            swal(tips1, tips2, "error");
        } else {
            $('#enterPassword').modal('show');
        }
    }

    $scope.showIntroduction=function (introduction) {
        $scope.introduction=introduction;
        $('#delegateIntroduction').modal('show');
    }

    $scope.submit = function() {
        $scope.getNonce();
        var txFee = $scope.gasLimit * $scope.gasPrice * Math.pow(10, 9);
        $scope.txFee = web3.fromWei(txFee, 'ether');
        $('#transaction').modal('show');
    }

    $scope.gasChanged = function() {
        $scope.gasPrice = jQuery("#gasPrice").val();

    }

    $scope.getPlayLoad = function(abi, funName, paramArr) {
        var playLoadData = TxData(abi, funName, paramArr);
        return playLoadData;
    }

    $scope.sendTx = function () {

        try {
            const gasPrice = $scope.gasPrice * Math.pow(10, 9);
            let amount;
            var nonce = $scope.nonce;
            var funcData;
            var signRawObj;
            if ($scope.delegateType == 0) {
                //delegate
                amount = "0x" + decimalToHex(web3.toWei($scope.toAmount, 'ether'));
                funcData = $scope.getPlayLoad(DelegateABI, "Delegate", [$scope.toAddress]);
                signRawObj = initSignBuildInContract(funcData, nonce, gasPrice, $scope.gasLimit, $scope.chainId, amount);
                if ($scope.invitationiCode) signRawObj.data = $scope.invitationiCode;
                console.log(nonce, gasPrice, $scope.gasLimit, $scope.chainId, amount, $scope.toAddress, $scope.toAmount)
            } else if ($scope.delegateType == 1) {
                //cancle delegate
                amount = "0x" + decimalToHex(web3.toWei($scope.cancleAmount, 'ether'));
                funcData = $scope.getPlayLoad(DelegateABI, "CancelDelegate", [$scope.cancleCandidate, amount]);
                amount = 0;
                signRawObj = initSignBuildInContract(funcData, nonce, gasPrice, $scope.gasLimit, $scope.chainId, amount);
                console.log(funcData, nonce, gasPrice, $scope.gasLimit, $scope.chainId, amount)
            }

            var signData = signTx($scope.currentPrivateKey, signRawObj);
            $scope.currentPrivateKey = "";

            var obj = {};
            obj.chainId = $scope.chainId;
            obj.signData = signData;
            console.log(obj)
            loading();
            var url = APIHost + "/sendTx";

            $http({
                method: 'POST',
                url: url,
                data: obj
            }).then(function successCallback(res) {
                removeLoading();
                if (res.data.result == "success") {
                    $('#transaction').modal('hide');
                    var hash = res.data.data;
                    var url = "index.html?key=" + hash + "&chain=" + $scope.chainId;
                    var html = '<a href="' + url + '"  >Transaction hash:' + hash + '</a>';
                    successNotify(html);
                    var objt = {};
                    if ($scope.delegateType == 0) {
                        objt.hash = hash;
                        objt.address = $scope.account.address;
                        objt.candidate = $scope.toAddress;
                        objt.status = 1;
                        objt.amount = $scope.toAmount;
                        objt.chainId = $scope.chainId;
                        $scope.addDelegateInfo(objt);
                    } else if ($scope.delegateType == 1) {
                        console.log("cancle delegate>>>>>>>>>>>>>>>>>>>>>>>>>.")
                        objt.hash = hash;
                        objt.address = $scope.account.address;
                        objt.candidate = $scope.cancleCandidate;
                        objt.status = 0;
                        objt.amount = $scope.cancleAmount;
                        objt.chainId = $scope.chainId;
                        objt.txStatus = $scope.txStatus;
                        $scope.addCancelDelegate(objt);
                    }
                } else {
                    swal(res.data.error);
                }

            }, function errorCallback(res) {
                showPopup("Internet error, please refresh the page");
            });

        } catch (e) {
            swal(e.toString());
        }

    }

    $scope.addDelegateInfo = function (obj) {
        $http({
            method: 'POST',
            url: APIHost + "/addDelegateInfo",
            data: obj
        }).then(function successCallback(res) {
            console.log(res)
            if (res.data.result == "success") {
                $scope.getDelegateRewardList();
                $scope.getDelegateHistoryList();
                $scope.$apply();
            }
        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });

    }

    $scope.addCancelDelegate = function (obj) {
        $http({
            method: 'POST',
            url: APIHost + "/addCancelDelegate",
            data: obj
        }).then(function successCallback(res) {
            if (res.data.result == "success") {
                $scope.getDelegateRewardList();
                $scope.getDelegateHistoryList();
                $scope.getDelegateRewardInfo();
                $scope.$apply();
            }
        }, function errorCallback(res) {
            showPopup("Internet error, please refresh the page");
        });

    }

});

$(function() {
    menuActive(5);
});