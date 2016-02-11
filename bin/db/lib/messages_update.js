/*
 Изменить сообщение в БД: Свойства сообщения
 - Проверка (ИД обязателен)
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, msg, callback) {
    var self = this;
    var message = msg                 || {};
    var id           = msg.id;
    var userid       = uid;
    var date         = msg.gate;
    var companionid  = msg.companionid;
    var companionvid = msg.companionvid;
    var incoming     = msg.incoming;
    var text         = msg.text;
    var opened       = msg.opened;

    if (!id || !userid) {
        return callback(new Error("Задан пустй Id пользователя или сообщения"), null);
    }

    var query = "select id FROM user_messages where id = ?";

    self.client.execute(query,[id], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        if(result.rows.length == 0) { return callback(new Error("Сообщения с таким Id нет в базе данных"), null)}

        var fields = "userid = ?";
        var params = [userid];
        if (date)           { fields = fields + ", date = ? ";            params.push(date); }
        if (companionid)    { fields = fields + ", companionid = ? ";     params.push(companionid); }
        if (companionvid)   { fields = fields + ", companionvid = ? ";    params.push(companionvid); }
        if (incoming)       { fields = fields + ", incoming = ? ";        params.push(incoming); }
        if (text)           { fields = fields + ", text = ? ";            params.push(text); }
        if (opened)         { fields = fields + ", opened = ? ";          params.push(opened); }

        var query = "update user_messages set " + fields + " where id = ?";
        params.push(id);

        self.client.execute(query, params, {prepare: true }, function(err) {
            if (err) {  return callback(err); }

            callback(null, message);
        });
    });
};