/*
 Получаем историю сообщений:
 - Читаем из БД
 - Если задан параметр count - указанное количество с конца
 - Если задан position - count с указанной позиции
 */
module.exports = function(options, callback) {
    var message = {
        id : options.id,
        opened : true
    };

    this.dbManager.updateMessage(this.pID, message, function(err) {
        if (err) { return callback(err, null); }

        callback(null, null);
    });
};