


var web3 = new Web3();
var counter = 0;
var total = 0;
function s3(n){
	for(var i=0;i<n;i++){
		total++;
		var random = Math.floor( Math.random()*10000000000 ).toString();
		var sr = Number(web3.sha3(random));
		if(sr < Math.pow(10,75)){
			counter++;
			console.log(sr,total,counter);
		} 
	}
	console.log(total,"finish");	
}

s3(1000000);
