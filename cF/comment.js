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
//console.log(casper.cli.args[1]);
var lim;
openProfile();
var str='', num, shouldComment = true, commentsNum;
var usrname = 'bereket86.86@mail.ru';//['olx.500@mail.ru', 'olx.501@mail.ru', 'olx.503@mail.ru', 'olx.510@mail.ru', 'olx.511@mail.ru', 'olx.512@mail.ru', 'olx.513@mail.ru', 'olx.514@mail.ru', 'olx.515@mail.ru', 'olx.516@mail.ru'][Math.floor((Math.random()*9)+0)];

function openProfile(){
	//console.log('trying to open...');
	casper.start().thenOpen('https://id.kolesa.kz/login/?destination=https%3A%2F%2Fkolesa.kz%2Fmy%2F', function(){
		this.waitForSelector(xpath('(//button[@class="login-btn"])'), 
			function() {
				this.sendKeys(xpath('(//input[@id="email"])'), usrname);
				this.sendKeys(xpath('(//input[@id="password"])'), 'MnqP13');
				this.click(xpath('(//button[@class="login-btn"])'));
				//console.log('login page opened');
			},
			function() {
				//this.capture(path+'/img/fail1.png');
				//console.log('fail1');
				//this.exit();
			},
		20000);
	});

	casper.then(function(){
		this.waitForSelector(xpath('(//a[@class="btn btn-primary a-new-btn"])'), 
			function() {
				//this.capture(path+'/img/profile.png');
				//console.log('success');				
			}, 
			function() {
				//this.capture(path+'/img/fail2.png');
				//console.log('fail2');
				//this.exit();
			},
		20000);
		
	});

	casper.thenOpen('https://kolesa.kz/a/show/'+casper.cli.args[0], function(){
		this.evaluate(function(){
			$("html, body").animate({ scrollTop: document.body.scrollHeight }, 1800);
		});
		this.waitForSelector(xpath('(//button[@class="add-comment-button default-button"])'), 
			function() {
				//console.log('item page opened limit defined');
				//this.capture(path+'/img/carsPage.png');
				lim = this.evaluate(function(){
					var pelem = document.getElementsByClassName('paginator clearfix')[0].querySelectorAll('li');
					return parseInt(pelem[pelem.length-1].querySelector('a').innerHTML);					
				});
				if(lim === null){
					//console.log('lim: nothing '+casper.cli.args[1]+' '+casper.cli.args[0]);
					str = justOneCommentPage();
					//console.log(str);
					comment();
				}else{
					//console.log('lim: something '+casper.cli.args[1]+' '+casper.cli.args[0]);
					severalCommentPages();
					//console.log(str);
					//comment();
				}
			},
			function() {
				//this.capture(path+'/img/fail4.png');
				console.log('fail1 '+casper.cli.args[1]+' '+casper.cli.args[0]);
				//this.exit();
			}, 3000);
	});
	
}


function comment(){
	var r = str.split('?');
	//console.log(r);
	for(var i=0; i<r.length; i++){
		if(r[i]==='kolesaapps'){
			shouldComment = false;
			break;
		}
	}
	//console.log('shouldComment: '+shouldComment);
	if(shouldComment){
			casper.then(function(){							
				var nn = this.evaluate(function() {
					var tt = document.getElementsByClassName('comments-number')[0].innerHTML;
			        return parseInt(tt.substring(1, tt.length-1));
			    });
			    commentsNum = nn || 0;			
				this.sendKeys(xpath('(//textarea[@id="comment-text"])'), 'Будьте первым при появлений на продаже автомобилей с очень выгодной ценой, программа мониторинг с Вашим личным фильтром и уведомление на мобильный телефон. А так же многократное увеличение просмотров и продаж Ваших обьявлений с помощью программы комментатора, взрывной эффект, мгновенный результат, огромная база. Все остальные подробности по тел/whatsApp +77011824445');
				this.click(xpath('(//button[@class="add-comment-button default-button"])'));				
			});
			/*casper.then(function(){
				this.wait(15000, function(){});
			});*/
			casper.then(function(){
				this.waitFor(function check() {
				    return this.evaluate(function(commentsNum) {
				        var tt = document.getElementsByClassName('comments-number')[0].innerHTML;
			        	return parseInt(tt.substring(1, tt.length-1))>parseInt(commentsNum);
				    }, commentsNum);
				}, function then() {
				    console.log('done '+casper.cli.args[1]+' '+casper.cli.args[0]);
				}, function timeout() {
					this.capture(path+'/img/xxx.png');
				    console.log('fail2 '+casper.cli.args[1]+' '+casper.cli.args[0]);
				});	
			});
		
	}else{
		console.log(casper.cli.args[1]+' '+casper.cli.args[0]+' commented before, next...');
	}
}



function severalCommentPages(){	
	casper.then(function(){	
		num = this.evaluate(function(){
			return parseInt(document.getElementsByClassName('paginator clearfix')[0].querySelectorAll('.active')[0].innerHTML);			
		});	
		//console.log('num: '+num);
		if(lim===num){
			//console.log('1');
			str+=justOneCommentPage();
			comment();
		}else{
			//console.log('2');
			str+=justOneCommentPage();
			this.click(xpath('(//a[@class="right-arrow next_page"])'));
			this.then(function(){
				this.waitFor(function check() {
				    return this.evaluate(function(num) {
				        return document.getElementsByClassName('paginator clearfix')[0].querySelectorAll('li')[parseInt(num)].querySelector('span').classList.contains('active');
				    }, num);
				}, function then() {  
				    severalCommentPages();
				});
			});
		}
	});
}

function justOneCommentPage(){	
	var strin = casper.evaluate(function(){
		var st = '';
		var comments = document.getElementsByClassName('comments-block clearfix')[0].querySelectorAll('.comment-block');
		
		for(var i=0; i<comments.length; i++){							
			st+='?'+comments[i].querySelectorAll('strong')[0].innerHTML;
		}
		return st;					
	});
	return strin;
}


casper.run();
//phantom.exit(0);