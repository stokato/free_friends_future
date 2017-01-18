/**
 * Created by s.t.o.k.a.t.o on 10.01.2017.
 */

const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');

const DBF = dbConst.SHOP.fields;
const PF  = constants.PFIELDS;

/*
 Изменяем данные подарка
 */
module.exports = function(options, callback) { options = options || {};
  
  if (!options[PF.ID]) {
    return callback(new Error("Задан пустй Id подарка"), null);
  }
  
  let fields = [];
  let constFields = [DBF.ID_uuid_p];
  let constValues = [1];
  let dbName = dbConst.SHOP.name;
  
  let params = [];
  if (PF.TITLE in options)       { fields.push(DBF.TITLE_varchar);       params.push(options[PF.TITLE]); }
  if (PF.PRICE in options)       { fields.push(DBF.PRICE_COINS_int);     params.push(options[PF.PRICE]); }
  if (PF.SRC in options)         { fields.push(DBF.SRC_varchar);         params.push(options[PF.SRC]); }
  if (PF.GROUP in options)       { fields.push(DBF.GROUP_varchar);       params.push(options[PF.GROUP]); }
  if (PF.GROUP_TITLE in options) { fields.push(DBF.GROUP_TITLE_varchar); params.push(options[PF.GROUP_TITLE]);}
  if (PF.TYPE in options)        { fields.push(DBF.GIFT_TYPE_varchar);   params.push(options[PF.TYPE]);}
  if (PF.RANK in options)        { fields.push(DBF.GIFT_RANK_varchar);   params.push(options[PF.RANK]);}
  if (PF.LEVEL in options)       { fields.push(DBF.GIFT_LEVEL_int);  params.push(options[PF.LEVEL]);}
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_UPDATE, fields, dbName, constFields, constValues);
  
  params.push(options[PF.ID]);
  
  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, options);
  });
};