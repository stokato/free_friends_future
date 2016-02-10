/*
 Добавить подарок: ИД игрока и объект с данными о подарке
 - Провека: все поля
 - Генерируем ИД подарка
 - Строим и выполняем запрос
 - Возвращаем объект подарка
 */
module.exports = function(uid, gft, callback) {
    var gift = gft || {};

    var giftId = gift.id;
    var type = gift.type;
    var data = gift.data;
    var date = gift.date;
    var fromid = gift.fromid;
    var fromvid = gift.fromvid;

    if (!uid) {
        return callback(new Error("Не указан Id пользователя"), null);
    }

    if (!type || !data || !date || !fromid || !fromvid) {
        return callback(new Error("Не указаны параметры подарка"), null);
    }

    var id = this.uuid.random();

    var fields = "id, userid, giftid, type, data, date, fromid, fromvid";
    var values = "?, ?, ?, ?, ?, ?, ?, ?";
    var params = [id, uid, giftId, type, data, date, fromid, fromvid];

    var query = "INSERT INTO user_gifts (" + fields + ") VALUES (" + values + ")";

    this.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return callback(err); }
        callback(null, gift);
    });
};