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
  addPoints         = require('./trash/add_points'),
  //joinGame          = require('./join_game'),
  disconnect        = require('./disconnect'),
  addToMenu         = require('./add_to_menu'),
  delFromFriends    = require('./del_from_friends');//,
  //giveMoney         = require('./give_money');

var addAction       = require('../../game/lib/add_action'),
    releasePlayer   = require('../../game/lib/release_player');

// Назначаем эмиты
module.exports = function(socket, userList, profiles, roomList, rooms) {

  //sendPublicMessage(socket, userList, roomList);
  //exit(socket, userList, profiles, roomList, rooms);

  // Навигация по комнатам
  chooseRoom(socket, userList, roomList, rooms, profiles);             // Выбрать комнату
  getRooms(socket, userList, rooms, roomList);                         // Получить список доступных комнат
  changeRoom(socket, userList, rooms, roomList);                       // Сменить комнату

  changeStatus(socket, userList);                                       // Сменить статус

  // Профиль
  getProfile(socket, userList, profiles);                               // Получить профиль
  //getGifts(socket, userList);
  //getPrivMes(socket, userList);
  //getFriends(socket, userList);
  //getGuests(socket, userList);
  addToFriends(socket, userList, profiles);                             // Добавить в друзья
  delFromFriends(socket, userList, profiles);                           // Удалить из друзей
  makeGift(socket, userList, profiles, roomList);                       // Сделать подарок
  //giveMoney(socket, userList, profiles, serverProfile);
  sendMessage(socket, userList, profiles, roomList);                    // Отправить сообщение
  //openPrivMes(socket, userList);
  getChatHistory(socket, userList, profiles);                           // Получить историю переписки
  openPrivateChat(socket, userList, profiles);                          // Открыть чат
  closePrivateChat(socket, userList, profiles);                         // Закрыть чат
  addPoints(socket, userList);                                          // Добавить очки
  disconnect(socket, userList, profiles, roomList, rooms);              // Отключиться

  // Топ
  getTop(socket, userList);

  // Магазин
  getGiftShop(socket, userList);                                         // Получить список доступных подарков
  getMoneyShop(socket, userList);                                        // Получить список доступных лотов
  // Монеты
  //changeMoney(socket, userList);
  getMoney(socket, userList);                                            // Получить текущее количество монет

  // Меню
  addToMenu(socket, userList);                                           // Добавить в меню (в ВК)

  // Игра
  //joinGame(socket, userList, roomList);
  addAction(socket, userList);                                            // Действие в игре
  releasePlayer(socket, userList);                                        // Отпустить игрока из темницы
};