var ONE_GENDER_IN_ROOM = 5;                         // Макс. количество игроков одного пола в комнате
var GUY = 2;                                        // Идентификация пола
var GIRL = 1;
var LEN_ROOM_HISTORY = 5;
var EXIT_TIMEOUT = 3000;                            // Таймаут отключения при вызове клиентом exit
var REQUEST_TIMEOUT = 3600000;                      // Таймау ожидания запроса от клиента перед отключением
var LEN_PRIVATE_HISTORY     = 7;                    // Длина истории приватныъ сообщений в днях

module.exports.ONE_GENDER_IN_ROOM = ONE_GENDER_IN_ROOM;
module.exports.GUY = GUY;
module.exports.GIRL = GIRL;
module.exports.LEN_ROOM_HISTORY = LEN_ROOM_HISTORY;
module.exports.EXIT_TIMEOUT = EXIT_TIMEOUT;
module.exports.REQUEST_TIMEOUT = REQUEST_TIMEOUT;
module.exports.LEN_PRIVATE_HISTORY = LEN_PRIVATE_HISTORY;