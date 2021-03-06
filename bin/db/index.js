const addUser             = require('./lib/users/users_add');
const findUser            = require('./lib/users/users_find');
const updateUser          = require('./lib/users/users_update');
const deleteUser          = require('./lib/users/users_delete');
const addGift             = require('./lib/gifts/gifts_add');
const findGifts           = require('./lib/gifts/gifts_find');
const deleteGifts         = require('./lib/gifts/gifts_delete');
const addMessage          = require('./lib/messages/messages_add');
const findMessages        = require('./lib/messages/messages_find');
const updateMessage       = require('./lib/messages/messages_update');
const deleteMessages      = require('./lib/messages/messages_delete');
const addFriend           = require('./lib/friends/friends_add');
const findFriends         = require('./lib/friends/friends_find');
const deleteFriends       = require('./lib/friends/friends_delete');
const addGuest            = require('./lib/guests/guests_add');
const findGuests          = require('./lib/guests/guests_find');
const deleteGuests        = require('./lib/guests/guests_delete');

const findGood            = require('./lib/shop/shop_find');
const findAllGoods        = require('./lib/shop/shop_find_all');
const deleteGood          = require('./lib/shop/shop_delete');
const addGood             = require('./lib/shop/shop_add');
const updateGood          = require('./lib/shop/shop_update');

const findCoins           = require('./lib/coins/coins_find');
const findAllCoins        = require('./lib/coins/coins_find_all');
const deleteCoins         = require('./lib/coins/coins_delete');
const addCoins            = require('./lib/coins/coins_add');
const updateCoins         = require('./lib/coins/coins_update');

const findChats           = require('./lib/chats/chats_find');
const addOrder            = require('./lib/orders/orders_add');
const findOrders          = require('./lib/orders/orders_find');
const addPoints           = require('./lib/points/points_add');
const findPoints          = require('./lib/points/points_find');
const deletePoints        = require('./lib/points/points_delete');
const findAllQuestions    = require('./lib/questions/questions_find_all');
const addQuestion         = require('./lib/questions/questions_add');
const deleteQuestions     = require('./lib/questions/questions_delete');
const deleteAllQuestions  = require('./lib/questions/questions_delete_all');
const findGift            = require('./lib/gifts/gifts_find_one');
const openFriends         = require('./lib/friends/friends_open');
const openGuests          = require('./lib/guests/guests_open');
const openGifts           = require('./lib/gifts/gifts_open');
const addBlocked          = require('./lib/bloked/blocked_add');
const findBlocked         = require('./lib/bloked/blocked_find');
const deleteBlocked       = require('./lib/bloked/blocked_delete');
const usersStatUpdate     = require('./lib/users_stat/users_stat_update');
const usersStatFind       = require('./lib/users_stat/users_stat_find');
const usersStatDelete     = require('./lib/users_stat/users_stat_delete');
const mainStatUpdate      = require('./lib/main_stat/main_stat_update');
const mainStatFind        = require('./lib/main_stat/main_stat_find');
const mainStatEverydayUpdate = require('./lib/main_stat_everyday/main_stat_update');
const mainStatEverydayFind = require('./lib/main_stat_everyday/main_stat_find');
const addUserQuestion     = require('./lib/user_questions/user_questions_add');
const findUserQuestions   = require('./lib/user_questions/user_questions_find');
const deleteUserQuestions = require('./lib/user_questions/user_questions_delete');
const updateQuestion      = require('./lib/questions/questions_update');
const findQuestionsActivity = require('./lib/questions/questions_find_activity');

const addAuthUser        = require('./lib/auth_users/auth_users_add');
const findAuthUser       = require('./lib/auth_users/auth_users_find');
const deleteAuthUser     = require('./lib/auth_users/auth_users_delete');


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

let DBManager = function() {};

DBManager.prototype.addUser                = addUser;
DBManager.prototype.findUser               = findUser;
DBManager.prototype.updateUser             = updateUser;
DBManager.prototype.deleteUser             = deleteUser;
DBManager.prototype.addGift                = addGift;
DBManager.prototype.findGifts              = findGifts;
DBManager.prototype.deleteGifts            = deleteGifts;
DBManager.prototype.addMessage             = addMessage;
DBManager.prototype.updateMessage          = updateMessage;
DBManager.prototype.findMessages           = findMessages;
DBManager.prototype.deleteMessages         = deleteMessages;
DBManager.prototype.addFriend              = addFriend;
DBManager.prototype.findFriends            = findFriends;
DBManager.prototype.deleteFriends          = deleteFriends;
DBManager.prototype.addGuest               = addGuest;
DBManager.prototype.findGuests             = findGuests;
DBManager.prototype.deleteGuests           = deleteGuests;

DBManager.prototype.findGood               = findGood;
DBManager.prototype.findAllGoods           = findAllGoods;
DBManager.prototype.deleteGood             = deleteGood;
DBManager.prototype.addGood                = addGood;
DBManager.prototype.updateGood             = updateGood;

DBManager.prototype.findCoins              = findCoins;
DBManager.prototype.findAllCoins           = findAllCoins;
DBManager.prototype.deleteCoins            = deleteCoins;
DBManager.prototype.addCoins               = addCoins;
DBManager.prototype.updateCoins            = updateCoins;

DBManager.prototype.findChats              = findChats;
DBManager.prototype.addOrder               = addOrder;
DBManager.prototype.findOrders             = findOrders;
DBManager.prototype.addPoints              = addPoints;
DBManager.prototype.findPoints             = findPoints;
DBManager.prototype.deletePoints           = deletePoints;
DBManager.prototype.findAllQuestions       = findAllQuestions;
DBManager.prototype.findGift               = findGift;
DBManager.prototype.addQuestion            = addQuestion;
DBManager.prototype.deleteQuestions        = deleteQuestions;
DBManager.prototype.deleteAllQuestions     = deleteAllQuestions;
DBManager.prototype.openFriends            = openFriends;
DBManager.prototype.openGuests             = openGuests;
DBManager.prototype.openGifts              = openGifts;
DBManager.prototype.addBlocked             = addBlocked;
DBManager.prototype.findBlocked            = findBlocked;
DBManager.prototype.deleteBlocked          = deleteBlocked;
DBManager.prototype.updateUserStat         = usersStatUpdate;
DBManager.prototype.findUserStat           = usersStatFind;
DBManager.prototype.deleteUserStat         = usersStatDelete;
DBManager.prototype.updateMainStat         = mainStatUpdate;
DBManager.prototype.findMainStat           = mainStatFind;
DBManager.prototype.updateMainStatEveryday = mainStatEverydayUpdate;
DBManager.prototype.findMainStatEveryday   = mainStatEverydayFind;
DBManager.prototype.addUserQuestion        = addUserQuestion;
DBManager.prototype.findUserQuestions      = findUserQuestions;
DBManager.prototype.deleteUserQuestions    = deleteUserQuestions;
DBManager.prototype.updateQuestion         = updateQuestion;
DBManager.prototype.findQuestionsActivity  = findQuestionsActivity;

DBManager.prototype.addAuthUser            = addAuthUser;
DBManager.prototype.findAuthUser           = findAuthUser;
DBManager.prototype.deleteAuthUser         = deleteAuthUser;

module.exports = DBManager;



