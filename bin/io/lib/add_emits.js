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

var addTrack        = require('./add_track'),
    getTrackList    = require('./get_track_list'),
    likeTrack       = require('./like_track'),
    dislikeTrack    = require('./dislike_track');

// Назначаем эмиты
module.exports = function(socket) {

  //sendPublicMessage(socket, userList, roomList);
  //exit(socket, userList, profiles, roomList, rooms);

  // Навигация по комнатам
  chooseRoom(socket);             // Выбрать комнату
  getRooms(socket);                         // Получить список доступных комнат
  changeRoom(socket);                       // Сменить комнату

  changeStatus(socket);                                       // Сменить статус

  // Профиль
  getProfile(socket);                               // Получить профиль
  //getGifts(socket, userList);
  //getPrivMes(socket, userList);
  //getFriends(socket, userList);
  //getGuests(socket, userList);
  addToFriends(socket);                             // Добавить в друзья
  delFromFriends(socket);                           // Удалить из друзей
  makeGift(socket);                       // Сделать подарок
  //giveMoney(socket, userList, profiles, serverProfile);
  sendMessage(socket);                    // Отправить сообщение
  //openPrivMes(socket, userList);
  getChatHistory(socket);                           // Получить историю переписки
  openPrivateChat(socket);                          // Открыть чат
  closePrivateChat(socket);                         // Закрыть чат
  addPoints(socket);                                          // Добавить очки
  disconnect(socket);              // Отключиться

  // Топ
  getTop(socket);

  // Магазин
  getGiftShop(socket);                                         // Получить список доступных подарков
  getMoneyShop(socket);                                        // Получить список доступных лотов
  // Монеты
  //changeMoney(socket, userList);
  getMoney(socket);                                            // Получить текущее количество монет

  // Меню
  addToMenu(socket);                                           // Добавить в меню (в ВК)

  // Игра
  //joinGame(socket, userList, roomList);
  addAction(socket);                                            // Действие в игре
  releasePlayer(socket);                                        // Отпустить игрока из темницы

  // Плеер
  addTrack(socket);                                   // Добавить трек в очередь комнаты
  getTrackList(socket);                               // Получить очередь комнаты
  likeTrack(socket);                                  // Лайкнуть трек
  dislikeTrack(socket);                               // Дизлайкнуть трек
};