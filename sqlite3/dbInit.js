/**
 * Created by skykingit on 2018/12/01.
 */


var sqlite3 = require('sqlite3').verbose();
const path = require('path')
var Promise = require("bluebird");
var Setting = require("../lib/setting.js");
const DBPath = Setting.DBPath;

console.log(DBPath);

var db;
class DB{
	constructor(){
		db = new sqlite3.Database(DBPath,function(data){
		    // console.log(data);
		});
	}

	init(){
		console.log("init code is here");
	}

}

module.exports = new DB();