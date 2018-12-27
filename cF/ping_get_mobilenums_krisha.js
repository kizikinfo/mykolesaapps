var casper = require('casper').create({
	clientScripts:  [
	        'public/lib/jquery-3.1.1.min.js'      // These two scripts will be injected in remote DOM on every request
	    ],
	    pageSettings: {
	        loadImages: true,//The script is much faster when this field is set to false
	        loadPlugins: true,
	        userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
	    },
	    logLevel: "info",              // Only "info" level messages will be logged
	    verbose: false
	}
);

var fs = require('fs');
var system = require('system');
//var env = system.env;
var path = fs.absolute(system.args[3]).split('/').slice(0,-1).join('/');
var xpath = require('casper').selectXPath;
//console.log('path: '+path);


var str = '', n, strar = [];
var url = 'https://krisha.kz/pro/specialist/expert-po-nedvizhimosti/almaty/';

openProfile();

function openProfile(){
	console.log('trying to open...');
	//console.log('instagramm login: '+identifier);
	casper.start().thenOpen(url, function(){
		this.waitForSelector(xpath('(//div[@id="pages"])'), 
			function() {
				console.log('specialists page opened limit defined');
				//this.capture(path+'/img/carsPage.png');
				var lim = this.evaluate(function(){
					var pelem = document.getElementById('pages').querySelectorAll('span');
					var lim = parseInt(pelem[pelem.length-1].querySelector('a').innerHTML);
					return lim;
				});
				fs.write(path+'/cars.txt', JSON.stringify(lim), 'w');
			},
			function() {
				console.log('heeeeeeeeey error here1');
			},
		20000);
	});

	casper.then(function(){
		//console.log('check cars.txt file');
		next(casper.cli.args[0]);
	});

	
}


function next(num){
	n = parseInt(fs.read(path+'/cars.txt'));
	nexthelper(num);
}


function nexthelper(num){
	casper.thenOpen(url+'?page='+num.toString(), function(){
		this.waitForSelector(xpath('(//div[@id="pages"])'), 
			function() {
				console.log('specialists page opened');
				//this.capture(path+'/img/carsPage.png');
				strar = this.evaluate(function(){
					var st=[];					
					//var el = document.getElementsByClassName('photo-count');
					var el = document.getElementsByClassName('phones');
					for(var i = 0; i<el.length; i++){
						st.push(el[i].innerHTML.replace(/ /g, '').replace(/\(/g, '').replace(/\)/g, ''));
					}
					return st;
				});
				
				console.log('num: '+num+', n: '+n);	
				//console.log(strar);
				if(num===n){
					str = strar.toString();
					fs.write(path+'/temp.txt', str, 'w');
					strar = [];
					str = '';
					console.log('soninajetti');
				}else{
					str = strar.toString()+',';
					fs.write(path+'/temp.txt', str, 'w');
					strar = [];
					str = '';
					console.log('endofstrar');
				}
			},
			function() {
				console.log('heeeeeeeeey error here2');
			},
		180000);
	});

}


casper.run();