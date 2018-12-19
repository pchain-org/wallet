
     angularApp.controller('myCtrl',function ($scope, $http,$cookieStore){

        $scope.gasPrice = 10;

     });
     $(function(){
         menuActive(5);

             var dom = document.getElementById("node");
            var myChart = echarts.init(dom);
            var app = {};
            option = null;

            var geoCoordMap, areaData, areaData2;
            APIHost = "https://air.pchain.wang";
            var url = APIHost +"/getNodesList";

            var obj = {};
            $.ajax({
               url:url,
               type:"POST",
               data:obj,
               success:function(data){
                    var location = {
                        "California": [-118.243685,34.052234],
                        "Oregon": [-120.5542012000,43.8041334000],
                        "Virginia": [-78.6568942000,37.4315734000],
                        "London": [-0.127758,51.507351],
                        "Singapore": [103.819836,1.352083],
                        "Tokyo": [139.691706,35.689487],
                        "Frankfurt":[8.6821267000,50.1109221000]
                    };

                    var resultList = fliterIPList(data.data);


                    geoCoordMap = location;

                    areaData = resultList.ipList;

                    areaData2 = resultList.nodeList;

                    function makeMapData() {
                        var mapData = [];
                       for(var key in geoCoordMap){
                            var obj = {};
                            obj.name = key;
                            obj.value = geoCoordMap[key];
                            mapData.push(obj);
                       }

                        return mapData;
                    };

                    option = {
                        backgroundColor:"#ffffff",
                        tooltip: {
                            trigger: 'item',
                            formatter: function (params) {
                                var data = areaData[params.name];
                                var html = params.name + '<br/>';
                                for(var i=0;i<data.length;i++){
                                    if(i%7 == 0){
                                        html += "<br>"+data[i];
                                    }else{
                                        html += ", "+data[i];
                                    }
                                    
                                }
                                return html;
                            }
                        },
                        toolbox: {
                            show: false
                        },
                        brush: {
                            geoIndex: 0,
                            brushLink: 'all',
                            inBrush: {
                                opacity: 1,
                                symbolSize: 14
                            },
                            outOfBrush: {
                                color: '#000',
                                opacity: 0.2
                            },
                            z: 10
                        },
                        geo: {
                            map: 'world',
                            silent: true,
                            label: {
                                
                            },
                            itemStyle: {
                                color:"#583535"
                            },
                            // regions:[
                            // {
                            //     name:"China",
                            //     itemStyle:{
                            //         areaColor:"green"
                            //     }
                            // },{
                            //     name:"United States",
                            //     itemStyle:{
                            //         areaColor:"green"
                            //     }
                            // }],
                            left: '6%',
                            top: 40,
                            bottom: '50',
                            right: '6%',
                            roam: true
                        },
                        series: [
                            {
                                name: 'PCHAIN Super Node',
                                type: 'scatter',
                                coordinateSystem: 'geo',
                                data: makeMapData(),
                                activeOpacity: 1,
                                symbolSize: 30,
                                // symbolSize: function (data) {
                                //     return Math.max(5, data[2] / 5);
                                // },
                                label:{
                                    show:true,
                                    formatter:function(params){
                                        var data = areaData2[params.name];
                                        return data;
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        borderColor: '#fff',
                                        color: 'green',
                                    }
                                }
                            }
                        ]
                    };

                   if (option && typeof option === "object") {
                       myChart.setOption(option, true);
                   }
               }
           });

     });