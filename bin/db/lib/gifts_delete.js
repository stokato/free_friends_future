/*
 Удалить все подарки игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех подарков игрока (нужны их ИД для удаления)
 - По каждому найденному подарку выполняем запрос на его удаления (параллельно)
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
    var self = this;
    if (!uid) { return callback(new Error("Задан пустой Id пользователя")); }

    var query = "select id, user FROM user_gifts where userid = ?";

    self.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var fields = '';
        var params = [];
        for (var i = 0; i < result.rows.length-1; i ++) {
            fields += '?, ';
            params.push(result.rows[i]);
        }
        fields += '?';
        params.push(result.rows.length-1);

        var query = "DELETE FROM user_gifts WHERE id in ( " + fields + " )";
        self.client.execute(query, [params], {prepare: true }, function(err) {
            if (err) {  return callback(err); }

            callback(null, uid);
        });
    });


};