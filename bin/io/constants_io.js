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

module.exports.IO_INIT                = 'init';
module.exports.IO_MESSAGE             = 'message';
module.exports.IO_PRIVATE_MESSAGE     = 'private_message';
module.exports.IO_GET_ROOMS           = 'get_rooms';
module.exports.IO_GET_CHAT_HISTORY    = 'get_chat_history';
module.exports.IO_GET_SHOP            = 'get_gift_shop';
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