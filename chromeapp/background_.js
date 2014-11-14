var PashutkVK;
var window_;



chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('index.html', {
		'bounds': {
			'width': 640,
			'height': 480
    	}
	}, function(createdWindow){
		window_ = createdWindow.contentWindow;
		window_.onload = function(){
			window_.document.getElementById('auth').onclick = console.log(1);
		};
	});
	PashutkVK = {
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
			$.ajax({
				url: url,
				dataType: 'jsonp',
				cache: false,
				crossDomain: true,
				jsonpCallback: callback
			})
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
	var res = 'https://oauth.vk.com/blank.html#access_token=009aee2f5405bddff643a00e2ff08dec298571cbd21539196ec85785da9b23e023ed2eaec88fd0f831f23&expires_in=0&user_id=15676642&email=djlewap@gmail.com';
	var params = res.substr(res.search('#')+1).split('&');
	for (var i = 0; i < params.length; i++) {
		PashutkVK.session[params[i].substring(0, params[i].search('='))] = params[i].substring(params[i].search('=')+1);
	};
  // chrome.app.window.create('vk.html',{'bounds': {'width': 656,'height': 480}});
  
});


	


