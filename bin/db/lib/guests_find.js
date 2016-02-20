/*
 Найти гостей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными (Если не нашли ничего - NULL)
 */
module.exports = function(uid, callback) {
    var self = this;
    if (!uid ) {
        return callback(new Error("Задан пустой Id"), null);
    }

    var query = "select guestid, guestvid, date FROM user_guests where userid = ?";

    self.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var guests = [];
        var guest = null;
        var guestList = [];
        var fields = "";
        if(result.rows.length > 0) {
            var row;
            for(var i = 0; i < result.rows.length; i++) {
                row = result.rows[i];
                guest = { id: row.guestid, vid: row.guestvid, date: row.date };
                guests.push(guest);
                guestList.push(row.guestid);
                if(i == 0) fields = "?";
                else fields = fields + ", ?";
            }

            var query = "select id, vid, age, sex, city, country, points FROM users where id in (" + fields + ")";

            self.client.execute(query, guestList, {prepare: true }, function(err, result) {
                if (err) { return callback(err, null); }

                for(var i = 0; i < result.rows.length; i++) {
                    var row = result.rows[i];
                    var index;
                    for(var j = 0; j < guestList.length; j++) {
                        if(guestList[j].toString() == row.id.toString()) {
                            index = j;
                        }
                    }
                    guests[index].age = row.age;
                    guests[index].sex = row.sex;
                    guests[index].city = row.city;
                    guests[index].country = row.country;
                    guests[index].points = row.points;
                }

            });

            callback(null, guests);

        } else { return callback(null, null); }
    });
};