var Config = require('./../config.json');

// Макс. количество игроков одного пола в комнате
module.exports.ONE_SEX_IN_ROOM  = Config.io.one_sex_in_room;

// Пол игрока
module.exports.GUY              = Config.user.constants.sex.male;
module.exports.GIRL             = Config.user.constants.sex.female;

// Поля для защищенной подписи
module.exports.APIID            = Config.auth.APIID;
module.exports.APISECRET        = Config.auth.APISECRET;

// Размер истории комнаты
module.exports.LEN_ROOM_HISTORY = Config.io.len_room_history;

// Таймаут отключения от сервера
module.exports.EXIT_TIMEOUT     = Config.io.exit_timeout;

// Таймаут ожидания запроса от клиента перед отключением ???
module.exports.REQUEST_TIMEOUT  = 3600000;

// Идентификатор для создания новой комнаты
module.exports.NEW_ROOM         = "new_room";
// Размер топа
module.exports.TOP_USERS        = Number(Config.user.settings.top_size);
// Бонус за добавление в меню
module.exports.MENU_BONUS       = Number(Config.moneys.menu_bonus);
// Цена подарка
module.exports.GIFT_MONEY       = Number(Config.moneys.gift_price);

// Старовый баланс
module.exports.START_MONEY      = Number(Config.moneys.start_money);

// Длительность отображения подарка на аве
module.exports.GIFT_TIMEOUT     = Number(Config.user.settings.gift_timeout);

// Типы товаров
module.exports.GT_GIFT          = "gift";
module.exports.GT_MONEY         = "money";

// Цена добавления трека
module.exports.TRACK_PRICE      = Number(Config.moneys.track_price);

// статусы операций
module.exports.RS_GOODSTATUS    = "success";
module.exports.RS_BADSTATUS     = "fail";

module.exports.LIKE_BONUS_POINTS = "1";

