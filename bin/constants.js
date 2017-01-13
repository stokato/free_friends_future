const Config = require('./../config.json');

// Макс. количество игроков одного пола в комнате
module.exports.ONE_SEX_IN_ROOM  = Config.io.one_sex_in_room;

// Пол игрока
module.exports.GUY              = Config.user.constants.sex.male;
module.exports.GIRL             = Config.user.constants.sex.female;

// Размер истории комнаты
module.exports.LEN_ROOM_HISTORY = Config.io.len_room_history;

// Таймаут ожидания запроса от клиента перед отключением ???
module.exports.REQUEST_TIMEOUT  = 3600000;

// Идентификатор для создания новой комнаты
module.exports.NEW_ROOM         = "new_room";

// Типы товаров
module.exports.GT_GIFT          = "gift";
module.exports.GT_MONEY         = "money";

// Порция вопросов пользователей
module.exports.QUESTIONS_COUNT = 100;

// статусы операций
module.exports.RS_GOODSTATUS    = "success";
module.exports.RS_BADSTATUS     = "fail";

module.exports.LIKE_BONUS_POINTS = "1";

module.exports.RANKS = {
  GENEROUS  : 'generous',
  POPULAR   : 'popular',
  DJ        : 'dj',
  LUCKY     : 'lucky',
  RELEASER  : 'releaser'
};

module.exports.ALMIGHTY = 'almighty';

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
  IN_BLACK_LIST       : { message: "Этот пользователь в черном списке",                                   code : 431 },
  NO_THAT_PLAYER      : { message: "Нельзя выбрать этого игрока",                                         code : 440 },
  NOT_IN_PRISON       : { message: "Этот игрок не находится в тюрьме",                                    code : 441 },
  IS_ALREADY_SELECTED : { message: "В игре Симпатии нельзя выбрать несколько раз одного и того же игрока",code : 442 },
  FORBIDDEN_CHOICE    : { message: "В игре Симпатии нельзя выбрать того, кого нет среди игроков",         code : 443 },
  ALREADY_IS_TRACK    : { message: "Трек с таким ид уже есть в плей-листе",                               code : 451 },
  NO_SUCH_TRACK       : { message: "В плей-листе нет трека с таким ид",                                   code : 452 },
  BLOCK_FREE_TRACK    : { message: "Сейчас нельзя добавить бесплатный трек",                              code : 453 },
  NO_PARAMS           : { message: "Не заданы необходимые параметры",                                     code : 491 },
  NO_AUTH             : { message: "Ошибка авторизации",                                                  code : 490 },
  NO_SUCH_RUNK        : { message: "Пользователь не обладает таким званием",                              code : 411 },
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
module.exports.IO_HIDE_GIFT           = 'hide_gift';

module.exports.IO_ADD_TRECK           = 'add_track';
module.exports.IO_GET_TRACK_LIST      = 'get_track_list';
module.exports.IO_LIKE_TRACK          = 'like_track';
module.exports.IO_DISLIKE_TRACK       = 'dislike_track';
module.exports.IO_START_TRACK         = 'start_track';
module.exports.IO_STOP_TRACK          = 'stop_track';
module.exports.IO_GET_LIKES_AND_DISLAKES  = 'get_likes_and_dislikes';
module.exports.IO_ADD_TRECK_FREE      = 'add_track_free';
module.exports.IO_GET_FREE_TRACK_STATE = 'free_track_state';

module.exports.IO_ADD_QUESTION        = 'add_question';
module.exports.IO_DEL_QUESTION        = 'del_question';
module.exports.IO_SHOW_QUESTIONS      = 'show_questions';
module.exports.IO_DEL_ALL_QUESTIONS   = 'del_all_questions';
module.exports.IO_GAME_ERROR          = 'game_error';
module.exports.IO_LIKE_PROFILE        = 'like';
module.exports.IO_SET_VIEWED          = 'viewed';
module.exports.IO_BLOCK_USER          = 'block_user';
module.exports.IO_UNBLOCK_USER        = 'unblock_user';
module.exports.IO_BLOCK_USER_NOTIFY   = 'banned_user';

module.exports.IO_NEW_RANK            = 'new_rank';
module.exports.IO_ADD_LEVEL           = 'add_level';
module.exports.IO_GET_RANKS           = 'get_ranks';
module.exports.IO_CHANGE_ACTIVE_RANK  = 'change_active_rank';
module.exports.IO_GET_ACTIVE_RANK     = 'get_active_rank';
module.exports.IO_ADD_BALLS           = 'add_balls';
module.exports.IO_NEW_LEVEL           = 'new_level';

module.exports.VIEWED_TYPE            = {
  'FRIENDS' : 'friends',
  'GUESTS'  : 'guests',
  'GIFTS'   : 'gifts',
  'MESSAGES': 'messages'
};

