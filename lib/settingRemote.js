/**
 * Created by skykingit on 2018/12/01.
 */

const { app } = require("electron").remote;
const path = require('path');

class Setting{
	constructor(){}

	get userDataPath() {
	    return app.getPath('userData');
	}

	get appDataPath() {
		return app.getAppPath();
	}

	get DBPath(){
		return path.join(this.userDataPath,"pchainWallet");
	}
} 

module.exports = new Setting();