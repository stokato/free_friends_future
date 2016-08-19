var socketio  =  require('socket.io');
var ios = require('socket.io-express-session');

var initProfile       = require('./lib/init_profile');

var session = require('./../../lib/session');
var checkSession = require('./checkSession');

var oPool = require('./../objects_pool');


var io = null;                                      // Сокет

//var userList = {},                                  // Профили пользователей по сокетам
//    roomList = {},                                  // Комнаты по сокетам
//    rooms    = {},                                  // Комнаты по их именам
//    profiles = {};                                  // Профили пользователей по id (надо бы убрать)

//oPool.userList = userList;
//oPool.roomList = roomList;
//oPool.rooms = rooms;
//oPool.profiles = profiles;

/*
При подключении выполняем инициализацию и вешаем эмиттеры
 */
module.exports.listen = function(server, callback) {
  //io = socketio.listen(server);
  io = socketio(server);

  //io.set('log level', 1);
  io.set('origins', '*:*'); // 'dev.foo.com:* foo.com:* 10.10.17.252:* www.foo.com:* https://dev.foo.com:* https://foo.com:* https://10.10.17.252:* https://www.foo.com:*'

  io.use(ios(session));

  io.use(checkSession);

  io.sockets.on('connection', function (socket) {

    initProfile(socket);
  });
  callback(null, oPool.profiles);
};

//io.set('authorization', ioSessions({
//  key : 'sid',
//  secret: 'secret',
//  store: session_storage
//}));

// Аутентификация пользователей
//io.set('authorization', function (data, accept) {
//  // Проверяем переданы ли cookie
//  if (!data.headers.cookie)
//    return accept('No cookie transmitted.', false);
//
//  // Парсим cookie
//  data.cookie = cookie.parse(data.headers.cookie);
//
//  // Получаем идентификатор сессии
//  var sid = data.cookie['sid'] || "";
//
//  if (!sid) {
//    accept(null, false);
//  }
//
//  sid = sid.substr(2).split('.');
//  sid = sid[0];
//  data.sessionID = sid;
//
//  // Добавляем метод для чтения сессии
//  // в handshakeData
//  //data.getSession = function(cb) {
//    // Запрашиваем сессию из хранилища
//    session_storage.get(sid, function(err, session) {
//      if (err || !session) {
//        console.log(err);
//        accept(err, false);
//        return;
//      }
//      accept(null, true);
//      //cb(err, session);
//    });
//  //};
//  //accept(null, true);
//});
