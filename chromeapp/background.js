var PashutkVK, i, params, port, res;

port = {};

PashutkVK = {
  session: {
    APIversion: "5.25"
  },
  messages: {
    items: [],
    lastMessageId: 0,
    lastMessageListener: {
      listenerFunc: function() {
        return PashutkVK.messages.lastMessageIdRequest();
      },
      listener: false,
      timerInterval: 1000
    },
    lastMessageIdRequest: function() {
      var params;
      params = {
        code: "var in = API.messages.get({count:1}).items[0].id; var out = API.messages.get({out:1, count:1}).items[0].id; return in>out ? in : out;"
      };
      return PashutkVK.makeReq("execute", params, "none", this.responseProcessor.bind(this, "lastMessageIdRequest"));
    },
    messagesRequest: function() {
      var params;
      params = {
        code: "return [API.messages.get({count: 20}), API.messages.get({out:1, count: 20})];"
      };
      return PashutkVK.makeReq("execute", params, "none", this.responseProcessor.bind(this, "messagesRequest"));
    },
    responseProcessor: function(reqFunc, res) {
      var i, input, output;
      if (reqFunc === "lastMessageIdRequest") {
        if (res.response > this.lastMessageId) {
          this.lastMessageId = res.response;
          return this.messagesRequest();
        } else {

        }
      } else if (reqFunc === "messagesRequest") {
        input = res.response[0].items;
        output = res.response[1].items;
        this.items = [];
        i = 0;
        while (i < input.length) {
          this.items.push(input[i]);
          i++;
        }
        i = 0;
        while (i < output.length) {
          this.items.push(output[i]);
          i++;
        }
        this.items = PashutkVK.sort(this.items, "id");
        return this.refresh();
      }
    },
    refresh: function() {
      var tempr;
      tempr = {
        name: 'refresh',
        response: {
          friends: PashutkVK.friends.items,
          messages: PashutkVK.messages.items
        }
      };
      return port.postMessage(tempr);
    }
  },
  friends: {
    items: {},
    friendsRequest: function() {
      var params;
      params = {
        code: "return [[API.users.get({\"user_ids\": API.messages.get({\"out\": 0, \"count\": 20}).items@.user_id, \"fields\": \"name,photo_50\", \"name_case\": \"nom\"}), API.users.get({\"user_ids\": API.messages.get({\"out\": 1, \"count\": 20}).items@.user_id, \"fields\": \"name,photo_50\", \"name_case\": \"nom\"})],[API.users.get({\"user_ids\": API.messages.get({\"out\": 0, \"count\": 20}).items@.user_id, \"fields\": \"name,photo_50\", \"name_case\": \"dat\"}), API.users.get({\"user_ids\": API.messages.get({\"out\": 1, \"count\": 20}).items@.user_id, \"fields\": \"name,photo_50\", \"name_case\": \"dat\"})],API.friends.get({\"user_id\": " + PashutkVK.session.user_id + ", \"order\": \"hints\", \"fields\": \"name,photo_50\", \"name_case\": \"nom\"}),API.friends.get({\"user_id\": " + PashutkVK.session.user_id + ", \"order\": \"hints\", \"fields\": \"name,photo_50\", \"name_case\": \"dat\"})];"
      };
      return PashutkVK.makeReq("execute", params, "none", this.responseProcessor.bind(this, "allUsers"));
    },
    responseProcessor: function(reqFunc, res) {
      var i, _results;
      console.log(res);
      i = 0;
      while (i < res.response[0][0].length) {
        this.items[res.response[0][0][i].id] = {
          name: {
            nom: "",
            dat: ""
          }
        };
        this.items[res.response[0][0][i].id].name.nom = res.response[0][0][i].first_name + " " + res.response[0][0][i].last_name;
        this.items[res.response[1][0][i].id].name.dat = res.response[0][0][i].first_name + " " + res.response[0][0][i].last_name;
        i++;
      }
      i = 0;
      while (i < res.response[0][1].length) {
        this.items[res.response[0][1][i].id] = {
          name: {
            nom: "",
            dat: ""
          }
        };
        this.items[res.response[0][1][i].id].name.nom = res.response[0][1][i].first_name + " " + res.response[0][1][i].last_name;
        this.items[res.response[1][1][i].id].name.dat = res.response[1][1][i].first_name + " " + res.response[1][1][i].last_name;
        i++;
      }
      i = 0;
      _results = [];
      while (i < res.response[2].items.length) {
        this.items[res.response[2].items[i].id] = {
          name: {
            nom: "",
            dat: ""
          }
        };
        this.items[res.response[2].items[i].id].name.nom = res.response[2].items[i].first_name + " " + res.response[2].items[i].last_name;
        this.items[res.response[3].items[i].id].name.dat = res.response[3].items[i].first_name + " " + res.response[3].items[i].last_name;
        _results.push(i++);
      }
      return _results;
    }
  },
  constructReq: function(method, params, callback) {
    var param, req;
    req = "https://api.vk.com/method/" + method + "?";
    for (param in params) {
      req += param + "=" + params[param] + "&";
    }
    req += "v=" + this.session.APIversion + "&access_token=" + this.session.access_token;
    return req;
  },
  makeReq: function(method, params, callback, ifSuccess, ifError) {
    var url;
    url = this.constructReq(method, params, callback);
    return $.get(url, function(res) {
      if (ifSuccess) {
        return ifSuccess(res);
      } else {
        return console.log(res);
      }
    });
  },
  sort: function(arr, param) {
    var i, j, output, tmp, _i, _j, _ref, _ref1;
    output = arr;
    tmp;
    for (i = _i = 0, _ref = output.length - 1; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      for (j = _j = 0, _ref1 = output.length - i - 1; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        if (output[j][param] > output[j + 1][param]) {
          tmp = output[j];
          output[j] = output[j + 1];
          output[j + 1] = tmp;
        }
      }
    }
    return output;
  },
  init: function() {
    port = chrome.runtime.connect({
      name: 'whoop'
    });
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.greeting === "hello") {
        return $.get(request.url + PashutkVK.session.access_token, function() {
          return port.postMessage({
            name: 'successSend',
            response: true
          });
        });
      }
    });
    PashutkVK.friends.friendsRequest();
    return PashutkVK.messages.lastMessageListener.listener = setInterval(function() {
      return PashutkVK.messages.lastMessageListener.listenerFunc();
    }, PashutkVK.messages.lastMessageListener.timerInterval);
  }
};

res = "https://oauth.vk.com/blank.html#access_token=009aee2f5405bddff643a00e2ff08dec298571cbd21539196ec85785da9b23e023ed2eaec88fd0f831f23&expires_in=0&user_id=15676642&email=djlewap@gmail.com";

params = res.substr(res.search("#") + 1).split("&");

i = 0;

while (i < params.length) {
  PashutkVK.session[params[i].substring(0, params[i].search("="))] = params[i].substring(params[i].search("=") + 1);
  i++;
}

chrome.app.runtime.onLaunched.addListener(function() {
  return chrome.app.window.create('index.html', {
    bounds: {
      width: 640,
      height: 480
    }
  }, function(createdWindow) {
    return createdWindow.contentWindow.onload = function() {
      return PashutkVK.init();
    };
  });
});
