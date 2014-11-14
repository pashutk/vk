port = {};

PashutkVK =
	session:
		APIversion: "5.25"

	messages:
		items: []
		lastMessageId: 0
		lastMessageListener:
			listenerFunc: ->
				PashutkVK.messages.lastMessageIdRequest()

			listener: false
			timerInterval: 1000

		lastMessageIdRequest: ->
			params = code: "var in = API.messages.get({count:1}).items[0].id; var out = API.messages.get({out:1, count:1}).items[0].id; return in>out ? in : out;"
			PashutkVK.makeReq "execute", params, "none", @responseProcessor.bind(this, "lastMessageIdRequest")

		messagesRequest: ->
			params = code: "return [API.messages.get({count: 20}), API.messages.get({out:1, count: 20})];"
			PashutkVK.makeReq "execute", params, "none", @responseProcessor.bind(this, "messagesRequest")

		responseProcessor: (reqFunc, res) ->
			if reqFunc is "lastMessageIdRequest"
				if res.response > @lastMessageId
					# console.log('new messages');
					@lastMessageId = res.response
					@messagesRequest()
				else
					# console.log('no new messages');
			else if reqFunc is "messagesRequest"
				input = res.response[0].items
				output = res.response[1].items
				@items = []
				i = 0

				while i < input.length
					@items.push input[i]
					i++
				i = 0

				while i < output.length
					@items.push output[i]
					i++
				@items = PashutkVK.sort(@items, "id")
				@refresh()

		refresh: ->
			tempr =
				name: 'refresh'
				response:
					friends: PashutkVK.friends.items
					messages: PashutkVK.messages.items

			port.postMessage(tempr)
	friends:
		items: {}
		friendsRequest: ->
			params = code: "return [[API.users.get({\"user_ids\": API.messages.get({\"out\": 0, \"count\": 20}).items@.user_id, \"fields\": \"name,photo_50\", \"name_case\": \"nom\"}), API.users.get({\"user_ids\": API.messages.get({\"out\": 1, \"count\": 20}).items@.user_id, \"fields\": \"name,photo_50\", \"name_case\": \"nom\"})],[API.users.get({\"user_ids\": API.messages.get({\"out\": 0, \"count\": 20}).items@.user_id, \"fields\": \"name,photo_50\", \"name_case\": \"dat\"}), API.users.get({\"user_ids\": API.messages.get({\"out\": 1, \"count\": 20}).items@.user_id, \"fields\": \"name,photo_50\", \"name_case\": \"dat\"})],API.friends.get({\"user_id\": " + PashutkVK.session.user_id + ", \"order\": \"hints\", \"fields\": \"name,photo_50\", \"name_case\": \"nom\"}),API.friends.get({\"user_id\": " + PashutkVK.session.user_id + ", \"order\": \"hints\", \"fields\": \"name,photo_50\", \"name_case\": \"dat\"})];"
			PashutkVK.makeReq "execute", params, "none", @responseProcessor.bind(this, "allUsers")

		responseProcessor: (reqFunc, res) ->
	  
			#  res.response имеет вид [0,1,2,3], где
			# 0 == [[список объектов вида {first_name:'',last_name:'',id:Number,photo_50:''} для пользователей отправивших сообщения вам],[то же но для отправленых сообщений]]
			# 1 - то же что и 0, но дательный падеж
			# 2 == {count:0, items:[список объектов вида как в 0, но плюс online:0/1]}
			# 3 - то же что и 2 но дательный падеж
			console.log res
			i = 0

			while i < res.response[0][0].length
				@items[res.response[0][0][i].id] = name:
					nom: ""
					dat: ""

				@items[res.response[0][0][i].id].name.nom = res.response[0][0][i].first_name + " " + res.response[0][0][i].last_name
				@items[res.response[1][0][i].id].name.dat = res.response[0][0][i].first_name + " " + res.response[0][0][i].last_name
				i++
			i = 0

			while i < res.response[0][1].length
				@items[res.response[0][1][i].id] = name:
					nom: ""
					dat: ""

				@items[res.response[0][1][i].id].name.nom = res.response[0][1][i].first_name + " " + res.response[0][1][i].last_name
				@items[res.response[1][1][i].id].name.dat = res.response[1][1][i].first_name + " " + res.response[1][1][i].last_name
				i++
			i = 0

			while i < res.response[2].items.length
				@items[res.response[2].items[i].id] = name:
					nom: ""
					dat: ""

				@items[res.response[2].items[i].id].name.nom = res.response[2].items[i].first_name + " " + res.response[2].items[i].last_name
				@items[res.response[3].items[i].id].name.dat = res.response[3].items[i].first_name + " " + res.response[3].items[i].last_name
				i++

	constructReq: (method, params, callback) ->
		#method - string, params - object, callback - string
		req = "https://api.vk.com/method/" + method + "?"
		for param of params
			req += param + "=" + params[param] + "&"
		req += "v=" + @session.APIversion + "&access_token=" + @session.access_token
		# req = req + "&sig=" + CryptoJS.MD5(req.substr(17) + @session.secret).toString()
		req

	makeReq: (method, params, callback, ifSuccess, ifError) ->
		url = @constructReq(method, params, callback)
		$.get url, (res) ->
			if ifSuccess
				ifSuccess res
			else
				console.log res

	sort: (arr, param) ->
		output = arr
		tmp


		for i in [0...output.length-1]
			for j in [0...output.length-i-1]
				if output[j][param] > output[j + 1][param]
					tmp = output[j]
					output[j] = output[j + 1]
					output[j + 1] = tmp
		output
	

	init: ->
		port = chrome.runtime.connect name:'whoop'
		chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
			if request.greeting is "hello"
				$.get request.url+PashutkVK.session.access_token, () ->
					port.postMessage(
						name: 'successSend'
						response: true
						)
		PashutkVK.friends.friendsRequest()
		PashutkVK.messages.lastMessageListener.listener = setInterval(->
			PashutkVK.messages.lastMessageListener.listenerFunc()
		, PashutkVK.messages.lastMessageListener.timerInterval)

res = "https://oauth.vk.com/blank.html#access_token=009aee2f5405bddff643a00e2ff08dec298571cbd21539196ec85785da9b23e023ed2eaec88fd0f831f23&expires_in=0&user_id=15676642&email=djlewap@gmail.com"
params = res.substr(res.search("#") + 1).split("&")
i = 0

while i < params.length
	PashutkVK.session[params[i].substring(0, params[i].search("="))] = params[i].substring(params[i].search("=") + 1)
	i++



chrome.app.runtime.onLaunched.addListener () ->
	chrome.app.window.create 'index.html', {
		bounds:{
			width: 640
			height: 480
		}
	}, (createdWindow) ->
		createdWindow.contentWindow.onload = () ->
			PashutkVK.init()


