var socketio  =  require('socket.io');

var initProfile       = require('./lib/init_profile');

var io = null;                                      // Сокет

var userList = {},                                  // Профили пользователей по сокетам
    roomList = {},                                  // Комнаты по сокетам
    rooms    = {},                                  // Комнаты по их именам
    profiles = {};                                  // Профили пользователей по id (надо бы убрать)

/*
При подключении выполняем инициализацию и вешаем эмиттеры
 */
module.exports.listen = function(server, callback) {
  io = socketio.listen(server);
  //io.set('log level', 1);
  io.set('origins', '*:*'); // 'dev.foo.com:* foo.com:* 10.10.17.252:* www.foo.com:* https://dev.foo.com:* https://foo.com:* https://10.10.17.252:* https://www.foo.com:*'

  io.sockets.on('connection', function (socket) {
    initProfile(socket, userList, profiles, roomList, rooms);
  });
  callback(null, null);
};

