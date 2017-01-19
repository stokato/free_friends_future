/**
 * Created by s.t.o.k.a.t.o on 10.01.2017.
 *
 *  Изменяем данные подарка
 */

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

module.exports = function(options, callback) { options = options || {};

  const DBF = DB_CONST.COINS.fields;
  const DBN = DB_CONST.COINS.name;
  
  if (!options[PF.ID]) {
    return callback(new Error("Задан пустй Id подарка"), null);
  }
  
  let fieldsArr = [];
  let condFieldsArr = [DBF.ID_varchar_p];
  let condValuesArr = [1];

  
  let paramsArr = [];
  if (PF.TITLE in options)     { fieldsArr.push(DBF.TITLE_varchar);    paramsArr.push(options[PF.TITLE]); }
  if (PF.PRICE in options)     { fieldsArr.push(DBF.PRICE_COINS_int);  paramsArr.push(options[PF.PRICE]); }
  if (PF.PRICE_VK in options)  { fieldsArr.push(DBF.PRICE_VK_int);     paramsArr.push(options[PF.PRICE_VK]); }
  if (PF.SRC in options)       { fieldsArr.push(DBF.SRC_varchar);      paramsArr.push(options[PF.SRC]); }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_UPDATE, fieldsArr, DBN, condFieldsArr, condValuesArr);
  
  paramsArr.push(options[PF.ID]);
  
  dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, options);
  });
};