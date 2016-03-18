//var sendPublicMessage = require('./chat_io/send_public_message');
//var exit              = require('./chat_io/exit');
var chooseRoom      = require('./choose_room'),
  getRooms          = require('./get_rooms'),
  changeRoom        = require('./change_room'),
  changeStatus      = require('./change_status'),
  getProfile        = require('./get_profile'),
  getGifts          = require('./trash/get_gifts'),
  getPrivMes        = require('./trash/get_private_chats'),
  openPrivateChat   = require('./open_private_chat'),
  closePrivateChat  = require('./close_private_chat'),
  getFriends        = require('./trash/get_friends'),
  getGuests         = require('./trash/get_guests'),
  addToFriends      = require('./add_to_friends'),
  makeGift          = require('./make_gift'),
  sendMessage       = require('./send_message'),
//var openPrivMes       = require('./lib/open_private_message');
  getChatHistory    = require('./get_chat_history'),
  getTop            = require('./get_top'),
  getGiftShop       = require('./get_gift_shop'),
//var changeMoney       = require('./money_io/change_money');
  getMoney          = require('./get_money'),
  joinGame          = require('./join_game'),
  disconnect        = require('./disconnect');

var addAction       = require('../../game/lib/add_action');

// ��������� ��������� ��� ������
module.exports = function(socket, userList, profiles, roomList, rooms) {

  //sendPublicMessage(socket, userList, roomList);
  //exit(socket, userList, profiles, roomList, rooms);
  chooseRoom(socket, userList, roomList, rooms, profiles);
  getRooms(socket, userList, rooms);
  changeRoom(socket, userList, rooms, roomList);
  changeStatus(socket, userList);

  // �������
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

  // ���
  getTop(socket, userList);
  // �������
  getGiftShop(socket, userList);
  // ������
  //changeMoney(socket, userList);
  getMoney(socket, userList);
  // ����
  joinGame(socket, userList, roomList);
  addAction(socket, userList);
};