var socketio  =  require('socket.io');

var initProfile       = require('./lib/init_profile'),
//var sendPublicMessage = require('./chat_io/send_public_message');
//var exit              = require('./chat_io/exit');
    chooseRoom        = require('./lib/choose_room'),
    getRooms          = require('./lib/get_rooms'),
    changeRoom        = require('./lib/change_room'),
    changeStatus      = require('./lib/change_status'),
    getProfile        = require('./lib/get_profile'),
    getGifts          = require('./lib/get_gifts'),
    getPrivMes        = require('./lib/get_private_chats'),
    openPrivateChat   = require('./lib/open_private_chat'),
    closePrivateChat  = require('./lib/close_private_chat'),
    getFriends        = require('./lib/get_friends'),
    getGuests         = require('./lib/get_guests'),
    addToFriends      = require('./lib/add_to_friends'),
    makeGift          = require('./lib/make_gift'),
    sendMessage       = require('./lib/send_message'),
//var openPrivMes       = require('./lib/open_private_message');
    getChatHistory    = require('./lib/get_chat_history'),
    getTop            = require('./lib/get_top'),
    getGiftShop       = require('./lib/get_gift_shop'),
//var changeMoney       = require('./money_io/change_money');
    getMoney          = require('./lib/get_money'),
    joinGame          = require('./lib/join_game'),
    disconnect        = require('./lib/disconnect');

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
    //openPrivMes(socket, userList);
    getChatHistory(socket, userList, profiles);
    openPrivateChat(socket, userList, profiles);
    closePrivateChat(socket, userList, profiles);
    disconnect(socket, userList, profiles, roomList, rooms);

    // Топ
    getTop(socket, userList);
    // Магазин
    getGiftShop(socket, userList);
    // Деньги
    //changeMoney(socket, userList);
    getMoney(socket, userList);
    // Игра
    joinGame(socket, userList, roomList);
  });
  callback(null, null);
};

