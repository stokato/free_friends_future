/*
 Получаем список всех пользователей: список искомых полей
 - Строим и выполняем запрос
 - Создаем массив и заполняем его данными
 - Возвращяем массив (если никого нет - NULL)
 */
module.exports = function(f_list, callback) {

 var fields = [];
 for(var i = 0; i < f_list.length; i++) {
   if(f_list == "age")     fields += ", age";
   if(f_list == "country") fields += ", country";
   if(f_list == "city")    fields += ", city";
   if(f_list == "status")  fields += ", status";
   if(f_list == "sex")     fields += ", sex";
   if(f_list == "points")  fields += ", points";
   if(f_list == "money")   fields += ", money";
 }

 var query = "select id" + fields + " FROM users";

 this.client.execute(query,[], {prepare: true }, function(err, result) {
   if (err) { return callback(err, null);}

   var users = [];

   var i;
   var rowsLen = result.rows.length;
   if(rowsLen > 0) {
     for(i = 0; i < rowsLen; i++) {
       var row = result.rows[i];
       var user = {
         id       : row.id.toString(),
         vid      : row.vid,
         age      : row.age,
         country  : row.country,
         city     : row.city,
         sex      : row.sex,
         status   : row.status,
         points   : row.points || 0,
         money    : row.money || 0
       };
       users.push(user);
     }
   }

   callback(null, users);
 });
};
