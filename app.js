var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var url = require('url');

var apiKey = '44946792';
//tokbox
var OpenTok = require('opentok'),
opentok = new OpenTok(apiKey, '8b5b05b25b555306dd14f698e42820bf68eafee3');

var Parse = require('node-parse-api').Parse;
var db = new Parse('Z8S2abxIxh5UXd3m8CNncRGbn97pRXYSi4EQ5qnR', 'qWxVPIOKpQUad6kgbGkgt2qfT8B6Li3qnQRFJClq');

//var rooms = Parse.Object.extend("rooms");

var pub = __dirname + '/app';
app.set('port', process.env.PORT || 3000);
app.use(express.static(pub));
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('view options', { layout: false });
app.engine('.html', require('ejs').__express);
app.use(express.static(path.join(__dirname, 'public')));

// Routing for app
app.get('/index', function(req, res){
	res.render('index');
});

//join room
app.get('/create', function(req, res){
	opentok.createSession(function(err, session) {
		if (err) 
			return console.log(err);

		db.insert('rooms', { session: session.sessionId }, function (err, response) {
		  	console.log("new room " + session.sessionId);
		});

		var token = opentok.generateToken(session.sessionId);

		res.render('index', {
			apiKey: apiKey,
			sessionId: session.sessionId,
			token: token
		});

	});
});

app.get('/', function(req, res){
	res.render('login');
});

app.get('/join', function(req, res){

	var sessionId = req.url.split('id=')[1];
	var token = opentok.generateToken(sessionId);
	res.render('index', {
		apiKey: apiKey,
		sessionId: sessionId,
		token: token
	});
	
});


io.on('connection', function (socket) {
	console.log('new user');


	socket.on('editorChange', function (data) {
		socket.broadcast.emit('editorCallback', data);
	});
});


server.listen(app.get('port'), function(){
	console.log('Server initialized at '+ app.get('port'));
});
