const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Найти пользователя(по внутреннему или внешнему ИД): ИД, ВИД, список искомых полей
 - Проверка
 - Определяем - по чему будем искать
 - Строим запрос
 - Обращаемся к БД и обрабатываем рузультат
 - Возвращаем объект с данными игрока (если нет такого - NULL)
 */

module.exports = function(id, vid, f_list, callback) {
  
  const DBF = DB_CONST.USERS.fields;
  const DBN = DB_CONST.USERS.name;
  
  if (!vid && !id) {
    return callback(new Error("Ошибка при поиске пользователя: Не задан ID или VID"), null);
  }

  let condFieldsArr = [];
  let condValuesArr = [1];
  let paramsArr = [];

  if(id) {
    condFieldsArr.push(DBF.ID_uuid_p);
    paramsArr.push(id);
  } else {
    condFieldsArr.push(DBF.VID_varchar_i);
    paramsArr.push(vid);
  }

  let fieldsArr = [DBF.ID_uuid_p, DBF.VID_varchar_i];
  
  let listLen = f_list.length;
  for(let i = 0; i < listLen; i++) {
    switch (f_list[i]) {
      case PF.ID          : fieldsArr.push(DBF.ID_uuid_p);       break;
      case PF.VID         : fieldsArr.push(DBF.VID_varchar_i);   break;
      case PF.BDATE       : fieldsArr.push(DBF.BDATE_timestamp); break;
      case PF.CITY        : fieldsArr.push(DBF.CITY_int);        break;
      case PF.COUNTRY     : fieldsArr.push(DBF.COUNTRY_int);     break;
      case PF.SEX         : fieldsArr.push(DBF.SEX_int);         break;
      case PF.STATUS      : fieldsArr.push(DBF.STATUS_varchar);  break;
      case PF.POINTS      : fieldsArr.push(DBF.POINTS_int);      break;
      case PF.GIFT1       : fieldsArr.push(DBF.MONEY_int);       break;
      case PF.ISMENU      : fieldsArr.push(DBF.ISMENU_boolean);  break;
      case PF.MONEY       : fieldsArr.push(DBF.MONEY_int);       break;
      case PF.LEVEL       : fieldsArr.push(DBF.LEVEL_int);       break;
      case PF.FREE_GIFTS  : fieldsArr.push(DBF.FREE_GIFTS_int);  break;
      case PF.FREE_TRACKS : fieldsArr.push(DBF.FREE_MUSIC_int);  break;
      case PF.VIP         : fieldsArr.push(DBF.VIP_boolean);     break;
    }
  }

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);

  dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }
        
    if(result.rows.length > 0) {
      
      let rowObj = result.rows[0];

      let userObj = {
        [PF.ID]           : rowObj[DBF.ID_uuid_p].toString(),
        [PF.VID]          : rowObj[DBF.VID_varchar_i],
        [PF.BDATE]        : rowObj[DBF.BDATE_timestamp],
        [PF.CITY]         : rowObj[DBF.CITY_int],
        [PF.COUNTRY]      : rowObj[DBF.COUNTRY_int],
        [PF.SEX]          : rowObj[DBF.SEX_int],
        [PF.STATUS]       : rowObj[DBF.STATUS_varchar],
        [PF.POINTS]       : rowObj[DBF.POINTS_int],
        [PF.GIFT1]        : (rowObj[DBF.GIFT1_uuid])? rowObj[DBF.GIFT1_uuid].toString() : null,
        [PF.ISMENU]       : rowObj[DBF.ISMENU] || null,
        [PF.MONEY]        : Number(rowObj[DBF.MONEY_int]),
        [PF.LEVEL]        : Number(rowObj[DBF.LEVEL_int]),
        [PF.FREE_GIFTS]   : Number(rowObj[DBF.FREE_GIFTS_int]),
        [PF.FREE_TRACKS]  : Number(rowObj[DBF.FREE_MUSIC_int]),
        [PF.VIP]          : Number(rowObj[DBF.VIP_boolean])
      };
      
      callback(null, userObj);
    } else {
      callback(null, null);
    }
  });
};
