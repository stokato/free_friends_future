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
   var rowsLen = result.rows.length;
   var i;
   if(rowsLen > 0) {
     var row;
     for(i = 0; i < rowsLen; i++) {
       row = result.rows[i];
       guest = { id: row.guestid, vid: row.guestvid, date: row.date };
       guests.push(guest);
       guestList.push(row.guestid);
       if(i == 0) { fields = "?"; }
       else { fields = fields + ", ?"; }
     }

     var query = "select id, vid, age, sex, city, country, points FROM users where id in (" + fields + ")";

     self.client.execute(query, guestList, {prepare: true }, function(err, result) {
       if (err) { return callback(err, null); }

       rowsLen = result.rows.length;
       for(var i = 0; i < rowsLen; i++) {
         var row = result.rows[i];
         var index;
         var j;
         var guestLen = guestList.length;
         for(j = 0; j < guestLen; j++) {
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
       callback(null, guests);
     });

   } else { return callback(null, null); }
 });
};