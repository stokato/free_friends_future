var ONE_GENDER_IN_ROOM = 5,                         // Макс. количество игроков одного пола в комнате
    GUY = 2,                                        // Идентификация пола
    GIRL = 1,
    LEN_ROOM_HISTORY = 5,
    EXIT_TIMEOUT = 3000,                            // Таймаут отключения при вызове клиентом exit
    REQUEST_TIMEOUT = 3600000,                      // Таймау ожидания запроса от клиента перед отключением
    LEN_PRIVATE_HISTORY     = 7;                    // Длина истории приватныъ сообщений в днях

module.exports.ONE_GENDER_IN_ROOM = ONE_GENDER_IN_ROOM;
module.exports.GUY = GUY;
module.exports.GIRL = GIRL;
module.exports.LEN_ROOM_HISTORY = LEN_ROOM_HISTORY;
module.exports.EXIT_TIMEOUT = EXIT_TIMEOUT;
module.exports.REQUEST_TIMEOUT = REQUEST_TIMEOUT;
module.exports.LEN_PRIVATE_HISTORY = LEN_PRIVATE_HISTORY;