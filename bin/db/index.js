var cassandra = require('cassandra-driver');
var async = require('async');
var Config = require('../../config.json').cassandra; // Настойки доступа к БД
                                                  // Клиент Кассанда
var client = new cassandra.Client({contactPoints: [Config.host],
                                  keyspace: Config.keyspace});

var Uuid = cassandra.types.Uuid;  // Генератор id для Cassandra
var TimeUuid = cassandra.types.TimeUuid;
var addUser             = require('./lib/users_add');
var findUser            = require('./lib/users_find');
var findAllUsers        = require('./lib/users_find_all');
var updateUser          = require('./lib/users_update');
var deleteUser          = require('./lib/users_delete');
var addGift             = require('./lib/gifts_add');
var findGifts           = require('./lib/gifts_find');
var deleteGifts         = require('./lib/gifts_delete');
var addMessage          = require('./lib/messages_add');
var findAllMessages     = require('./lib/messages_find_all');
var findMessages        = require('./lib/messages_find');
var updateMessage       = require('./lib/messages_update');
var deleteMessages      = require('./lib/messages_delete');
var addFriend           = require('./lib/friends_add');
var findFriends         = require('./lib/friends_find');
var deleteFriends       = require('./lib/friends_delete');
var addGuest            = require('./lib/guests_add');
var findGuests          = require('./lib/guests_find');
var deleteGuests        = require('./lib/guests_delete');
var addGood             = require('./lib/shop_add');
var findGood            = require('./lib/shop_find');
var findAllGoods        = require('./lib/shop_find_all');
var deleteGood          = require('./lib/shop_delete');
var findChats           = require('./lib/chats_find');
var addOrder            = require('./lib/orders_add');

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
 this.client = client;
 this.uuid = Uuid;
 this.timeUuid = TimeUuid;
};

DBManager.prototype.addUser         = addUser;
DBManager.prototype.findUser        = findUser;
DBManager.prototype.findAllUsers    = findAllUsers;
DBManager.prototype.updateUser      = updateUser;
DBManager.prototype.deleteUser      = deleteUser;
DBManager.prototype.addGift         = addGift;
DBManager.prototype.findGifts       = findGifts;
DBManager.prototype.deleteGifts     = deleteGifts;
DBManager.prototype.addMessage      = addMessage;
DBManager.prototype.updateMessage   = updateMessage;
DBManager.prototype.findAllMessages = findAllMessages;
DBManager.prototype.findMessages    = findMessages;
DBManager.prototype.deleteMessages  = deleteMessages;
DBManager.prototype.addFriend       = addFriend;
DBManager.prototype.findFriends     = findFriends;
DBManager.prototype.deleteFriends   = deleteFriends;
DBManager.prototype.addGuest        = addGuest;
DBManager.prototype.findGuests      = findGuests;
DBManager.prototype.deleteGuests    = deleteGuests;
DBManager.prototype.addGood         = addGood;
DBManager.prototype.findGood        = findGood;
DBManager.prototype.findAllGoods    = findAllGoods;
DBManager.prototype.deleteGood      = deleteGood;
DBManager.prototype.findChats       = findChats;
DBManager.prototype.addOrder        = addOrder;

module.exports = DBManager;