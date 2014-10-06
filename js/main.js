var session = {};

function login(dev){
	var res = document.getElementById('token').value;
	
	var params = res.substr(res.search('#')+1).split('&');
	for (var i = 0; i < params.length; i++) {
		session[params[i].substring(0, params[i].search('='))] = params[i].substring(params[i].search('=')+1);
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



	url0 = "http://api.vk.com/method/messages.get?count=10&v=5.25&access_token="+session.access_token+"&callback=qwerty";
	url1=url0+'&sig='+CryptoJS.MD5(url0.substr(17)+session.secret).toString();
	setInterval(function(){
		$.ajax(
			{url: url1, dataType: 'jsonp', cache: true, jsonpCallback: 'qwerty'}
			)
			.success(function(res){ress = res;inbox = res.response.items;})
	},2000);

	url2 = 'http://api.vk.com/method/execute?code=return [API.friends.get({user_id:"'+session.user_id+'", "fields":"name"}), API.friends.get({user_id:"'+session.user_id+'", "fields":"name", "name_case": "dat"})];&v=5.25&access_token='+session.access_token+'&callback=qwerty3';
	url3= url2+'&sig='+CryptoJS.MD5(url2.substr(17)+session.secret).toString();
	$.ajax({url: url3, dataType: 'jsonp', cache: true, jsonpCallback: 'qwerty3'})
		.success(function(res){
			temp = res;
			for (var i = 0; i < res.response[0].items.length; i++) {
				friends[res.response[0].items[i].id] = {};
				friends[res.response[0].items[i].id].name = res.response[0].items[i].first_name+' '+res.response[0].items[i].last_name;
				friends[res.response[0].items[i].id].datName = res.response[1].items[i].first_name+' '+res.response[1].items[i].last_name;
				
			};
		})


	url4 = "http://api.vk.com/method/messages.get?out=1&count=10&v=5.25&access_token="+session.access_token+"&callback=qwerty4";
	url5= url4+'&sig='+CryptoJS.MD5(url4.substr(17)+session.secret).toString();
	setInterval(function(){
		$.ajax({url: url5, dataType: 'jsonp', cache: true, jsonpCallback: 'qwerty4'})
			.success(function(res){
				outbox = res.response.items;
			});
	},1000);

	setInterval(function(){
		
		qwerty1(buildMessagesMassive());
	},1000)
}

var inbox = [];
var outbox = [];
var messages = [];
var lastMessageId;

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


function getMessages(){
	/*
	out
	если этот параметр равен 1, сервер вернет исходящие сообщения. 
	целое число

	offset
	смещение, необходимое для выборки определенного подмножества сообщений 
	положительное число

	count
	количество сообщений, которое необходимо получить. 
	положительное число, по умолчанию 20, максимальное значение 200

	time_offset
	максимальное время, прошедшее с момента отправки сообщения до текущего момента в секундах. 0, если Вы хотите получить сообщения любой давности. 
	целое число

	filters
	фильтр возвращаемых сообщений: 8 — важные сообщения. 
	целое число

	preview_length
	количество символов, по которому нужно обрезать сообщение. Укажите 0, если Вы не хотите обрезать сообщение. (по умолчанию сообщения не обрезаются). Обратите внимание что сообщения обрезаются по словам. 
	положительное число

	last_message_id
	идентификатор сообщения, полученного перед тем, которое нужно вернуть последним (при условии, что после него было получено не более count сообщений, иначе необходимо использовать с параметром offset). 
	положительное число
	*/
	var messages = {};
	

	return messages;


}
function sig(req, secret){

	var string = req+secret;

	return CryptoJS.MD5(string);
}

function reqConstructor(method, params){

}
function sendMessage(){
	var forWho = document.getElementById('for').value;
	for (var fio in friends){
		if (friends[fio].name == forWho){
			forWho = fio;
		} else if(friends[fio].datName == forWho){
			forWho = fio;
		}
	}

	url9 = 'http://api.vk.com/method/messages.send?user_id='+forWho+'&message='+document.getElementById("send").value+'&v=5.25&access_token='+session.access_token+'&callback=qwerty3';
	url10= url9+'&sig='+CryptoJS.MD5(url9.substr(17)+session.secret).toString();
	$.ajax({url: url10, dataType: 'jsonp', cache: true, jsonpCallback: 'qwerty3',type: 'POST'})
		.success(function(res){
			document.getElementById("send").value = '';
		})

	console.log(forWho);
}

var url0 = "http://api.vk.com/method/messages.get?out=1&count=10&v=5.25&access_token="+session.access_token+"&callback=qwerty";
var url1=url0+'&sig='+CryptoJS.MD5(url0.substr(17)+session.secret).toString();
var url2,url3,url4,url5;
var ress;
var temp,temp2;
var friends = {};

function qwerty3(){};
function qwerty1(currentLastMessageId){
	if (lastMessageId != currentLastMessageId){
		var m = document.getElementById('messages');
		m.innerHTML = '';
		for (var i = 10; i < 20; i++) {
			var li = document.createElement('li');
			var author = messages[i].out ? 'Я - '+friends[messages[i].user_id].datName : friends[messages[i].user_id].name;
			li.innerHTML = '<span class="author">'+author+'</span>: <span id="message">'+messages[i].body+'</span>'
			m.appendChild(li);
		};
		lastMessageId = currentLastMessageId;
	}
	
}