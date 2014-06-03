// Wordlist from /usr/share/dict/american-english

var DICTFILE = "dictionary";
var WORDLIST = "words";

var http = require("http"),
    fs   = require("fs");

function createJSON(wordlist, output, callback) {
  return !output || !wordlist ||
  fs.readFile(wordlist, "utf-8", function(err, data) {
    if (err) {
      throw err;
    }
    var dict = {};
    data = data.split("\n").filter(function(e) {
      return e && e.search(/[^a-zA-Z]/) === -1;
    }).map(function(e) {
      return e.toLowerCase();
    });
    for (var i = 0, l = data.length; i < l; ++i) {
      var sorted = data[i].split("").sort().join("");
      if (dict[sorted] === undefined) {
        dict[sorted] = [];
      }
      if (dict[sorted].indexOf(data[i]) === -1) {
        dict[sorted].push(data[i]);
      }
    }
    fs.writeFile(output, JSON.stringify(dict), callback);
  });
}

function init() {
  fs.readFile(DICTFILE, "utf-8", function(err, dictionary) {
    if (err) {
      throw err;
    }
    dictionary = JSON.parse(dictionary);
    http.createServer(function(request, response) {
      if (request.method === "POST") {
        var data = "";
        request.on("data", function(chunk) {
          data += chunk;
        });
        request.on("end", function() {
          if (data.constructor === String && data.length) {
            var unscrambled = dictionary[data.split("").sort().join("")];
            if (unscrambled) {
              response.writeHead(200, {"Content-Type": "text/plain"});
              response.write(unscrambled.join(", "));
            }
            response.end();
          }
        });
      }
    }).listen(8888);
  });
}

if (!fs.existsSync(DICTFILE)) {
  createJSON(WORDLIST, DICTFILE, init);
} else {
  init();
}
