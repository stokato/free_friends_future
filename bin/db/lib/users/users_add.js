const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Добавляем пользователя в БД: объект с данными пользователя из соц. сетей
 - Проверка (ВИД обязателен)
 - Генерируем внутренний ИД
 - Строим запрос
 - Выполняем запрос
 - Возвращаем объект обратно
 */

module.exports = function(options, callback) { options = options || {};
  
  const DBF = DB_CONST.USERS.fields;
  const DBN = DB_CONST.USERS.name;
  
  if (!options[PF.VID]) {
    return callback(new Error("Не задан ИД пользователя ВКонтакте"), null);
  }
  
  let id = dbCtrlr.uuid.random();
  
  let fieldsArr = [DBF.ID_uuid_p, DBF.VID_varchar_i];
  let paramsArr = [id, options[PF.VID]];
  
  if (options[PF.BDATE])        { fieldsArr.push(DBF.BDATE_timestamp);  paramsArr.push(options[PF.BDATE]); }
  if (options[PF.COUNTRY])      { fieldsArr.push(DBF.COUNTRY_int);      paramsArr.push(options[PF.COUNTRY]); }
  if (options[PF.CITY])         { fieldsArr.push(DBF.CITY_int);         paramsArr.push(options[PF.CITY]); }
  if (options[PF.STATUS])       { fieldsArr.push(DBF.STATUS_varchar);   paramsArr.push(options[PF.STATUS]); }
  if (options[PF.MONEY])        { fieldsArr.push(DBF.MONEY_int);        paramsArr.push(options[PF.MONEY]); }
  if (options[PF.SEX])          { fieldsArr.push(DBF.SEX_int);          paramsArr.push(options[PF.SEX]); }
  if (options[PF.POINTS])       { fieldsArr.push(DBF.POINTS_int);       paramsArr.push(options[PF.POINTS]); }
  if (options[PF.ISMENU])       { fieldsArr.push(DBF.ISMENU);           paramsArr.push(options[PF.ISMENU]); }
  if (options[PF.GIFT1])        { fieldsArr.push(DBF.GIFT1_uuid);       paramsArr.push(options[PF.GIFT1]); }
  if (options[PF.LEVEL])        { fieldsArr.push(DBF.LEVEL_int);        paramsArr.push(options[PF.LEVEL]); }
  if (options[PF.FREE_GIFTS])   { fieldsArr.push(DBF.FREE_GIFTS_int);   paramsArr.push(options[PF.FREE_GIFTS]); }
  if (options[PF.FREE_TRACKS])  { fieldsArr.push(DBF.FREE_MUSIC_int);   paramsArr.push(options[PF.FREE_TRACKS]); }
  if (options[PF.VID])          { fieldsArr.push(DBF.VIP_boolean);      paramsArr.push(options[PF.VIP]); }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBN);
  
  dbCtrlr.client.execute(query, paramsArr, { prepare: true },  (err) => {
    if (err) {
      return callback(err);
    }
    
    options[PF.ID] = id.toString();
    
    callback(null, options);
  });
};
