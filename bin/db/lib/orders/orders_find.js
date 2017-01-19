const dbCtrlr     = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF = require('./../../../const_fields');

const DBF     = DB_CONST.ORDERS.fields;

/*
 Найти все заказы пользователя: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(userid, callback) {
  if(!userid) { return callback(new Error("Не задан ИД пользователя"), null); }

  let fields = [
    DBF.ID_uuid_p,
    DBF.VID_varchar,
    DBF.GOODID_varchar,
    DBF.SUM_int,
    DBF.DATE_timestamp
  ];
  let constFields = [DBF.USERID_uuid_i];
  let constValues = [1];

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fields, DB_CONST.ORDERS.name, constFields, constValues);

  dbCtrlr.client.execute(query,[userid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }

    let orders = [], order, row;
    
    for (let i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      order = {
        [PF.ORDERID]   : row[DBF.ID_uuid_p].toString(),
        [PF.ORDERVID]  : row[DBF.VID_varchar],
        [PF.GOODID]    : row[DBF.GOODID_varchar],
        [PF.SUM]       : row[DBF.SUM_int],
        [PF.DATE]      : row[DBF.DATE_timestamp]
      };

      orders.push(order);
    }

    callback(null, orders);
  });
};