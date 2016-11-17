
var init                            = require('./lib/init/init'),
    addGift                         = require('./lib/db_dap/add_gift'),
    addMessage                      = require('./lib/db_dap/add_message'),
    addPoints                       = require('./lib/db_dap/add_points'),
    addToFriends                    = require('./lib/db_dap/add_to_friends'),
    addToGuests                     = require('./lib/db_dap/add_to_guests'),
    build                           = require('./lib/init/build'),
    getFriends                      = require('./lib/db_dap/get_friends'),
    getSex                          = require('./lib/db_undep/get_sex'),
    getGifts                        = require('./lib/db_dap/get_gifts'),
    getGuests                       = require('./lib/db_dap/get_guests'),
    getPrivateChats                 = require('./lib/db_dap/get_private_chats'),
    getPrivateChatsWithHistory      = require('./lib/db_dap/get_private_chats_with_history'),
    getHistory                      = require('./lib/db_dap/get_history'),
    getID                           = require('./lib/db_undep/get_id'),
    getMoney                        = require('./lib/db_dap/get_money'),
    getNews                         = require('./lib/db_undep/get_news'),
    getPoints                       = require('./lib/db_undep/get_points'),
    getSocket                       = require('./lib/db_undep/get_socket'),
    getStatus                       = require('./lib/db_undep/get_status'),
    getVID                          = require('./lib/db_undep/get_vid'),
    remove                          = require('./lib/db_dap/remove'),
    save                            = require('./lib/db_dap/save'),
    setMoney                        = require('./lib/db_dap/set_money'),
    pay                             = require('./lib/db_dap/pay'),
    setStatus                       = require('./lib/db_dap/set_status'),
    setSocket                       = require('./lib/db_undep/set_socket'),
    addPrivateChat                  = require('./lib/db_undep/add_private_chat'),
    deletePrivateChat               = require('./lib/db_undep/delete_private_chat'),
    isPrivateChat                   = require('./lib/db_undep/is_private_chat'),
    getAge                          = require('./lib/db_undep/get_age'),
    getCity                         = require('./lib/db_undep/get_city'),
    getCountry                      = require('./lib/db_undep/get_country'),
    getPurchase                     = require('./lib/db_dap/get_purchase'),
    setGame                         = require('./lib/db_undep/set_game'),
    getGame                         = require('./lib/db_undep/get_game'),
    setGameIndex                    = require('./lib/db_undep/set_game_index'),
    getGameIndex                    = require('./lib/db_undep/get_game_index'),
    isFriend                        = require('./lib/db_dap/is_friend'),
    isInMenu                        = require('./lib/db_undep/is_in_menu'),
    setInMenu                       = require('./lib/db_dap/set_in_menu'),
    delFromFriends                  = require('./lib/db_dap/del_from_friends'),
    getGift1                        = require('./lib/db_undep/get_gift_1'),
    clearGiftInfo                   = require('./lib/db_dap/clear_gift_info');

var setExitTimeout                  = require('./lib/db_undep/set_exit_timeout'),
    clearExitTimeout                = require('./lib/db_undep/clear_exit_timeout');

/**
 * Класс профиль пользователя, хранит, обменивается с базой и обрабатывает данные о пользователе
 * Свойства: ИД, имя, аватар, возраст, местоположение, статус, пол, очки, деньги (подарки, которы висят на столе ???)
 * Методы: инициализировать - ищет данные о пользователе в базе, если нет - создает новый и заполняет профиль
 *         установить статус, получить статус, установить инф. (прочие свойства), получить инф.,
 *         добавить подарок, получить все подарки,
 *         добавить сообщиение в историю, получить все (или n) сообщений из истории,
 *         добавить друга, получить друзей,
 *         добавить гостя, получить госте,
 *         сохранить текущий профиль в базу,
 *         удалить текущий профиль из базы и очистить все свойства
 */
function Profile() {
  this.pSocket   = null;   // Сокет

  this.pID           = null;   // Внутренний ИД
  this.pVID          = null;   // Внешний
  this.pBDate        = null;

  this.pAge      = 0;      // Возраст
  this.pCountry  = null;   // Страна
  this.pCity     = null;   // Город
  this.pSex      = null;   // пол игрока (1 - женский, 2 - мужской)

  this.pStatus   = null;   // статус (заводит игрок)
  this.pPoints   = 0;      // очки
  this.pMoney    = 0;      // деньги (БД)



  this.pNewMessages = 0;
  this.pNewGifts    = 0;
  this.pNewFriends  = 0;
  this.pNewGuests   = 0;

  this.pPrivateChats = [];  // Сприсок открытых приватных чатов

  this.pExitTimeout;

  this.pGift1   = null;    // На игрвом столе на аватарах игроков весят подарки
  this.pGift1Time = null;

  this.pGift2   = null;

  this.pGame    = null;

  this.gameIndex = 0;

  this.pIsInMenu = false;

}

Profile.prototype.init            = init;
Profile.prototype.build           = build;
Profile.prototype.getSocket       = getSocket;
Profile.prototype.getMoney        = getMoney;
Profile.prototype.getID           = getID;
Profile.prototype.getVID          = getVID;
Profile.prototype.getStatus       = getStatus;
Profile.prototype.getPoints       = getPoints;
Profile.prototype.getNews         = getNews;
Profile.prototype.getSex          = getSex;
Profile.prototype.addGift         = addGift;
Profile.prototype.getGifts        = getGifts;
Profile.prototype.addMessage      = addMessage;
Profile.prototype.getPrivateChats = getPrivateChats;
Profile.prototype.getHistory      = getHistory;
Profile.prototype.setMoney        = setMoney;
Profile.prototype.setStatus       = setStatus;
Profile.prototype.setSocket       = setSocket;
Profile.prototype.addToFriends    = addToFriends;
Profile.prototype.getFriends      = getFriends;
Profile.prototype.addToGuests     = addToGuests;
Profile.prototype.getGuests       = getGuests;
Profile.prototype.save            = save;
Profile.prototype.remove          = remove;
Profile.prototype.getPurchase      = getPurchase;

Profile.prototype.setExitTimeout             = setExitTimeout;
Profile.prototype.clearExitTimeout           = clearExitTimeout;
Profile.prototype.addPrivateChat             = addPrivateChat;
Profile.prototype.deletePrivateChat          = deletePrivateChat;
Profile.prototype.isPrivateChat              = isPrivateChat;
Profile.prototype.getPrivateChatsWithHistory = getPrivateChatsWithHistory;

Profile.prototype.getAge     = getAge;
Profile.prototype.getCity    = getCity;
Profile.prototype.getCountry = getCountry;
Profile.prototype.setGame    = setGame;
Profile.prototype.getGame    = getGame;
Profile.prototype.addPoints  = addPoints;
Profile.prototype.setGameIndex = setGameIndex;
Profile.prototype.getGameIndex = getGameIndex;

Profile.prototype.isFriend = isFriend;
Profile.prototype.isInMenu = isInMenu;
Profile.prototype.setInMenu = setInMenu;
Profile.prototype.delFromFriends = delFromFriends;

Profile.prototype.getGift1  = getGift1;
Profile.prototype.clearGiftInfo = clearGiftInfo;

Profile.prototype.pay = pay;

module.exports = Profile;
