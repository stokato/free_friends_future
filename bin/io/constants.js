var Config = require('./../../config.json');

    //IO_GET_FRIENDS = 'get_friends',

    //IO_GET_GIFTS = 'get_gifts',
    //IO_GET_GUESTS = 'get_guests',

    //IO_GET_PRIVATE_CHATS = 'get_private_messages',

module.exports.ONE_SEX_IN_ROOM = Config.io.one_sex_in_room; // Макс. количество игроков одного пола в комнате
module.exports.GUY = Config.user.constants.sex.male;        // Идентификация пола
module.exports.GIRL = Config.user.constants.sex.female;
module.exports.LEN_ROOM_HISTORY = Config.io.len_room_history;
module.exports.EXIT_TIMEOUT = Config.io.exit_timeout;      // Таймаут отключения при вызове клиентом exit
module.exports.REQUEST_TIMEOUT = 3600000;                  // Таймаут ожидания запроса от клиента перед отключением
//module.exports.LEN_PRIVATE_HISTORY = LEN_PRIVATE_HISTORY; // Длина истории приватных сообщений в днях
module.exports.NEW_ROOM = "new_room";
module.exports.TOP_USERS = 100;
module.exports.MENU_BONUS = 5;
module.exports.GIFT_MONEY = 10;

module.exports.GT_GIFT = "gift";
module.exports.GT_MONEY = "money";

//// наименования полей
//module.exports.FIELDS = {
//  id            : 'id',
//  vid           : 'vid',
//  date          : 'date',
//  points        : 'points',
//  sex           : 'sex',
//  age           : 'age',
//  city          : 'city',
//  bdate         : 'bdate',
//  country       : 'country',
//  room          : 'room',
//  status        : 'status',
//  random        : 'random',
//  friends       : 'friends',
//  chats         : 'chats',
//  gifts         : 'gifts',
//  guests        : 'guests',
//  first_date    : 'first_date',
//  second_date   : 'second_date',
//  giftid        : 'giftid',
//  type          : 'type',
//  data          : 'data',
//  text          : 'text',
//  companionid   : 'companionid',
//  companionvid  : 'companionvid',
//  incoming      : 'incoming',
//  chat          : 'chat',
//  chatVID       : 'chatVID',
//  pick          : 'pick',
//  fromid        : 'fromid',
//  fromvid       : 'fromvid',
//  isnew         : 'isnew',
//  userid        : 'userid',
//  friendid      : 'friendid',
//  friendvid     : 'friendvid',
//  guestid       : 'guestid',
//  guestvid      : 'guestvid',
//  newmessages   : 'newmessages',
//  newguests     : 'newguests',
//  newfriends    : 'newfriends',
//  newgifts      : 'newgifts',
//  picks         : 'picks',
//  question      : 'question',
//  best          : 'best',
//  players       : 'players',
//  gold          : 'gold',
//  sum           : 'sum',
//  uservid       : 'uservid',
//  money         : 'money',
//  goodid        : 'goodid',
//  orderid       : 'orderid',
//  title         : 'title',
//  price         : 'price',
//  game          : 'game',
//  next_game     : 'next_game',
//  hundreds      : 'hundreds',
//  hundred       : 'hundred',
//  goodtype      : 'goodtype',
//  ordervid      : 'ordervid',
//  name          : 'name',
//  src           : 'src',
//  prison        : 'prison',
//  messageid     : 'messageid',
//  rep_status    : 'status',
//  succes        : 'succes',
//  fail          : 'fail',
//  error         : 'error',
//  is_friend     : 'friend',
//  is_in_menu    : 'ismenu',
//  uid           : 'uid',
//  price2        : 'price2',
//  gift1         : 'gift1',
//  gift2         : 'gift2',
//  gid           : 'gid'
//};

// емиты
module.exports.IO_INIT                = 'init';
module.exports.IO_MESSAGE             = 'message';
module.exports.IO_PRIVATE_MESSAGE     = 'private_message';
module.exports.IO_GET_ROOMS           = 'get_rooms';
module.exports.IO_GET_CHAT_HISTORY    = 'get_chat_history';
module.exports.IO_GET_GIFT_SHOP       = 'get_gift_shop';
module.exports.IO_GET_MONEY_SHOP      = 'get_money_shop';
module.exports.IO_GET_MONEY           = 'get_money';
module.exports.IO_GET_PROFILE         = 'get_profile';
module.exports.IO_GET_TOP             = 'get_top';
module.exports.IO_ADD_FRIEND          = 'add_friend';
module.exports.IO_CHANGE_ROOM         = 'change_room';
module.exports.IO_CHANGE_STATUS       = 'change_status';
module.exports.IO_CHOOSE_ROOM         = 'choose_room';
module.exports.IO_MAKE_GIFT           = 'make_gift';
module.exports.IO_OPEN_PRIVATE_CHAT   = 'open_private_chat';
module.exports.IO_CLOSE_PRIVATE_CHAT  = 'close_private_chat';
module.exports.IO_JOIN_GAME           = 'join_game';
module.exports.IO_DISCONNECT          = 'disconnect';
module.exports.IO_GET_NEWS            = 'get_news';
module.exports.IO_ONLINE              = 'online';
module.exports.IO_OFFLINE             = 'offline';
module.exports.IO_ADD_GUEST           = 'add_guest';
module.exports.IO_ADD_POINTS          = 'add_points';
module.exports.IO_GAME                = 'game';
module.exports.IO_RELEASE_PLAYER      = 'release';
module.exports.IO_ERROR               = 'err';

module.exports.IO_ROOM_USERS          = 'room_users';
module.exports.IO_ADD_TO_MENU         = 'add_to_menu';
module.exports.IO_DEL_FROM_FRIENDS    = 'del_friend';
module.exports.IO_GIVE_MONEY          = 'give_money';

module.exports.IO_SERVER_INIT         = 'server_init';
module.exports.IO_NEW_GIFT            = 'new_gift';
