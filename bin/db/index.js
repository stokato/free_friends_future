var addUser           = require('./lib/users_add'),
  findUser            = require('./lib/users_find'),
  findAllUsers        = require('./lib/users_find_all'),
  updateUser          = require('./lib/users_update'),
  deleteUser          = require('./lib/users_delete'),
  addGift             = require('./lib/gifts_add'),
  findGifts           = require('./lib/gifts_find'),
  deleteGifts         = require('./lib/gifts_delete'),
  addMessage          = require('./lib/messages_add'),
  findAllMessages     = require('./lib/messages_find_all'),
  findMessages        = require('./lib/messages_find'),
  updateMessage       = require('./lib/messages_update'),
  deleteMessages      = require('./lib/messages_delete'),
  addFriend           = require('./lib/friends_add'),
  findFriends         = require('./lib/friends_find'),
  deleteFriends       = require('./lib/friends_delete'),
  addGuest            = require('./lib/guests_add'),
  findGuests          = require('./lib/guests_find'),
  deleteGuests        = require('./lib/guests_delete'),
  addGood             = require('./lib/shop_add'),
  findGood            = require('./lib/shop_find'),
  findAllGoods        = require('./lib/shop_find_all'),
  deleteGood          = require('./lib/shop_delete'),
  findChats           = require('./lib/chats_find'),
  addOrder            = require('./lib/orders_add'),
  findOrders          = require('./lib/orders_find'),
  //addPurchase         = require('./lib/purchases_add'),
  //findPurchase        = require('./lib/purchases_find'),
  //deletePurchase      = require('./lib/purchases_delete'),
  addPoints           = require('./lib/points_add'),
  findPoints          = require('./lib/points_find'),
  deletePoints        = require('./lib/points_delete'),
  findAllQuestions    = require('./lib/questions_find_all'),
  findGift            = require('./lib/gifts_find_one');


/**
 * Класс, обеспечивающий работу с БД Кассандра
 * содержит методы - добавить пользователя (обязательные поля - ид и имя) - возвращает добавленного
 *                 - найти пользователя (ид) - возвращает найденного
 *                 - изменить пользователя (ид, имя) - возвращает ид
 *                 - удалить пользователя (ид) - возвращает ид
 *                 - добавить, найти, удалить подарки
 *                 - добавить, найти, удалить историю сообщений
 *                 - добавить, найти, найти одного, удалить друзей
 *                 - добавить, найти, удалить гостей
 *                 - добавить, найти, удалить товар (магазин)
 */
var DBManager = function() {
};

DBManager.prototype.addUser           = addUser;
DBManager.prototype.findUser          = findUser;
DBManager.prototype.findAllUsers      = findAllUsers;
DBManager.prototype.updateUser        = updateUser;
DBManager.prototype.deleteUser        = deleteUser;
DBManager.prototype.addGift           = addGift;
DBManager.prototype.findGifts         = findGifts;
DBManager.prototype.deleteGifts       = deleteGifts;
DBManager.prototype.addMessage        = addMessage;
DBManager.prototype.updateMessage     = updateMessage;
DBManager.prototype.findAllMessages   = findAllMessages;
DBManager.prototype.findMessages      = findMessages;
DBManager.prototype.deleteMessages    = deleteMessages;
DBManager.prototype.addFriend         = addFriend;
DBManager.prototype.findFriends       = findFriends;
DBManager.prototype.deleteFriends     = deleteFriends;
DBManager.prototype.addGuest          = addGuest;
DBManager.prototype.findGuests        = findGuests;
DBManager.prototype.deleteGuests      = deleteGuests;
DBManager.prototype.addGood           = addGood;
DBManager.prototype.findGood          = findGood;
DBManager.prototype.findAllGoods      = findAllGoods;
DBManager.prototype.deleteGood        = deleteGood;
DBManager.prototype.findChats         = findChats;
DBManager.prototype.addOrder          = addOrder;
DBManager.prototype.findOrders        = findOrders;
//DBManager.prototype.addPurchase     = addPurchase;
//DBManager.prototype.findPurchase    = findPurchase;
//DBManager.prototype.deletePurchase  = deletePurchase;
DBManager.prototype.addPoints         = addPoints;
DBManager.prototype.findPoints        = findPoints;
DBManager.prototype.deletePoints      = deletePoints;
DBManager.prototype.findAllQuestions  = findAllQuestions;
DBManager.prototype.findGift          = findGift;

module.exports = DBManager;