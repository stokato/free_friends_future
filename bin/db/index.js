var addUser           = require('./lib/users/users_add'),
  findUser            = require('./lib/users/users_find'),
  updateUser          = require('./lib/users/users_update'),
  deleteUser          = require('./lib/users/users_delete'),
  addGift             = require('./lib/gifts/gifts_add'),
  findGifts           = require('./lib/gifts/gifts_find'),
  deleteGifts         = require('./lib/gifts/gifts_delete'),
  addMessage          = require('./lib/messages/messages_add'),
  findMessages        = require('./lib/messages/messages_find'),
  updateMessage       = require('./lib/messages/messages_update'),
  deleteMessages      = require('./lib/messages/messages_delete'),
  addFriend           = require('./lib/friends/friends_add'),
  findFriends         = require('./lib/friends/friends_find'),
  deleteFriends       = require('./lib/friends/friends_delete'),
  addGuest            = require('./lib/guests/guests_add'),
  findGuests          = require('./lib/guests/guests_find'),
  deleteGuests        = require('./lib/guests/guests_delete'),
  addGood             = require('./lib/shop/shop_add'),
  findGood            = require('./lib/shop/shop_find'),
  findAllGoods        = require('./lib/shop/shop_find_all'),
  deleteGood          = require('./lib/shop/shop_delete'),
  findChats           = require('./lib/chats/chats_find'),
  addOrder            = require('./lib/orders/orders_add'),
  findOrders          = require('./lib/orders/orders_find'),
  addPoints           = require('./lib/points/points_add'),
  findPoints          = require('./lib/points/points_find'),
  deletePoints        = require('./lib/points/points_delete'),
  findAllQuestions    = require('./lib/questions/questions_find_all'),
  addQuestion         = require('./lib/questions/questions_add'),
  deleteQuestion      = require('./lib/questions/questions_delete'),
  deleteAllQuestions  = require('./lib/questions/questions_delete_all'),
  findGift            = require('./lib/gifts/gifts_find_one'),
  openFriends         = require('./lib/friends/friends_open'),
  openGuests          = require('./lib/guests/guests_open'),
  openGifts           = require('./lib/gifts/gifts_open');


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
  this.CONST = dbConstants;
};

DBManager.prototype.addUser           = addUser;
DBManager.prototype.findUser          = findUser;
DBManager.prototype.updateUser        = updateUser;
DBManager.prototype.deleteUser        = deleteUser;
DBManager.prototype.addGift           = addGift;
DBManager.prototype.findGifts         = findGifts;
DBManager.prototype.deleteGifts       = deleteGifts;
DBManager.prototype.addMessage        = addMessage;
DBManager.prototype.updateMessage     = updateMessage;
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
DBManager.prototype.addPoints         = addPoints;
DBManager.prototype.findPoints        = findPoints;
DBManager.prototype.deletePoints      = deletePoints;
DBManager.prototype.findAllQuestions  = findAllQuestions;
DBManager.prototype.findGift          = findGift;
DBManager.prototype.addQuestion       = addQuestion;
DBManager.prototype.deleteQuestion    = deleteQuestion;
DBManager.prototype.deleteAllQuestions = deleteAllQuestions;
DBManager.prototype.openFriends       = openFriends;
DBManager.prototype.openGuests        = openGuests;
DBManager.prototype.openGifts         = openGifts;

module.exports = DBManager;

var dbConstants = {
  DATE            : "date",
  SRC             : "src",
  GIFTID          : "giftid",
  TYPE            : "type",
  TITLE           : "title",
  INCOMING        : "incoming",
  TEXT            : "text",
  OPENED          : "opened",
  SEX             : "sex",
  POINTS          : "points",
  ID_LIST         : "id_list",
  DATE_FROM       : "first_date",
  DATE_TO         : "second_date",
  MONEY           : "money",
  ID              : "id",
  VID             : "vid",
  AGE             : "age",
  COUNTRY         : "country",
  CITY            : "city",
  STATUS          : "status",
  ISMESSAGES      : "newmessages",
  ISGIFTS         : "newgifts",
  ISFRIENDS       : "newfriends",
  ISGUESTS        : "newguests",
  GIFT1           : "gift1",
  ISMENU          : "ismenu",
  MESSAGEID       : "messageid"
};


