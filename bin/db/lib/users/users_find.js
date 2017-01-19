const dbCtrlr       = require('./../common/cassandra_db');
const DB_CONST   = require('./../../constants');
const PF = require('./../../../const_fields');

const DBF = DB_CONST.USERS.fields;

/*
 Найти пользователя(по внутреннему или внешнему ИД): ИД, ВИД, список искомых полей
 - Проверка
 - Определяем - по чему будем искать
 - Строим запрос
 - Обращаемся к БД и обрабатываем рузультат
 - Возвращаем объект с данными игрока (если нет такого - NULL)
 */
module.exports = function(id, vid, f_list, callback) {
  if (!vid && !id) {
    return callback(new Error("Ошибка при поиске пользователя: Не задан ID или VID"), null);
  }

  let constraint = '';
  let param = [];

  if(id) {
    constraint = DBF.ID_uuid_p;
    param.push(id);
  } else {
    constraint = DBF.VID_varchar_i;
    param.push(vid);
  }

  let i, fields = [DBF.ID_uuid_p, DBF.VID_varchar_i];
  for(i = 0; i < f_list.length; i++) {
    switch (f_list[i]) {
      case PF.ID          : fields.push(DBF.ID_uuid_p);       break;
      case PF.VID         : fields.push(DBF.VID_varchar_i);   break;
      case PF.BDATE       : fields.push(DBF.BDATE_timestamp); break;
      case PF.CITY        : fields.push(DBF.CITY_int);        break;
      case PF.COUNTRY     : fields.push(DBF.COUNTRY_int);     break;
      case PF.SEX         : fields.push(DBF.SEX_int);         break;
      case PF.STATUS      : fields.push(DBF.STATUS_varchar);  break;
      case PF.POINTS      : fields.push(DBF.POINTS_int);      break;
      case PF.GIFT1       : fields.push(DBF.MONEY_int);       break;
      case PF.ISMENU      : fields.push(DBF.ISMENU_boolean);  break;
      case PF.MONEY       : fields.push(DBF.MONEY_int);       break;
      case PF.LEVEL       : fields.push(DBF.LEVEL_int);       break;
      case PF.FREE_GIFTS  : fields.push(DBF.FREE_GIFTS_int);  break;
      case PF.FREE_TRACKS : fields.push(DBF.FREE_MUSIC_int);  break;
      case PF.VIP         : fields.push(DBF.VIP_boolean);     break;
    }
  }

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fields, DB_CONST.USERS.name, [constraint], [1]);

  dbCtrlr.client.execute(query, param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
        
    if(result.rows.length > 0) {
      
      let row = result.rows[0];

      let user = {
        [PF.ID]           : row[DBF.ID_uuid_p].toString(),
        [PF.VID]          : row[DBF.VID_varchar_i],
        [PF.BDATE]        : row[DBF.BDATE_timestamp],
        [PF.CITY]         : row[DBF.CITY_int],
        [PF.COUNTRY]      : row[DBF.COUNTRY_int],
        [PF.SEX]          : row[DBF.SEX_int],
        [PF.STATUS]       : row[DBF.STATUS_varchar],
        [PF.POINTS]       : row[DBF.POINTS_int],
        [PF.GIFT1]        : (row[DBF.GIFT1_uuid])? row[DBF.GIFT1_uuid].toString() : null,
        [PF.ISMENU]       : row[DBF.ISMENU] || null,
        [PF.MONEY]        : Number(row[DBF.MONEY_int]),
        [PF.LEVEL]        : Number(row[DBF.LEVEL_int]),
        [PF.FREE_GIFTS]   : Number(row[DBF.FREE_GIFTS_int]),
        [PF.FREE_TRACKS]  : Number(row[DBF.FREE_MUSIC_int]),
        [PF.VIP]          : Number(row[DBF.VIP_boolean])
      };
      
      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};
