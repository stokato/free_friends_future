const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Найти все заказы пользователя: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(userid, callback) {
  
  const DBF = DB_CONST.ORDERS.fields;
  const DBN = DB_CONST.ORDERS.name
  
  if(!userid) {
    return callback(new Error("Не задан ИД пользователя"), null);
  }

  let fieldsArr = [
    DBF.ID_uuid_p,
    DBF.VID_varchar,
    DBF.GOODID_varchar,
    DBF.SUM_int,
    DBF.DATE_timestamp
  ];
  
  let condFieldsArr = [DBF.USERID_uuid_i];
  let condValuesArr = [1];

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);

  dbCtrlr.client.execute(query,[userid], {prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }

    if(result.rows.length == 0) {
      return callback(null, null);
    }

    let ordersArr = [];
    
    for (let i = 0; i < result.rows.length; i++) {
      let rowObj = result.rows[i];
      
      let orderObj = {
        [PF.ORDERID]   : rowObj[DBF.ID_uuid_p].toString(),
        [PF.ORDERVID]  : rowObj[DBF.VID_varchar],
        [PF.GOODID]    : rowObj[DBF.GOODID_varchar],
        [PF.SUM]       : rowObj[DBF.SUM_int],
        [PF.DATE]      : rowObj[DBF.DATE_timestamp]
      };

      ordersArr.push(orderObj);
    }

    callback(null, ordersArr);
  });
};