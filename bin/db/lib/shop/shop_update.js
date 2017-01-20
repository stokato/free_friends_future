/**
 * Created by s.t.o.k.a.t.o on 10.01.2017.
 *
 *  Изменяем данные подарка
 */

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

module.exports = function(options, callback) { options = options || {};
  
  const DBF = DB_CONST.SHOP.fields;
  const DBN = DB_CONST.SHOP.name;
  
  if (!options[PF.ID]) {
    return callback(new Error("Задан пустй Id подарка"), null);
  }
  
  let fieldsArr = [];
  let condFieldsArr = [DBF.ID_uuid_p];
  let condValuesArr = [1];

  
  let paramsArr = [];
  if (PF.TITLE in options)       { fieldsArr.push(DBF.TITLE_varchar);       paramsArr.push(options[PF.TITLE]); }
  if (PF.PRICE in options)       { fieldsArr.push(DBF.PRICE_COINS_int);     paramsArr.push(options[PF.PRICE]); }
  if (PF.SRC in options)         { fieldsArr.push(DBF.SRC_varchar);         paramsArr.push(options[PF.SRC]); }
  if (PF.GROUP in options)       { fieldsArr.push(DBF.GROUP_varchar);       paramsArr.push(options[PF.GROUP]); }
  if (PF.GROUP_TITLE in options) { fieldsArr.push(DBF.GROUP_TITLE_varchar); paramsArr.push(options[PF.GROUP_TITLE]);}
  if (PF.TYPE in options)        { fieldsArr.push(DBF.GIFT_TYPE_varchar);   paramsArr.push(options[PF.TYPE]);}
  if (PF.RANK in options)        { fieldsArr.push(DBF.GIFT_RANK_varchar);   paramsArr.push(options[PF.RANK]);}
  if (PF.LEVEL in options)       { fieldsArr.push(DBF.GIFT_LEVEL_int);      paramsArr.push(options[PF.LEVEL]);}
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_UPDATE, fieldsArr, DBN, condFieldsArr, condValuesArr);
  
  paramsArr.push(options[PF.ID]);
  
  dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, options);
  });
};