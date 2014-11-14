document.getElementById('auth').onclick = function(){
	login(1);
}
document.getElementById('sendButton').onclick = function(){
	sendMessage();
}
Mousetrap.bind(['ctrl+enter', 'command+enter'], function(e) {
    sendMessage();
});



var session = {};

function login(dev){
	var res = document.getElementById('token').value;
	if (dev) {
		res = 'https://oauth.vk.com/blank.html#access_token=8d6cedadb5f8818224c56408e95df980a823060e2063171ce8cbb92d7a976dfd0f3176c74c982c3443943&expires_in=0&user_id=15676642&email=djlewap@gmail.com&secret=05b5f92c99b7afea45'
	}
	var params = res.substr(res.search('#')+1).split('&');
	for (var i = 0; i < params.length; i++) {
		session[params[i].substring(0, params[i].search('='))] = params[i].substring(params[i].search('=')+1);
		PashutkVK.session[params[i].substring(0, params[i].search('='))] = params[i].substring(params[i].search('=')+1);
	};
	if (session.error) {
		document.getElementsByTagName('main')[0].className = 'error';
		document.getElementById('error').innerText = session.error_description;
	} else if (session.access_token) {
		document.getElementsByTagName('main')[0].className = 'authorized';
	} else {
		document.getElementsByTagName('main')[0].className = 'error';
	};

	/*
	var url = {};
	url.basis = 'http://api.vk.com';
	url.methods = '/method/';
	*/



	/*url0 = "http://api.vk.com/method/messages.get?count=10&v=5.25&access_token="+session.access_token+"&callback=qwerty";
	url1=url0+'&sig='+CryptoJS.MD5(url0.substr(17)+session.secret).toString();
	setInterval(function(){
		$.ajax(
			{url: url1, dataType: 'jsonp', cache: true, jsonpCallback: 'qwerty'}
			)
			.success(function(res){ress = res;inbox = res.response.items;})
	},2000);
	url0 = "http://api.vk.com/method/account.getAppPermissions?&v=5.25&access_token="+session.access_token+"&callback=qwerty";
	url1=url0+'&sig='+CryptoJS.MD5(url0.substr(17)+session.secret).toString();
	$.ajax(
		{url: url1, dataType: 'jsonp', cache: true, jsonpCallback: 'qwerty'}
		).success(function(res){ress = res;})
*/

	url2 = 'http://api.vk.com/method/execute?code=return [API.friends.get({user_id:"'+session.user_id+'", "fields":"name"}), API.friends.get({user_id:"'+session.user_id+'", "fields":"name", "name_case": "dat"})];&v=5.25&access_token='+session.access_token+'&callback=qwerty3';
	url3= url2+'&sig='+CryptoJS.MD5(url2.substr(17)+session.secret).toString();
	$.ajax({url: url3, dataType: 'jsonp', cache: true, jsonpCallback: 'qwerty3'})
		.success(function(res){
			temp = res;
			for (var i = 0; i < res.response[0].items.length; i++) {
				friends[res.response[0].items[i].id] = {};
				friends[res.response[0].items[i].id].name = res.response[0].items[i].first_name+' '+res.response[0].items[i].last_name;
				friends[res.response[0].items[i].id].datName = res.response[1].items[i].first_name+' '+res.response[1].items[i].last_name;
				friendsMassive[i] = friends[res.response[0].items[i].id];
			};

			// initialize the selectize control
			var $select = $('#for').selectize({
			    persist: false,
			    maxItems: 1,
			    valueField: 'name',
			    labelField: 'name',
			    searchField: ['name', 'datName'],
			    options: friendsMassive,
			    render: {
			        item: function(item, escape) {
			            return '<div>' +
			                (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
			                // (item.datName ? '<span class="datName">' + escape(item.datName) + '</span>' : '') +
			            '</div>';
			        },
			        option: function(item, escape) {
			            var label = item.name || item.datName;
			            var caption = item.name ? item.datName : null;
			            return '<div>' +
			                '<span class="label">' + escape(label) + '</span>' +
			                // (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
			            '</div>';
			        }
			    }
			});
		selectize = $select[0].selectize;
		})


	/*url4 = "http://api.vk.com/method/messages.get?out=1&count=10&v=5.25&access_token="+session.access_token+"&callback=qwerty4";
	url5= url4+'&sig='+CryptoJS.MD5(url4.substr(17)+session.secret).toString();
	setInterval(function(){
		$.ajax({url: url5, dataType: 'jsonp', cache: true, jsonpCallback: 'qwerty4'})
			.success(function(res){
				outbox = res.response.items;
			});
	},1000);*/

	/*setInterval(function(){
		
		qwerty1(buildMessagesMassive());
	},1000)*/
	PashutkVK.init();
}

var inbox = [];
var outbox = [];
var messages = [];
var lastMessageId;
var selectize;

function buildMessagesMassive(){
	//build
	messages = [];
	for (var i = 0; i < inbox.length; i++) {
		messages.push(inbox[i]);
	};
	for (var i = 0; i < outbox.length; i++) {
		messages.push(outbox[i]);
	};
	//sort

    var tmp;
 
    for (var i = messages.length - 1; i > 0; i--) {
        for (var j = 0; j < i; j++) {
            if (messages[j].id > messages[j+1].id) {
                tmp = messages[j];
                messages[j] = messages[j+1];
                messages[j+1] = tmp;
            }
        }
    }
    var currentLastMessageId = messages[messages.length-1].id;
    return currentLastMessageId;


}



function sig(req, secret){

	var string = req+secret;

	return CryptoJS.MD5(string);
}

function constructReq(method, params){

}
function sendMessage(){
	var forWho = document.getElementById('for').value;
	if (forWho) {
		for (var fio in PashutkVK.friends.items){
			if (PashutkVK.friends.items[fio].name.nom == forWho){
				forWho = fio;
			} else if(PashutkVK.friends.items[fio].name.dat == forWho){
				forWho = fio;
			}
		}

		if (document.getElementById("send").value) {

			url9 = 'http://api.vk.com/method/messages.send?user_id='+forWho+'&message='+document.getElementById("send").value+'&v=5.25&access_token='+session.access_token+'&callback=qwerty3';
			url10= url9+'&sig='+CryptoJS.MD5(url9.substr(17)+session.secret).toString();
			$.ajax({url: url10, dataType: 'jsonp', cache: true, jsonpCallback: 'qwerty3',type: 'POST'})
				.success(function(res){
					document.getElementById("send").value = '';
				})
		};
	};
}

var url0 = "http://api.vk.com/method/messages.get?out=1&count=10&v=5.25&access_token="+session.access_token+"&callback=qwerty";
var url1=url0+'&sig='+CryptoJS.MD5(url0.substr(17)+session.secret).toString();
var url2,url3,url4,url5;
var ress;
var temp,temp2;
var friends = {};
var friendsMassive = [];

function qwerty3(){};
/*function qwerty1(currentLastMessageId){
	if (lastMessageId != currentLastMessageId){
		var m = document.getElementById('messages');
		m.innerHTML = '';
		for (var i = 10; i < 20; i++) {
			var li = document.createElement('li');
			var author = messages[i].out ? 'Я - '+friends[messages[i].user_id].datName : friends[messages[i].user_id].name;
			li.innerHTML = '<span class="author">'+author+'</span>: <span id="message">'+messages[i].body+'</span>';
			if (messages[i].attachments) {
				var div = document.createElement('div');
				div.className = 'attachments';
				div.innerText = ' Вложения: '
				for (var z = 0; z < messages[i].attachments.length; z++) {
					if (messages[i].attachments[z].type == 'photo') {
						var img = document.createElement('img');
						img.src = messages[i].attachments[z].photo.photo_75;
						var a = document.createElement('a');
						a.target = '_blank';
						a.appendChild(img);
						a.href = messages[i].attachments[z].photo.photo_75;
						div.appendChild(a);
					} else {
						var span = document.createElement('span');
						span.innerText = messages[i].attachments[0].type;
						div.appendChild(span);
					}
					
				};
				
				li.appendChild(div);
				

			};
			
			m.appendChild(li);
		};
		lastMessageId = currentLastMessageId;
	}
	
}*/
$('.author').click(function(){
	selectize.setValue($(this).text());
});







// =============================================================================

var PashutkVK = {
	session: {
		APIversion: '5.25'
	},
	messages: {
		items: [],
		lastMessageId: 0,
		lastMessageListener: {
			listenerFunc: function(){
				PashutkVK.messages.lastMessageIdRequest();
			},
			listener: false,
			timerInterval: 1000
		},
		lastMessageIdRequest: function(){
			var params = {
				code: 'var in = API.messages.get({count:1}).items[0].id; var out = API.messages.get({out:1, count:1}).items[0].id; return in>out ? in : out;'
			};
			PashutkVK.makeReq('execute', params, 'none', this.responseProcessor.bind(this, 'lastMessageIdRequest'));
		},
		messagesRequest: function(){
			var params = {
				code: 'return [API.messages.get({count: 20}), API.messages.get({out:1, count: 20})];'
			};
			PashutkVK.makeReq('execute', params, 'none', this.responseProcessor.bind(this, 'messagesRequest'));
		},
		responseProcessor: function(reqFunc, res){
			if (reqFunc == 'lastMessageIdRequest') {
				if (res.response>this.lastMessageId) {
					// console.log('new messages');
					this.lastMessageId = res.response;
					this.messagesRequest();
				} else {
					// console.log('no new messages');
				};
			} else if (reqFunc == 'messagesRequest') {
				var input = res.response[0].items;
				var output = res.response[1].items;
				this.items = [];
				for (var i = 0; i < input.length; i++) {
					this.items.push(input[i]);
				};
				for (var i = 0; i < output.length; i++) {
					this.items.push(output[i]);
				};
				this.items = PashutkVK.sort(this.items, 'id');
				this.refresh();
			};
		},
		refresh: function(){
			var m = document.getElementById('messages');
			m.innerHTML = '';
			for (var i = 30; i < 40; i++) {
				var li = document.createElement('li');
				var author = this.items[i].out ? 'Я - '+PashutkVK.friends.items[this.items[i].user_id].name.dat : PashutkVK.friends.items[this.items[i].user_id].name.nom;
				li.innerHTML = '<span class="author">'+author+'</span>: <span id="message">'+this.items[i].body+'</span>';
				if (this.items[i].attachments) {
					var div = document.createElement('div');
					div.className = 'attachments';
					div.innerText = ' Вложения: '
					for (var z = 0; z < this.items[i].attachments.length; z++) {
						if (this.items[i].attachments[z].type == 'photo') {
							var img = document.createElement('img');
							img.src = this.items[i].attachments[z].photo.photo_75;
							var a = document.createElement('a');
							a.target = '_blank';
							a.appendChild(img);
							a.href = this.items[i].attachments[z].photo.photo_75;
							div.appendChild(a);
						} else {
							var span = document.createElement('span');
							span.innerText = this.items[i].attachments[0].type;
							div.appendChild(span);
						}
						
					};
					
					li.appendChild(div);
					

				};
				
				m.appendChild(li);
			};
		}
	},
	friends: {
		items: {},
		friendsRequest: function(){
			var params = {
				code: 'return [[API.users.get({"user_ids": API.messages.get({"out": 0, "count": 20}).items@.user_id, "fields": "name,photo_50", "name_case": "nom"}), API.users.get({"user_ids": API.messages.get({"out": 1, "count": 20}).items@.user_id, "fields": "name,photo_50", "name_case": "nom"})],[API.users.get({"user_ids": API.messages.get({"out": 0, "count": 20}).items@.user_id, "fields": "name,photo_50", "name_case": "dat"}), API.users.get({"user_ids": API.messages.get({"out": 1, "count": 20}).items@.user_id, "fields": "name,photo_50", "name_case": "dat"})],API.friends.get({"user_id": '+PashutkVK.session.user_id+', "order": "hints", "fields": "name,photo_50", "name_case": "nom"}),API.friends.get({"user_id": '+PashutkVK.session.user_id+', "order": "hints", "fields": "name,photo_50", "name_case": "dat"})];'
			};
			PashutkVK.makeReq('execute', params, 'none', this.responseProcessor.bind(this, 'allUsers'));
		},
		responseProcessor: function(reqFunc, res){
			//  res.response имеет вид [0,1,2,3], где
			// 0 == [[список объектов вида {first_name:'',last_name:'',id:Number,photo_50:''} для пользователей отправивших сообщения вам],[то же но для отправленых сообщений]]
			// 1 - то же что и 0, но дательный падеж
			// 2 == {count:0, items:[список объектов вида как в 0, но плюс online:0/1]}
			// 3 - то же что и 2 но дательный падеж
			console.log(res);
			for (var i = 0; i < res.response[0][0].length; i++) {
				this.items[res.response[0][0][i].id] = {
					name: {
						nom:'',
						dat:''
					}
				};
				this.items[res.response[0][0][i].id].name.nom = res.response[0][0][i].first_name+' '+res.response[0][0][i].last_name;
				this.items[res.response[1][0][i].id].name.dat = res.response[0][0][i].first_name+' '+res.response[0][0][i].last_name;
			};
			for (var i = 0; i < res.response[0][1].length; i++) {
				this.items[res.response[0][1][i].id] = {
					name: {
						nom:'',
						dat:''
					}
				};
				this.items[res.response[0][1][i].id].name.nom = res.response[0][1][i].first_name+' '+res.response[0][1][i].last_name;
				this.items[res.response[1][1][i].id].name.dat = res.response[1][1][i].first_name+' '+res.response[1][1][i].last_name;
			};
			for (var i = 0; i < res.response[2].items.length; i++) {
				this.items[res.response[2].items[i].id] = {
					name: {
						nom:'',
						dat:''
					}
				};
				this.items[res.response[2].items[i].id].name.nom = res.response[2].items[i].first_name+' '+res.response[2].items[i].last_name; 
				this.items[res.response[3].items[i].id].name.dat = res.response[3].items[i].first_name+' '+res.response[3].items[i].last_name; 
			}
		}
	},
	constructReq: function(method, params, callback){
		//method - string, params - object, callback - string
		var req;
		req = 'http://api.vk.com/method/'
			+ method
			+ '?'
		for (var param in params) {
			req += param + '=' + params[param] + '&';
		};
		req += 'v='+this.session.APIversion+'&access_token='+this.session.access_token+'&callback='+callback;
		req = req
			+ '&sig='
			+ CryptoJS.MD5(req.substr(17)+this.session.secret).toString();
		return req;
	},  
	makeReq:function(method, params, callback, ifSuccess, ifError){
		var url = this.constructReq(method, params, callback);
		$.ajax({url: url, dataType: 'jsonp', cache: true, jsonpCallback: callback})
			.success(function(res){
				if (ifSuccess) {
					ifSuccess(res);
				} else {
					console.log(res);
				}
				
			})
			.error(function(res){
				if (ifError) {
					ifError(res);
				} else {
					console.log(res);
				}
			});
	},
	sort: function(arr, param){
		var output = arr;
		var tmp;
	 
	    for (var i = output.length - 1; i > 0; i--) {
	        for (var j = 0; j < i; j++) {
	            if (output[j][param] > output[j+1][param]) {
	                tmp = output[j];
	                output[j] = output[j+1];
	                output[j+1] = tmp;
	            };
	        };
	    };
	    return output;
	},
	init: function(){
		PashutkVK.friends.friendsRequest();
		PashutkVK.messages.lastMessageListener.listener = setInterval(function(){
			PashutkVK.messages.lastMessageListener.listenerFunc();
		}, PashutkVK.messages.lastMessageListener.timerInterval)
	}
};

// строка для запроса количества сообщений (рефреш)
// 'return API.messages.get({count:0}).count+API.messages.get({out:1, count:0}).count;'
// строка для запроса последнего id сообщения (рефреш)
// 'var in = API.messages.get({count:1}).items[0].id; var out = API.messages.get({out:1, count:1}).items[0].id; return in>out ? in : out;'
// строка для запроса 20 входящих и 20 исходящих сообщений 
// 'return [API.messages.get(), API.messages.get({out:1})];'

// строка для запроса инфы о пользователях приславших и отправивишх сообщения (им пад)
// 'return [API.users.get({"user_ids": API.messages.get({"out": 0, "count": 20}).items@.user_id, "fields": "name,photo_50", "name_case": "nom"}), API.users.get({"user_ids": API.messages.get({"out": 1, "count": 20}).items@.user_id, "fields": "name,photo_50", "name_case": "nom"})];'
// строка для запроса инфы о пользователях приславших и отправивишх сообщения (дат пад)
// 'return [API.users.get({"user_ids": API.messages.get({"out": 0, "count": 20}).items@.user_id, "fields": "name,photo_50", "name_case": "dat"}), API.users.get({"user_ids": API.messages.get({"out": 1, "count": 20}).items@.user_id, "fields": "name,photo_50", "name_case": "dat"})];'

// строка для запроса друзей (им пад)
// 'return API.friends.get({"user_id": '+PashutkVK.session.user_id+', "order": "hints", "fields": "name,photo_50", "name_case": "nom"});'
// строка для запроса друзей (дат пад)
// 'return = API.friends.get({"user_id": '+PashutkVK.session.user_id+', "order": "hints", "fields": "name,photo_50", "name_case": "dat"});'

url2 = 'http://api.vk.com/method/execute?code=return [API.friends.get({"user_id": '+session.user_id+', "order": "hints", "fields": "name,photo_50", "name_case": "nom"}),API.friends.get({"user_id": '+session.user_id+', "order": "hints", "fields": "name,photo_50", "name_case": "dat"})];&v=5.25&access_token='+session.access_token+'&callback=qwerty0';
url3= url2+'&sig='+CryptoJS.MD5(url2.substr(17)+session.secret).toString();
			$.ajax({url: url3, dataType: 'jsonp', cache: true, jsonpCallback: 'qwerty0'})
				.success(function(res){
					yrl2 = res;
				});

var o = {qwe: 1, train: 'yes', shit: true};
chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    console.log(msg);
  });
});
