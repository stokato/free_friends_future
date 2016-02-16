var socketio  =  require('socket.io');
var io = null;                                      // Сокет

var userList = {};                                  // Профили пользователей по сокетам
var roomList = {};                                  // Комнаты по сокетам
var rooms    = {};                                  // Комнаты по их именам
var profiles = {};                                  // Профили пользователей по id (надо бы убрать)

var initProfile       = require('./chat_io/init_profile');
var sendPublicMessage = require('./chat_io/send_public_message');
var exit              = require('./chat_io/exit');
var chooseRoom        = require('./chat_io/choose_room');
var getRooms          = require('./chat_io/get_rooms');
var changeRoom        = require('./chat_io/change_room');
var changeStatus      = require('./chat_io/change_status');
var getProfile        = require('./profile_io/get_profile');
var getGifts          = require('./profile_io/get_gifts');
var getPrivMes        = require('./profile_io/get_private_messages');
var openPrivateChat   = require('./profile_io/open_private_chat');
var closePrivateChat  = require('./profile_io/close_private_chat');
var getFriends        = require('./profile_io/get_friends');
var getGuests         = require('./profile_io/get_guests');
var addToFriends      = require('./profile_io/add_to_friends');
var makeGift          = require('./profile_io/make_gift');
var sendPrivMes       = require('./profile_io/send_private_message');
var openPrivMes       = require('./profile_io/open_private_message');
var getTop            = require('./top_io/get_top');
var getGiftShop       = require('./shop_io/get_gift_shop');
//var changeMoney       = require('./money_io/change_money');

/*
При подключении выполняем инициализацию и вешаем эмиттеры
 */
module.exports.listen = function(server, callback) {
  io = socketio.listen(server);
  //io.set('log level', 1);
  io.set('origins', '*:*'); // 'dev.foo.com:* foo.com:* 10.10.17.252:* www.foo.com:* https://dev.foo.com:* https://foo.com:* https://10.10.17.252:* https://www.foo.com:*'

  io.sockets.on('connection', function (socket) {
    // Чат
    initProfile(socket,userList,profiles, roomList, rooms);
    sendPublicMessage(socket, userList, roomList);
    exit(socket, userList, profiles, roomList, rooms);
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
    sendPrivMes(socket, userList, profiles);
    openPrivMes(socket, userList);
    openPrivateChat(socket, userList, profiles);
    closePrivateChat(socket, userList, profiles);

    // Топ
    getTop(socket, userList);
    // Магазин
    getGiftShop(socket, userList);
    // Деньги
    //changeMoney(socket, userList);
    // Игра

  });
  callback();
};