// Игры
const G_START         = 'results',
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
 module.exports.GAMES                  = [ G_BOTTLE, G_QUESTIONS, G_CARDS, G_BEST, G_SYMPATHY, G_PRISON ];
 module.exports.GAMES_WITHOUT_PRISON   = [ G_BOTTLE, G_QUESTIONS, G_CARDS, G_BEST, G_SYMPATHY ];
 
// module.exports.GAMES = [ G_BOTTLE, G_BOTTLE ];
// module.exports.GAMES_WITHOUT_PRISON = [G_BOTTLE, G_BOTTLE];

// Типы обработчиков
module.exports.GT_ST = 'start';
module.exports.GT_ON = 'onpick';
module.exports.GT_FIN = 'finish';

module.exports.QUESTIONS_COUNT        = 3;

module.exports.GIFT_TYPES = {
  LOVES       : 'Любовь',
  BREATH      : 'Отдых',
  FLOWERS     : 'Цветы',
  DRINKS      : 'Напитки',
  COMMON      : 'Обычные',
  FLIRTATION  : 'Флирт',
  MERRY       : 'Веселье',
  MERRY2      : 'merry'
};

module.exports.MONEY_LOTS = {
  COIN_1      : 'payCoin1',
  COIN_3      : 'payCOin3',
  COIN_10     : 'payCoin10',
  COIN_20     : 'payCoin20',
  COIN_60     : 'payCoin60',
  COIN_200    : 'payCoin200'
};

module.exports.ACTIVITY_RATINGS = {
  ALL         : 3,
  HALF_MORE   : 2,
  HALF_LESS   : 1,
  NONE        : 0
};

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
  FBDATE          : 'ubdate',
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
  LIKES           : 'likes',
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
  QUESTION        : 'question',
  IMAGE_1         : 'image1',
  IMAGE_2         : 'image2',
  IMAGE_3         : 'image3',
  STAT            : 'stat',
  QUESTIONS       : 'questions',
  LOGIN           : 'username',
  PASSWORD        : 'password',
  RANK            : 'rank',
  LEVEL           : 'level',
  FREE_GIFTS      : 'free_gifts',
  FREE_TRACKS     : 'free_tracks',
  VIP             : 'vip',
  
  ISOWNER         : 'is_owner',
  BALLS           : 'balls',
  NEED_BALLS      : 'need_balls',
  ACTIVE_RANK     : 'active_rank',
  IS_ACTIVE       : 'is_active',
  ALL_POINTS      : 'all_points',
  NEW_LEVEL_POINTS    : 'new_level_points',
  CURR_LEVEL_POINTS : 'curr_level_points',
  PROGRESS        : 'progress',
  ACTIVITY        : 'activity',
  GROUP           : 'group',
  GROUP_TITLE     : 'group_title',
  CONTENT         : 'content',
  PRICE_COINS     : 'price_coins',
  PRICE_VK        : 'price_vk'
};

module.exports.SFIELDS = {
  GIFTS_GIVEN         : 'gifts_given',
  GIFTS_TAKEN         : 'gifts_taken',
  COINS_GIVEN         : 'coins_given',
  COINS_EARNED        : 'coins_earned',
  COINS_SPENT         : 'coins_spent',
  BOTTLE_KISSED       : 'bottle_kissed',
  BEST_SELECTED       : 'best_selected',
  RANK_GIVEN          : 'rank_given',
  GAME_TIME           : 'game_time',
  GIFTS_LOVES         : 'gifts_loves',
  GIFTS_BREATH        : 'gifts_breath',
  GIFTS_FLOWERS       : 'gifts_flowers',
  GIFTS_DRINKS        : 'gifts_drinks',
  GIFTS_COMMON        : 'gifts_common',
  GIFTS_FLIRTATION    : 'gifts_flirtation',
  GIFTS_MERRY         : 'gifts_merry',
  MONEY_1_GIVEN       : 'money_1_given',
  MONEY_3_GIVEN       : 'money_3_given',
  MONEY_10_GIVEN      : 'money_10_given',
  MONEY_20_GIVEN      : 'money_20_given',
  MONEY_60_GIVEN      : 'money_60_given',
  MONEY_200_GIVEN     : 'money_200_given',
  MONEY_1_TAKEN       : 'money_1_taken',
  MONEY_3_TAKEN       : 'money_3_taken',
  MONEY_10_TAKEN      : 'money_10_taken',
  MONEY_20_TAKEN      : 'money_20_taken',
  MONEY_60_TAKEN      : 'money_60_taken',
  MONEY_200_TAKEN     : 'money_200_taken',
  MENU_APPEND         : 'menu_append',
  BEST_ACTIVITY       : 'best_activity',
  BOTTLE_ACTIVITY     : 'bottle_activity',
  CARDS_ACTIVITY      : 'cards_activity',
  QUESTION_ACITVITY   : 'question_activity',
  SYMPATHY_ACITVITY   : 'sympathy_activity'
};