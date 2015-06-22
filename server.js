var express = require('express');

var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded());

app.use(express.static(__dirname + "/static"));

app.set('views', (__dirname+'/views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render("index");
})

var server = app.listen(4444, function(){
	console.log("now da house is bouncing");
})

var io = require('socket.io').listen(server);

var active_chatters = {};

io.sockets.on('connection', function(socket) {
	console.log(socket.id);
	socket.on("new_chatter", function(data){
		console.log(active_chatters);
		socket.emit('chatter_list', active_chatters);
		active_chatters[socket.id] = data.name;
		console.log(active_chatters);
		socket.broadcast.emit('chatter_added', {chatter_added:data.name, socket_id:socket.id});
	});
	socket.on("disconnect", function(){
		delete active_chatters[socket.id];
		socket.broadcast.emit('chatted_deleted', {chatter_id:socket.id});
	})
	socket.on('new_message', function(data) {
		socket.broadcast.emit('new_message', {message:data.message, name: active_chatters[socket.id]});
		socket.emit('user_message', {message:data.message, name: active_chatters[socket.id]});
	})
})