// ошибки
module.exports.errors = {
  NO_SUCH_GOOD        : { message: "Нет такого товара",                                                   code : 401},
  SELF_ILLEGAL        : { message: "Нельзя выполнить это действие в свой адрес",                          code : 410 },
  TOO_LITTLE_MONEY    : { message: "Недостаточно монет",                                                  code : 405 },
  ONLY_FRIEND         : { message: "Подарок можно сделать только другу (монеты)",                         code : 406 },
  ACTON_TIMEOUT       : { message: "Таймаут на это действие еще не истек",                                code : 407 },
  ALREADY_IS_MENU     : { message: "Добавить в меню - этот пользователь уже добавил приложение в меню",   code : 415 },
  NO_SUCH_ROOM        : { message: "Нет комнаты с таким идентификатором",                                 code : 420 },
  ALREADY_IN_ROOM     : { message: "Пользователь уже в этой комнате",                                     code : 421 },
  ROOM_IS_FULL        : { message: "Попытка перейти в комнату, в которой нет свободных мест",             code : 422 },
  NO_SUCH_CHAT        : { message: "Чат с этим пользователем не существует",                              code : 430 },
  NO_THAT_PLAYER      : { message: "Нельзя выбрать этого игрока",                                         code : 440 },
  NOT_IN_PRISON       : { message: "Этот игрок не находится в тюрьме",                                    code : 441 },
  IS_ALREADY_SELECTED : { message: "В игре Симпатии нельзя выбрать несколько раз одного и того же игрока",code : 442 },
  FORBIDDEN_CHOICE    : { message: "В игре Симпатии нельзя выбрать того, кого нет среди игроков",         code : 443 },
  ALREADY_IS_TRACK    : { message: "Трек с таким ид уже есть в плей-листе",                               code : 451 },
  NO_SUCH_TRACK       : { message: "В плей-листе нет трека с таким ид",                                   code : 452 },
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

module.exports.IO_ADD_TRECK           = 'add_track';
module.exports.IO_GET_TRACK_LIST      = 'get_track_list';
module.exports.IO_LIKE_TRACK          = 'like_track';
module.exports.IO_DISLIKE_TRACK       = 'dislike_track';
module.exports.IO_START_TRACK         = 'start_track';

module.exports.IO_ADD_QUESTION        = 'add_question';
module.exports.IO_DEL_QUESTION        = 'del_question';
module.exports.IO_SHOW_QUESTIONS      = 'show_questions';
module.exports.IO_DEL_ALL_QUESTIONS   = 'del_all_questions';
module.exports.IO_GAME_ERROR          = 'game_error';
module.exports.IO_LIKE_PROFILE        = 'like';
module.exports.IO_SET_VIEWED          = 'viewed';

module.exports.VIEWED_TYPE            = {
  'FRIENDS' : 'friends',
  'GUESTS'  : 'guests',
  'GIFTS'   : 'gifts',
  'MESSAGES': 'messages'
};

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

module.exports.G_START                = G_START;
module.exports.G_LOT                  = G_LOT;
module.exports.G_BOTTLE               = G_BOTTLE;
module.exports.G_BOTTLE_KISSES        = G_BOTTLE_KISSES;
module.exports.G_QUESTIONS            = G_QUESTIONS;
module.exports.G_CARDS                = G_CARDS;
module.exports.G_BEST                 = G_BEST;
module.exports.G_SYMPATHY             = G_SYMPATHY;
module.exports.G_SYMPATHY_SHOW        = G_SYMPATHY_SHOW;
module.exports.G_PRISON               = G_PRISON;

// Игры с тюрьмой и без
// module.exports.GAMES                  = [ G_BOTTLE, G_QUESTIONS, G_CARDS, G_BEST, G_SYMPATHY, G_PRISON];
 module.exports.GAMES = [ G_SYMPATHY, G_SYMPATHY ];
// module.exports.GAMES_WITHOUT_PRISON   = [ G_BOTTLE, G_QUESTIONS, G_CARDS, G_BEST, G_SYMPATHY];
module.exports.GAMES_WITHOUT_PRISON = [G_SYMPATHY, G_SYMPATHY];

// Количество карт в игре
module.exports.CARD_COUNT             = Number(Config.game.card_count);

module.exports.QUESTIONS_COUNT        = 3;

// Выигрышь за угаданную карту
module.exports.CARD_BOUNUS            = Number(Config.moneys.card_bonus);

// Минимальное количество игроков одного пола в игре
module.exports.PLAYERS_COUNT          = Number(Config.game.players_min);

// Максимальное количество игроков, которых можно указать в игре симпатии
module.exports.SHOW_SYMPATHY_LIMIT    = (Config.game.show_sympathy_limit);

// Количество очков, начисляющихся за обоюдный поцелуй
module.exports.KISS_POINTS            = Number(Config.game.kiss_points);
module.exports.SYMPATHY_POINTS        = Number(Config.game.sympathy_points);
module.exports.BEST_POINTS            = Number(Config.game.best_points);

// Раз в сутки получать из базы список вопросов
module.exports.QUESTIONS_TIMEOUT      = Number(Config.game.questions_timeout); //24 * 60 * 60 * 1000;

// Величина выкупа из тюрьмы
module.exports.RANSOM_PRICE           = Number(Config.moneys.ransom_price);

// Цена просмтора чужоко выбора
module.exports.SYMPATHY_PRICE         = Number(Config.moneys.sympathy_price);

// Таймауты
module.exports.TIMEOUT_LOT            = Number(Config.game.timeouts.lot);
module.exports.TIMEOUT_GAME           = 40000;//= Number(Config.game.timeouts.default);
module.exports.TIMEOUT_BOTTLE         = Number(Config.game.timeouts.bottle);
module.exports.TIMEOUT_RESULTS        = Number(Config.game.timeouts.results);
module.exports.TIMEOUT_PRISON         = Number(Config.game.timeouts.prison);
module.exports.TIMEOUT_SYMPATHY_SHOW  = Number(Config.game.timeouts.sympathy_show);

// Таймаут лайка пользователю - 24 часа
module.exports.TIMEOUT_LIKE           = Number(Config.user.settings.like_timeout);
module.exports.TIMEOUT_ROOM_CHANGE    = Number(Config.user.settings.room_change_timeout);


module.exports.PFIELDS = {
  DATE            : 'date',
  DATE_FROM       : 'first_date',
  DATE_TO         : 'second_date',
  SRC             : 'src',
  TYPE            : 'type',
  TITLE           : 'title',
  INCOMING        : 'incoming',
  TEXT            : 'text',
  OPENED          : 'opened',
  SEX             : 'sex',
  POINTS          : 'points',
  ID_LIST         : 'id_list',
  MONEY           : 'money',
  ID              : 'id',
  VID             : 'vid',
  UGIFTID         : 'gid',
  ORDERID         : 'userid',
  ORDERVID        : 'uservid',
  GIFTID          : 'giftid',
  GOODID          : 'goodid',
  FID             : 'fromid',
  FVID            : 'fromvid',
  GIFT1           : 'gift1',
  AGE             : 'age',
  COUNTRY         : 'country',
  CITY            : 'city',
  STATUS          : 'status',
  ISMENU          : 'ismenu',
  SUM             : 'sum',
  PRICE           : 'price',
  GOODTYPE        : 'goodtype',
  ISNEW           : 'is_new',
  GIFTS           : 'gifts',
  BDATE           : 'bdate',
  CHATID          : 'chat',
  CHATVID         : 'chatVID',
  NUMBER          : 'number',
  PRICE2          : 'price2',
  FSEX            : 'usex',
  FBDATE           : 'ubdate',
  INDEX           : 'index',
  ISFRIEND        : 'is_friend',
  
  ISPRIVATE       : 'is_private',
  MESSAGEID       : 'messageid',
  ROOM            : 'room',
  TARGET          : 'target',
  PICK            : 'pick',
  AUTHKEY         : 'auth_key',
  TRACKID         : 'track_id',
  DURATION        : 'duration',
  LIKES           : 'lickes',
  DISLIKES        : 'dislikes',
  TRACKLIST       : 'track_list',
  TRACK           : 'track',
  PASSED_TIME     : 'passed_time',
  ROOMNAME        : 'name',
  RANDOM          : 'random',
  FRIENDS         : 'friends',
  ROOMS           : 'rooms',
  CHATS           : 'chats',
  NEWCHATS        : 'new_chats',
  NEWMESSAGES     : 'new_messages',
  NEWGIFTS        : 'new_gifts',
  NEWFRIENDS      : 'new_friends',
  GUESTS          : 'guests',
  NEWGUESTS       : 'new_guests',
  GAME            : 'game',
  LOTS            : 'lots',
  ALL             : 'all',
  GIRLS           : 'girls',
  GUYS            : 'guys',
  PLAYERS         : 'players',
  NEXTGAME        : 'next_game',
  PRISON          : 'prison',
  PICKS           : 'picks',
  GOLD            : 'gold',
  QUESTION        : 'question'
};