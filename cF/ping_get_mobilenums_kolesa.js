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
	    verbose: false,
		viewportSize : {width: 1280, height: 1024}
	}
);
var page = require('webpage').create();

var fs = require('fs');
var system = require('system');
//var env = system.env;
var path = fs.absolute(system.args[3]).split('/').slice(0,-1).join('/');
var xpath = require('casper').selectXPath;
//console.log('path: '+path);


var str = '', n, strar = [];
var url = 'https://kolesa.kz/cars/region-akmolinskaya-oblast/';

openProfile();

function openProfile(){
	console.log('trying to open...');
	//console.log('instagramm login: '+identifier);
	casper.start().thenOpen(url, function(){
		this.waitForSelector(xpath('(//div[@class=" finded"])'), 
			function() {
				console.log('cars page opened limit defined');
				//this.capture(path+'/img/carsPage.png');
				var lim = this.evaluate(function(){
					var pelem = document.getElementsByClassName('paginator clearfix')[0].querySelectorAll('li');
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
		next(casper.cli.args[0]);
	});

	
}


function next(num){
	n = parseInt(fs.read(path+'/cars.txt'));
	if(num===n){		
		fs.write(path+'/temp.txt', str, 'w');
		strar = [];
		str = '';
		console.log('soninajetti');
	}else{
		nexthelper(num);
	}
}


function nexthelper(num){
	casper.thenOpen(url+'&page='+num.toString(), function(){
		this.waitForSelector(xpath('(//div[@class=" finded"])'), 
			function() {
				console.log('cars page opened');
				//this.capture(path+'/img/carsPage.png');
				strar = this.evaluate(function(){
					var st=[];					
					//var el = document.getElementsByClassName('photo-count');
					var el = document.getElementsByClassName('row list-item');
					for(var i = 0; i<el.length; i++){
						if(el[i].id){
							st.push(el[i].querySelectorAll('a')[0].href.split('/')[5].toString());
						}
					}
					return st;
				});
				
				console.log('num: '+num+', n: '+n);	
				console.log(strar);	
				recurse(strar.length);				
			},
			function() {
				console.log('heeeeeeeeey error here2');
			},
		60000);
	});

}

function recurse(_n){
	console.log('here we check n: '+_n+', strar['+_n+']: '+strar[_n-1]);
	if(_n<1){
		fs.write(path+'/temp.txt', str, 'w');
		strar = [];
		str = '';
		console.log('endofstrar');
	}else{
		casper.thenOpen('https://kolesa.kz/a/show/'+strar[_n-1], function(){
			this.waitForSelector(xpath('(//div[@class="show-phones action-link showPhonesLink"]|//span[@class="show-phones"])'), 
				function() {
					console.log('one car page opened');	
					var ddd = this.evaluate(function(numm){
						var hhh = numm;
						function testAjax() {
							var result="";
							$.ajax({
							  url:"https://kolesa.kz/a/ajaxPhones/?id="+hhh,
							  async: false,  
							  success:function(data) {
								 result = data; 
							  }
						   });
						   return result;
						}
						return testAjax();
					}, {numm: strar[_n-1]});
					var st = '';
					var els = ddd.data.model.phone.split(',');
					for(var i=0; i<els.length; i++){
						var phn = els[i].replace(/[^0-9.]/g, "");
						st+=','+phn;
					}
					st = st.substring(1);
					//console.log(st);
					str+=','+st;
					console.log(str);
				},
				function() {
					console.log('heeeeeeeeey error here3');
					this.capture('qaws.png');
				},
			60000);
		});
		
		casper.then(function(){
			_n--;
			recurse(_n);
		});
	}
}


casper.run();