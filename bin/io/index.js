var socketio  =  require('socket.io');
var io = null;                                      // Сокет

var pays = require('../pays');
var paysManager = new pays();

var userList = {};                                  // Профили пользователей по сокетам
var roomList = {};                                  // Комнаты по сокетам
var rooms    = {};                                  // Комнаты по их именам
var profiles = {};                                  // Профили пользователей по id (надо бы убрать)

var initProfile       = require('./lib/init_profile');
//var sendPublicMessage = require('./chat_io/send_public_message');
//var exit              = require('./chat_io/exit');
var chooseRoom        = require('./lib/choose_room');
var getRooms          = require('./lib/get_rooms');
var changeRoom        = require('./lib/change_room');
var changeStatus      = require('./lib/change_status');
var getProfile        = require('./lib/get_profile');
var getGifts          = require('./lib/get_gifts');
var getPrivMes        = require('./lib/get_private_messages');
var openPrivateChat   = require('./lib/open_private_chat');
var closePrivateChat  = require('./lib/close_private_chat');
var getFriends        = require('./lib/get_friends');
var getGuests         = require('./lib/get_guests');
var addToFriends      = require('./lib/add_to_friends');
var makeGift          = require('./lib/make_gift');
var sendMessage       = require('./lib/send_message');
var openPrivMes       = require('./lib/open_private_message');
var getTop            = require('./lib/get_top');
var getGiftShop       = require('./lib/get_gift_shop');
//var changeMoney       = require('./money_io/change_money');
var disconnect       = require('./lib/disconnect');

/*
При подключении выполняем инициализацию и вешаем эмиттеры
 */
module.exports.listen = function(server, callback) {
  io = socketio.listen(server);
  //io.set('log level', 1);
  io.set('origins', '*:*'); // 'dev.foo.com:* foo.com:* 10.10.17.252:* www.foo.com:* https://dev.foo.com:* https://foo.com:* https://10.10.17.252:* https://www.foo.com:*'

  io.sockets.on('connection', function (socket) {
    // Чат
    initProfile(socket, userList, profiles, roomList, rooms);
    //sendPublicMessage(socket, userList, roomList);
    //exit(socket, userList, profiles, roomList, rooms);
    chooseRoom(socket, userList, roomList, rooms, profiles);
    getRooms(socket, userList, rooms);
    changeRoom(socket, userList, rooms, roomList);
    changeStatus(socket, userList);

    // Профиль
    getProfile(socket, userList, profiles);
    getGifts(socket, userList);
    getPrivMes(socket, userList);
    getFriends(socket, userList);
    getGuests(socket, userList);
    addToFriends(socket, userList, profiles);
    makeGift(socket, userList, profiles);
    sendMessage(socket, userList, profiles, roomList);
    openPrivMes(socket, userList);
    openPrivateChat(socket, userList, profiles);
    closePrivateChat(socket, userList, profiles);
    disconnect(socket, userList, profiles, roomList, rooms);

    // Топ
    getTop(socket, userList);
    // Магазин
    getGiftShop(socket, userList);
    // Деньги
    //changeMoney(socket, userList);
    // Игра

  });
  callback(null, paysManager);
};

