     angularApp.controller('myCtrl',function ($scope, $http,$cookieStore){


            $scope.gasPrice = 10;

            $scope.getTps = function () {
                var obj = {};

                var now = Math.round((new Date()).getTime()/1000);
                var timeSpan = 12*3600;

                obj.starttime = Math.round(now - timeSpan);
                obj.endtime = now;

                var url = APIHost +"/getTps";
                $http({
                    method:'POST',
                    url:url,
                    data:obj
                }).then(function successCallback(res){
                    console.log(res);
                    if(res.data.data){
                            var tpsData = res.data.data.reverse();

                             var dom = document.getElementById("tps");
                            var myChart = echarts.init(dom);
                            var app = {};
                            option = null;

                            var date = new Array();

                            var data = new Array();

                            for (var i = 0; i < tpsData.length; i++) {
                                var current = tpsData[i];
                                var now = new Date(current.timestamp*1000);
                                var currentTime = [now.getMonth() + 1,now.getDate()].join('/')+" "+[now.getHours(),now.getMinutes(),now.getSeconds()].join(':')
                                date.push(currentTime);
                                var tps = current.tpsnum;
                                data.push(tps);
                            }


                            option = {
                                tooltip: {
                                    trigger: 'axis',
                                    position: function (pt) {
                                        return [pt[0], '10%'];
                                    }
                                },toolbox: {
                                    show:false,
                                    feature: {
                                        dataZoom: {
                                            yAxisIndex: 'none'
                                        },
                                        restore: {},
                                        saveAsImage: {}
                                    }
                                },
                                title: {
                                    left: 'center',
                                    text: 'PCHAIN TPS',
                                },xAxis: {
                                    type: 'category',
                                    boundaryGap: false,
                                    data: date
                                },
                                yAxis: {
                                    type: 'value',
                                    boundaryGap: [0, '50%']
                                    ,max:140000
                                },
                                dataZoom: [{
                                    type: 'inside',
                                    start:80,
                                    end:100
                                }, 
                                {
                                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                                    handleSize: '80%',
                                    handleStyle: {
                                        color: '#fff',
                                        shadowBlur: 3,
                                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                                        shadowOffsetX: 2,
                                        shadowOffsetY: 2
                                    }
                                }],
                                
                                series: [
                                    {
                                        name:'TPS',
                                        type:'line',
                                        smooth:false,
                                        symbol: 'none',
                                        sampling: 'max',
                                        itemStyle: {
                                            normal: {
                                                color: 'rgb(255, 70, 131)'
                                            }
                                        },
                                        areaStyle: {
                                            normal: {
                                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                                    offset: 0,
                                                    color: 'rgb(255, 158, 68)'
                                                }, {
                                                    offset: 1,
                                                    color: 'rgb(255, 70, 131)'
                                                }])
                                            }
                                        },
                                        data: data
                                    }
                                ]
                            };
                            ;
                            if (option && typeof option === "object") {
                                myChart.setOption(option, true);
                            }
                    }else{
                        showPopup("Internet error, please refresh the page");
                    }

                    

                },function errorCallback(res){
                   
                    showPopup("Internet error, please refresh the page");
                });
            }

            $scope.getTps();

     });
    $(function(){
        menuActive(6);
    });