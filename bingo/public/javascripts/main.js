//클라이언트쪽 이벤트를 처리
var bingo = {
	is_my_turn: Boolean,
	socket: null,
		
	init: function(socket){ //초기화
		var self = this;
		var user_cnt = 0;
		
		this.is_my_turn = false;
		
		socket = io();

		//서버로부터
		socket.on("check_number", function (data) { 
			self.where_is_it(data.num);
			self.print_msg(data.username + "님이 '" + data.num + "'을 선택했습니다.");
		});
		
		socket.on("game_started", function(data){
			console.log("enter the game_started");
			self.print_msg(data.username + " 님이 게임을 시작했습니다.");
			$("#start_button").hide();
		});
		
		socket.on("update_users", function (data, user_count) {
			console.log(data);
			user_cnt = user_count;
			self.update_userlist(data, socket);
		});

		//server.js join으로 데이터 넘겨줌
		socket.on("connect", function() {
			socket.emit("join", { username: $('#username').val() });
		});
		
		var numbers = [];
		for(var i=1; i<=25; i++){
			numbers.push(i);
		}
		
		numbers.sort(function (a,b) {
			var temp = parseInt(Math.random() * 10);
			var isOddOrEven = temp%2;
			var isPosOrNeg = temp > 5 ? 1 : -1;
			return (isOddOrEven*isPosOrNeg);
		});
		
		$("table.bingo-board td").each(function (i) {
			$(this).html(numbers[i]);
			
			$(this).click(function (){
				if(user_cnt == 1){
					self.print_msg("<알림> 최소 2명부터 게임이 가능합니다.");
				}
				else{
					self.select_num(this, socket);
				}
			});
		});
		
		$("#start_button").click(function () {
			if(user_cnt == 1){
			   self.print_msg("<알림> 최소 2명부터 게임이 가능합니다.");
			}
			else{
				socket.emit('game_start', { username: $('#username').val() });
				self.print_msg("<알림> 게임을 시작했습니다.");
				$("#start_button").hide();
			}
		});
		
	},
	
	// init 끝
	select_num: function (obj, socket) { //사용자가 숫자를 클릭했을 때
		if(this.is_my_turn && !$(obj).attr("checked")) {
			//send num to other players //내차례
			socket.emit("select", { username: $('#username').val(), num: $(obj).text() });		
			this.check_num(obj);
			
			this.is_my_turn = false;
		}
		else {
			this.print_msg("<알림> 차례가 아닙니다!"); //내차례 아닐때
		}
	},
	
	//상대방이 선택한 숫자가 어디인지 찾아서 check_num()이라는 메소드를 호출
	where_is_it: function (num) {
		var self = this;
		var obj = null;
		
		$("table.bingo-board td").each(function (i) {
			if ($(this).text() == num) {
				self.check_num(this);
			}
		});
	},
	
	check_num: function (obj) {
		$(obj).css("text-decoration", "line-through");
		$(obj).css("color", "lightgray");
		$(obj).attr("checked", true); //상대방이 선택한 숫자를 선택할 수 없는 상태로
	},
	
	//사용자 목록과 순서 표시
	update_userlist: function (data, this_socket) {
		var self = this;
		$("#list").empty();
		console.log(data);
		
		$.each(data, function (key, value) {
			var turn = "(-) ";
			if(value.turn === true) {
				turn = "(*) ";
				console.log(value.name);
				console.log($('#username').val());
				if(value.id == this_socket.id ) {
					self.is_my_turn = true;
				}
			}

			if(value.id == this_socket.id ){
				$("#list").append("<font color='DodgerBlue'>" + turn + value.name + "<br></font>");
			}
			else{
				$("#list").append("<font color='black'>" + turn + value.name  + "<br></font>");
			}
			
		});
	},
	
	
	print_msg: function (msg) {
		$("#logs").append(msg + "<br />");
		$('#logs').scrollTop($('#logs')[0].scrollHeight);
	}
};

$(document).ready(function () {
	bingo.init(); //html 로딩 끝
});