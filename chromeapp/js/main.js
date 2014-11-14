var port = chrome.runtime.connect({name: "whoop"});
Mousetrap.bind(['ctrl+enter', 'command+enter'], function(e) {
    sendMessage();
});

function sendMessage(){
	var forWho = document.getElementById('for').value;
	if (forWho) {
		for (var fio in friends){
			if (friends[fio].name.nom == forWho){
				forWho = fio;
			} else if(friends[fio].name.dat == forWho){
				forWho = fio;
			}
		}

		if (document.getElementById("send").value) {

			var url = 'http://api.vk.com/method/messages.send?user_id='+forWho+'&message='+document.getElementById("send").value+'&v=5.25&access_token=';
			chrome.runtime.sendMessage({greeting: "hello",url:url}, function(response) {
				console.log(response.farewell);
			});
		};
	};
}

var friends = undefined;
var friendsMassive = [];
function refresh(res){
	if (!friends){
		friends = res.friends;
		for (el in friends) {
			friendsMassive.push(friends[el].name);
		}
		var $select = $('#for').selectize({
		    persist: false,
		    maxItems: 1,
		    valueField: 'nom',
		    labelField: 'nom',
		    searchField: ['nom', 'dat'],
		    options: friendsMassive,
		    render: {
		        item: function(item, escape) {
		            return '<div>' +
		                (item.nom ? '<span class="name">' + escape(item.nom) + '</span>' : '') +
		                // (item.datName ? '<span class="datName">' + escape(item.datName) + '</span>' : '') +
		            '</div>';
		        },
		        option: function(item, escape) {
		            var label = item.nom || item.dat;
		            var caption = item.nom ? item.dat : null;
		            return '<div>' +
		                '<span class="label">' + escape(label) + '</span>' +
		                // (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
		            '</div>';
		        }
		    }
		});
		selectize = $select[0].selectize;
	}

	var m = document.getElementById('messages');
	m.innerHTML = '';
	for (var i = 30; i < 40; i++) {
		var li = document.createElement('li');
		var author = res.messages[i].out ? 'Я - '+res.friends[res.messages[i].user_id].name.dat : res.friends[res.messages[i].user_id].name.nom;
		li.innerHTML = '<span class="author">'+author+'</span>: <span id="message">'+res.messages[i].body+'</span>';
		if (res.messages[i].attachments) {
			var div = document.createElement('div');
			div.className = 'attachments';
			div.innerText = ' Вложения: '
			for (var z = 0; z < res.messages[i].attachments.length; z++) {
				if (res.messages[i].attachments[z].type == 'photo') {
					var img = document.createElement('img');
					img.src = res.messages[i].attachments[z].photo.photo_75;
					var a = document.createElement('a');
					a.target = '_blank';
					a.appendChild(img);
					a.href = res.messages[i].attachments[z].photo.photo_75;
					div.appendChild(a);
				} else {
					var span = document.createElement('span');
					span.innerText = res.messages[i].attachments[0].type;
					div.appendChild(span);
				}
			};
			li.appendChild(div);
		};
		m.appendChild(li);
	};
}
	
chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
  	if (msg.name == 'refresh'){
  		refresh(msg.response);
  	} else if (msg.name == 'successSend') {
  		document.getElementById("send").value = '';
  	};
    
  });
});
