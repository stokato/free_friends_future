//var sendPublicMessage = require('./chat_io/send_public_message');
//var exit              = require('./chat_io/exit');
var chooseRoom      = require('./choose_room'),
  getRooms          = require('./get_rooms'),
  changeRoom        = require('./change_room'),
  changeStatus      = require('./change_status'),
  getProfile        = require('./get_profile'),
  //getGifts          = require('./get_gifts'),
  //getPrivMes        = require('./get_private_chats'),
  openPrivateChat   = require('./open_private_chat'),
  closePrivateChat  = require('./close_private_chat'),
  //getFriends        = require('./get_friends'),
  //getGuests         = require('./get_guests'),
  addToFriends      = require('./add_to_friends'),
  makeGift          = require('./make_gift'),
  sendMessage       = require('./send_message'),
//var openPrivMes       = require('./lib/open_private_message');
  getChatHistory    = require('./get_chat_history'),
  getTop            = require('./get_top'),
  getGiftShop       = require('./get_gift_shop'),
  getMoneyShop      = require('./get_money_shop'),
//var changeMoney       = require('./money_io/change_money');
  getMoney          = require('./get_money'),
  addPoints         = require('./add_points'),
  //joinGame          = require('./join_game'),
  disconnect        = require('./disconnect');

var addAction       = require('../../game/lib/add_action');

// Назначаем эмиты
module.exports = function(socket, userList, profiles, roomList, rooms) {

  //sendPublicMessage(socket, userList, roomList);
  //exit(socket, userList, profiles, roomList, rooms);
  chooseRoom(socket, userList, roomList, rooms, profiles);
  getRooms(socket, userList, rooms);
  changeRoom(socket, userList, rooms, roomList);
  changeStatus(socket, userList);

  // Профиль
  getProfile(socket, userList, profiles);
  //getGifts(socket, userList);
  //getPrivMes(socket, userList);
  //getFriends(socket, userList);
  //getGuests(socket, userList);
  addToFriends(socket, userList, profiles);
  makeGift(socket, userList, profiles);
  sendMessage(socket, userList, profiles, roomList);
  //openPrivMes(socket, userList);
  getChatHistory(socket, userList, profiles);
  openPrivateChat(socket, userList, profiles);
  closePrivateChat(socket, userList, profiles);
  addPoints(socket, userList);
  disconnect(socket, userList, profiles, roomList, rooms);

  // Топ
  getTop(socket, userList);
  // Магазин
  getGiftShop(socket, userList);
  getMoneyShop(socket, userList);
  // Монеты
  //changeMoney(socket, userList);
  getMoney(socket, userList);
  // Игра
  //joinGame(socket, userList, roomList);
  addAction(socket, userList);
};