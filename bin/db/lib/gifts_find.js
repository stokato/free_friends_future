/*
 Найти все подарки игрока: ИД игрока
 - Проверка на ИД
 - Строим и выполняем запрос (все поля)
 - Возвращаем массив с подарками (если ничего нет NULL)
 */
module.exports = function(uid, callback) {
 var self = this;
 if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null);}

 var query = "select giftid, type, data, date, fromid, fromvid FROM user_gifts where userid = ?";

 self.client.execute(query,[uid], {prepare: true }, function(err, result) {
   if (err) { return callback(err, null); }

   var gifts = [];

   if(result.rows.length > 0) {
     var userList = [];
     var fields = "";
     for(var i = 0; i < result.rows.length; i++) {
       var row= result.rows[i];
       var gift = {
         giftid : row.giftid,
         type : row.type,
         data : row.data,
         date : row.date,
         fromid : row.fromid,
         fromvid : row.fromvid
       };
       gifts.push(gift);
       if(userList.indexOf(row.fromid) < 0) {
         if(userList.length == 0) fields = "?";
         else fields = fields + ", ?";
         userList.push(row.fromid);
       }
     }

     var query = "select id, vid, age, sex, city, country, points FROM users where id in (" + fields + ")";

     self.client.execute(query, userList, {prepare: true }, function(err, result) {
       if (err) { return callback(err, null); }

       var users = [];
       for(var i = 0; i < result.rows.length; i++) {
         var row = result.rows[i];
         var user = {
           id      : row.id,
           vid     : row.vid,
           age     : row.age,
           sex     : row.sex,
           city    : row.city,
           country : row.country,
           points  : row.points
         };
         users.push(user);
       }

       for(var i = 0; i < gifts.length; i++) {
         for(var j = 0; j < users.length; j++) {
           if(users[j].id.toString() == gifts[i].fromid.toString()) {
             if (!users[j].gifts) users[j].gifts = [];
             var gift = {
               id: gifts[i].giftid,
               type: gifts[i].type,
               data: gifts[i].data,
               date: gifts[i].date
             };
             users[j].gifts.push(gift);
           }
         }
       }
       callback(null, users);
     });
   } else {
     callback(null, null);
   }
 });
};