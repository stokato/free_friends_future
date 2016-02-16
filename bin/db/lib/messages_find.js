/*
 Найти сохраненные сообщения пользователя, связаныне с заданным собеседником: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, compids, callback) {
    var companionids = compids || [];

    if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }
    if (!companionids[0]) { return callback(new Error("Задан пустой Id собеседника"), null); }

    var fields = "";
    var params = [uid];
    for(var i = 0; i < companionids.length; i++) {
        if (fields == "") fields = "?";
        else
            fields = fields + ", " + "?";

        params.push(companionids[i]);
    }

    var query = "select * FROM user_messages where userid = ? and companionid in (" + fields + ")";

    this.client.execute(query,params, {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var messages = [];

        if(result.rows.length > 0) {
            for(var i = 0; i < result.rows.length; i++) {
                var msg = result.rows[i];
                var message = {
                    id        : msg.id,
                    date      : msg.date,
                    companionid : msg.companionid,
                    companionvid : msg.companionvid,
                    incoming  : msg.incoming,
                    text      : msg.text,
                    opened    : msg.opened
                };
                messages.push(message);
            }


            callback(null, messages);

        } else {
            callback(null, null);
        }
    });
};


