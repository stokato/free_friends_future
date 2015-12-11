var io = require('socket.io')(3001);
var sockets = io.listen;

//Список пользователей чата
var people = {};


io.on('connection', function(socket) {
  console.log('connect');
  socket.broadcast.emit('user connected', 'К нам пришел' + socket.id);
  socket.on('sendMessage', function(msg) {
    console.log(msg);
    socket.emit('chat', {msg:msg.text, id:socket.id}); // врзвращаю себе сообщения 
    socket.broadcast.emit('chat', {msg:msg.text, id:socket.id});// врзвращаю  остальним людям сообщения 
  });
  socket.on('disconnect', function() {
    console.log('disconnect');
    socket.broadcast.emit('user disconnect', 'Покинул комнату' + socket.id);
    delete people[socket.id];
  });
});