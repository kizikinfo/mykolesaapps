var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var https = require('https');
var mongoose = require('mongoose');
var port = process.env.PORT || 2000;
var fs = require('fs');
const Account = require('./models/account');

var util = require('util');
var exec = require('child_process').exec;

var stime = new Date().getTime();

mongoose.connect('mongodb://kolesadb:posmotrim2018@ds263109.mlab.com:63109/kolesadb');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', function(req, res){
	res.send({"st":"yes"});
});

var st = '', tempString = '';
var uname = 'kolesa';

////////////////////////in case of commenting//////////////////////////////
var ar = [];
Account.findOne({username: uname}, function(err, obj) { 
    if(err) console.log(err);
    ar = obj.str.split('?');  
	ping(obj.num);
	//ping('1');
});
///////////////////////////////////////////////////////////////////////////

/*
var qaz = new Account({
  username: uname,
  str: '',
  num: 1
});

qaz.save(function(err) {
  if (err) throw err;
  console.log('User saved successfully!');
});
*/

/*app.get('/startPing', function(req, res){
	res.send({"startPing":"yes"});
});*/

app.get('/startPing', function(req, res){
	res.send({"st":"ok"});
});



app.listen(port);



function ping(nmbr){
	var p = require('child_process').spawn('casperjs', ['cF/ping_get_mobilenums_kolesa.js', nmbr]);
	p.stdout.on('data', function(data) {
	    console.log(data.toString());
	    st = data.toString();
	    if(st.indexOf('endofstrar')>-1){	    	
		    Account.findOne({username: uname}, function(err, obj) { 
	            if(err) console.log(err);
	            tempString = fs.readFileSync(__dirname+'/cF/temp.txt', 'utf-8');
				//console.log('tempString length: '+tempString.split('?').length);
				obj.str+= tempString;
				obj.num++;
	            obj.save(function(err){
	                if(err) console.log(err);
	                restart();
	            });
	        });
	    }
		if(st.indexOf('soninajetti')>-1){
	    	Account.findOne({username: uname}, function(err, obj) { 
	            if(err) console.log(err);
	            tempString = fs.readFileSync(__dirname+'/cF/temp.txt', 'utf-8');
				//console.log('tempString length: '+tempString.split('?').length);
				obj.str+= tempString;
	            obj.save(function(err){
	                if(err) console.log(err);
	                console.log('jetti sonina!');
	            });
	        });
	    }
		if(st.indexOf('heeeeeeeeey')>-1){
	    	console.log('error occured somewhere');
			restart();
	    }
	});
}

var interval = setInterval(function(){
	var passedTime = parseInt(howMuchTimePassed(stime));
	//console.log(passedTime);
	if(parseInt(passedTime)>239){
		clearInterval(interval);
		restart();
	}
}, 1000);



function restart(){
	console.log('restarting........................................');
	var command = 'curl -n -X DELETE https://api.heroku.com/apps/kolesabt/dynos/web.1  -H "Content-Type: application/json" -H "Accept: application/vnd.heroku+json; version=3" -H "Authorization: Bearer 91975284-baee-440b-943f-592d5f6e674f"'

	child = exec(command, function(error, stdout, stderr){
		//console.log('stdout: ' + stdout);
		//console.log('stderr: ' + stderr);
		if(error !== null){
		    console.log('exec error: ' + error);
		}
	});
}

function howMuchTimePassed(t){
	var currentTime = new Date().getTime();
	return Math.round(Math.abs((currentTime - t)/1000));
}
