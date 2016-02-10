/*
 function jounGame() {
 var socket = this;
 if(!checkInput('join_game', socket, userList, null))
 return new GameError(socket, "JOINGAME", "Верификация не пройдена");

 userList[socket.id].setReady();

 var room = roomList[socket.id];
 var allReady = true;
 for(item in room.guys) {
 if(!room.guys[item].getReady()) allReady = false;
 }
 for(item in room.girls) {
 if(!room.girls[item].getReady()) allReady = false;
 }

 if(allReady) room.game.start();
 }
 */