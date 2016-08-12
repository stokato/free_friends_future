var Config = require('./../config.json');

// Макс. количество игроков одного пола в комнате
module.exports.ONE_SEX_IN_ROOM = Config.io.one_sex_in_room;

// Пол игрока
module.exports.GUY = Config.user.constants.sex.male;
module.exports.GIRL = Config.user.constants.sex.female;

// Поля для защищенной подписи
module.exports.api_id = Config.auth.api_id;
module.exports.api_secret = Config.auth.api_secret;

// Размер истории комнаты
module.exports.LEN_ROOM_HISTORY = Config.io.len_room_history;

// Таймаут отключения от сервера
module.exports.EXIT_TIMEOUT = Config.io.exit_timeout;

// Таймаут ожидания запроса от клиента перед отключением ???
module.exports.REQUEST_TIMEOUT = 3600000;

// Идентификатор для создания новой комнаты
module.exports.NEW_ROOM = "new_room";
// Размер топа
module.exports.TOP_USERS = 100;
// Бонус за добавление в меню
module.exports.MENU_BONUS = 5;
// Цена подарка
module.exports.GIFT_MONEY = 10;

// Типы товаров
module.exports.GT_GIFT = "gift";
module.exports.GT_MONEY = "money";

// статусы операций
module.exports.RS_GOODSTATUS = "success";
module.exports.RS_BADSTATUS = "fail";

// ошибки
module.exports.errors = {
  NO_SUCH_GOOD        : { message: "Нет такого товара",                                                   code : 401},
  SELF_ILLEGAL        : { message: "Нельзя выполнить это действие в свой адрес",                          code : 410 },
  TOO_LITTLE_MONEY    : { message: "Недостаточно монет",                                                  code : 405 },
  ONLY_FRIEND         : { message: "Подарок можно сделать только другу (монеты)",                         code : 406 },
  ALREADY_IS_MENU     : { message: "Добавить в меню - этот пользователь уже добавил приложение в меню",   code : 415 },
  NO_SUCH_ROOM        : { message: "Нет комнаты с таким идентификатором",                                 code : 420 },
  ALREADY_IN_ROOM     : { message: "Пользователь уже в этой комнате",                                     code : 421 },
  ROOM_IS_FULL        : { message: "Попытка перейти в комнату, в которой нет свободных мест",             code : 422 },
  NO_SUCH_CHAT        : { message: "Чат с этим пользователем не существует",                              code : 430 },
  NO_THAT_PLAYER      : { message: "Нельзя выбрать этого игрока",                                         code : 440 },
  NOT_IN_PRISON       : { message: "Этот игрок не находится в тюрьме",                                    code : 441 },
  NO_PARAMS           : { message: "Не заданы необходимые параметры",                                     code : 491 },
  NO_AUTH             : { message: "Ошибка авторизации",                                                  code : 490 },
  OTHER               : { message: "Неизвестная ошибка",                                                  code : 400 }
};

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
module.exports.IO_NEW_FRIEND          = 'new_friend';
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
module.exports.IO_NO_FRIEND           = 'no_friend';
module.exports.IO_GIVE_MONEY          = 'give_money';

module.exports.IO_SERVER_INIT         = 'server_init';
module.exports.IO_NEW_GIFT            = 'new_gift';


// Игры
var G_START         = 'results',
    G_LOT           = 'lot',
    G_BOTTLE        = 'bottle',
    G_BOTTLE_KISSES = 'bottle_kisses',
    G_QUESTIONS     = 'questions',
    G_CARDS         = 'cards',
    G_BEST          = 'best',
    G_SYMPATHY      = 'sympathy',
    G_SYMPATHY_SHOW = 'sympathy_show',
    G_PRISON        = 'prison';

module.exports.G_START            = G_START;
module.exports.G_LOT              = G_LOT;
module.exports.G_BOTTLE           = G_BOTTLE;
module.exports.G_BOTTLE_KISSES    = G_BOTTLE_KISSES;
module.exports.G_QUESTIONS        = G_QUESTIONS;
module.exports.G_CARDS            = G_CARDS;
module.exports.G_BEST             = G_BEST;
module.exports.G_SYMPATHY         = G_SYMPATHY;
module.exports.G_SYMPATHY_SHOW    = G_SYMPATHY_SHOW;
module.exports.G_PRISON           = G_PRISON;

// Игры с тюрьмой и без
module.exports.GAMES = [ G_BOTTLE, G_QUESTIONS, G_CARDS, G_BEST, G_SYMPATHY, G_PRISON];
module.exports.GAMES_WITHOUT_PRISON = [ G_BOTTLE, G_QUESTIONS, G_CARDS, G_BEST, G_SYMPATHY];

// Количество карт в игре
module.exports.CARD_COUNT = 7;

// Выигрышь за угаданную карту
module.exports.CARD_BOUNUS = 50;

// Минимальное количество игроков одного пола в игре
module.exports.PLAYERS_COUNT = 2;

// Максимальное количество игроков, которых можно указать в игре симпатии
module.exports.SHOW_SYMPATHY_LIMIT = 2;

// Количество очков, начисляющихся за обоюдный поцелуй
module.exports.KISS_POINTS = 1;

// Раз в сутки получать из базы список вопросов
module.exports.QUESTIONS_TIMEOUT = 24 * 60 * 60 * 1000;

// Величина выкупа из тюрьмы
module.exports.RANSOM = 50;

// Таймауты
module.exports.TIMEOUT_LOT      = 5 * 1000;
module.exports.TIMEOUT_GAME     = 16 * 1000;
module.exports.TIMEOUT_BOTTLE   = 7 * 1000;
module.exports.TIMEOUT_RESULTS  = 5 * 1000;
module.exports.TIMEOUT_PRISON   = 4 * 1000;

// Таблицы базы данных
module.exports.T_USERS           = 'users';
module.exports.T_USERCHATS       = 'user_chats';
module.exports.T_USERFRIENDS     = 'user_friends';
module.exports.T_USERGIFTS       = 'user_gifts';
module.exports.T_USERGUESTS      = 'user_guests';
module.exports.T_USERMESSAGES    = 'user_messages';
module.exports.T_USERNEWMESSAGES = 'user_new_messages';
module.exports.T_ORDERS          = 'orders';
module.exports.T_USERGOODS       = 'user_goods';
module.exports.T_SHOP            = 'shop';
module.exports.T_USERPOINTS      = 'user_points';
module.exports.T_POINTS          = 'points';
module.exports.T_POINTS_GIRLS    = 'points_girls';
module.exports.T_POINTS_GUYS     = 'points_guys';
module.exports.T_MAX_HANDRED     = 'hundreds';
module.exports.T_QUESTIONS       = 'questions';



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
