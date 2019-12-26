// server.js

var express = require('express');
var app = express();
var http = require('http').Server(app); 
var io = require('socket.io')(http);    
var path = require('path');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {  
	res.render('main', { title: '온라인 빙고 게임', username: req.query.username });
});

var users = {}; //사용자 저장
var user_count = 0; //현 접속 사용자 수
var turn_count = 0; //누구 차례인가?

io.on('connection', function(socket){ //소켓연결시 발생이벤트(서버)
	
	console.log('user connected : ', socket.id);
	
	socket.on('join', function (data) { //사용자 접속시 발생
		var username = data.username;
		socket.username = username;
		
		users[user_count] = {};
		users[user_count].id = socket.id;
		users[user_count].name = username;
		users[user_count].turn = false;
		user_count++;
		
		io.emit('update_users', users, user_count); //사용자목록 업데이트 출력
	});
	
	socket.on('game_start', function (data) { //클라이언트가 게임시작버튼 누름 
		socket.broadcast.emit("game_started", data); //게임시작 알림
		users[turn_count].turn = true; //사용자의 턴값(빙고판 숫자 선택 가능)
		
		io.emit('update_users', users); //해당 사용자 순서 알려줌
	});
	
	socket.on('select', function (data) { //숫자 선택할 때
		socket.broadcast.emit("check_number", data);
		
		users[turn_count].turn = false; //현재 사용자 턴 종료
		turn_count++;
		
		if(turn_count >= user_count) {
			turn_count = 0;
		}
		users[turn_count].turn = true; //다음 사용자 턴 tue
		
		io.sockets.emit('update_users', users);
	});
	
	socket.on('disconnect', function() { //사용자가 접속 종료했을 때
		console.log('user disconnected : ', socket.id, socket.username);
		for(var i=0; i<user_count; i++){
			if(users[i].id == socket.id)
				delete users[i];
		}	
		
		user_count--;
		io.emit('update_users', users, user_count); //사용자 나가면 상대방도 알 수 있도록 유저 리스트를 업데이트
	});
});

http.listen(3000, function(){ //4
  console.log('server on!');
});
