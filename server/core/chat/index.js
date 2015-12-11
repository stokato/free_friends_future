var io = require('socket.io')(3001);
var sockets = io.listen;

//Список пользователей чата
var people = {};


io.on('connection', function(socket) {
  console.log('connect');
  socket.broadcast.emit('user connected', 'К нам пришел' + socket.id);
  
socket.on('sendMessage', function(msg) {
    console.log(msg);
    // возвращаю себе сообщения
    socket.emit('chat', {msg:msg.text, id:socket.id});  
    // возвращаю  остальним людям сообщения
    socket.broadcast.emit('chat', {msg:msg.text, id:socket.id}); 
});

// Приватные сообщения
socket.on('private message', function(msg, socket_id) {
    // Возвращаю сам себе сообщение
    socket.emit('chat', {msg:msg.text, id:socket.id});
    //Отправить конкретному пользователю личным сообщением
    io.sockets.socket(socket_id).emit('chat', {msg:msg.text, id:socket.id});
});
  
socket.on('disconnect', function() {
    console.log('disconnect');
    socket.broadcast.emit('user disconnect', 'Покинул комнату' + socket.id);
    delete people[socket.id];
});
  
});