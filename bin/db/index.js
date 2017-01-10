const addUser           = require('./lib/users/users_add'),
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
  deleteQuestions      = require('./lib/questions/questions_delete'),
  deleteAllQuestions  = require('./lib/questions/questions_delete_all'),
  findGift            = require('./lib/gifts/gifts_find_one'),
  openFriends         = require('./lib/friends/friends_open'),
  openGuests          = require('./lib/guests/guests_open'),
  openGifts           = require('./lib/gifts/gifts_open'),
  addBlocked          = require('./lib/bloked/blocked_add'),
  findBlocked         = require('./lib/bloked/blocked_find'),
  deleteBlocked       = require('./lib/bloked/blocked_delete'),
  usersStatUpdate     = require('./lib/users_stat/users_stat_update'),
  usersStatFind       = require('./lib/users_stat/users_stat_find'),
  usersStatDelete     = require('./lib/users_stat/users_stat_delete'),
  mainStatUpdate      = require('./lib/main_stat/main_stat_update'),
  mainStatFind        = require('./lib/main_stat/main_stat_find'),
  addUserQuestion     = require('./lib/user_questions/user_questions_add'),
  findUserQuestions   = require('./lib/user_questions/user_questions_find'),
  deleteUserQuestions = require('./lib/user_questions/user_questions_delete'),
  updateQuestion     = require('./lib/questions/questions_update'),
  findQuestionsActivity = require('./lib/questions/questions_find_activity');

const addAuthUser       = require('./lib/auth_users/auth_users_add'),
   findAuthUser       = require('./lib/auth_users/auth_users_find'),
   deleteAuthUser     = require('./lib/auth_users/auth_users_delete');

const dbConstants       = require('./constants').PFIELDS;


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
let DBManager = function() {
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
DBManager.prototype.deleteQuestions    = deleteQuestions;
DBManager.prototype.deleteAllQuestions = deleteAllQuestions;
DBManager.prototype.openFriends       = openFriends;
DBManager.prototype.openGuests        = openGuests;
DBManager.prototype.openGifts         = openGifts;
DBManager.prototype.addBlocked        = addBlocked;
DBManager.prototype.findBlocked       = findBlocked;
DBManager.prototype.deleteBlocked     = deleteBlocked;
DBManager.prototype.updateUserStat    = usersStatUpdate;
DBManager.prototype.findUserStat      = usersStatFind;
DBManager.prototype.deleteUserStat    = usersStatDelete;
DBManager.prototype.updateMainStat    = mainStatUpdate;
DBManager.prototype.findMainStat      = mainStatFind;
DBManager.prototype.addUserQuestion   = addUserQuestion;
DBManager.prototype.findUserQuestions  = findUserQuestions;
DBManager.prototype.deleteUserQuestions = deleteUserQuestions;
DBManager.prototype.updateQuestion  = updateQuestion;
DBManager.prototype.findQuestionsActivity = findQuestionsActivity;

DBManager.prototype.addAuthUser       = addAuthUser;
DBManager.prototype.findAuthUser      = findAuthUser;
DBManager.prototype.deleteAuthUser    = deleteAuthUser;

module.exports = DBManager;



