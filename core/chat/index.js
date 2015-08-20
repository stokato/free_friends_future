var io = require('socket.io').listen(8080); 

var min = 1,
    max = 999;
    
var date = new Date();

module.exports = io.sockets.on('connection', function (socket) {
    //В качестве ника пока используем случайное число от 1 до 999
    var nickName = Math.random() * (max - min) + min;
    var time = date.toLocaleTimeString();
    // Посылаем клиенту сообщение о том, что он успешно подключился и его имя
    socket.json.send({'event': 'connected', 'name': nickName, 'time': time});
    // Посылаем всем остальным пользователям, что подключился новый клиент и его имя
    socket.broadcast.json.send({'event': 'userJoined', 'name': nickName, 'time': time});
    // Навешиваем обработчик на входящее сообщение
    socket.on('message', function (msg) {
    time = date.toLocaleTimeString();
    // Уведомляем клиента, что его сообщение успешно дошло до сервера
    socket.json.send({'event': 'messageSent', 'name': nickName, 'text': msg, 'time': time});
    // Отсылаем сообщение остальным участникам чата
    socket.broadcast.json.send({'event': 'messageReceived', 'name': nickName, 'text': msg, 'time': time})
    });
});