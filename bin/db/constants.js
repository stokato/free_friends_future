/**
 * Created by s.t.o.k.a.t.o on 21.11.2016.
 */

module.exports.PFIELDS = {
  DATE            : 'date',
  DATE_FROM       : 'first_date',
  DATE_TO         : 'second_date',
  SRC             : 'src',
  TYPE            : 'type',
  TITLE           : 'title',
  INCOMING        : 'incoming',
  TEXT            : 'text',
  OPENED          : 'opened',
  SEX             : 'sex',
  POINTS          : 'points',
  ID_LIST         : 'id_list',
  MONEY           : 'money',
  ID              : 'id',
  VID             : 'vid',
  UGIFTID         : 'gid',
  ORDERID         : 'userid',
  ORDERVID        : 'uservid',
  GIFTID          : 'giftid',
  GOODID          : 'goodid',
  FID             : 'fromid',
  FVID            : 'fromvid',
  GIFT1           : 'gift1',
  AGE             : 'age',
  COUNTRY         : 'country',
  CITY            : 'city',
  STATUS          : 'status',
  ISMENU          : 'ismenu',
  SUM             : 'sum',
  PRICE           : 'price',
  GOODTYPE        : 'goodtype',
  ISNEW           : 'is_new',
  GIFTS           : 'gifts',
  BDAY            : 'bday',
  CHATID          : 'chat',
  CHATVID         : 'chatVID',
  NUMBER          : 'number',
  PRICE2          : 'price2',
  FSEX            : 'usex',
  FBDAY           : 'ubday'
};

module.exports.DB = {
  
  /*
   Таблица пользователей users:
   ИД: генерируется (ключевое поле),
   ИД ВКонтакте, (индекс),
   Возраст,
   Страна,
   Город,
   Статус,
   Количество денег,
   Пол (Девушка/Парень 1/2),
   Количество очков,
   Подарок1 (последний подаренный подарок)
   */
  
  USERS : {
    name    : 'users',
    fields  : {
      ID_uuid_p       : 'id',
      VID_varchar_i   : 'vid',
      BDAY_timestamp  : 'bday',
      COUNTRY_int     : 'country',
      CITY_int        : 'city',
      STATUS_varchar  : 'status',
      MONEY_int       : 'money',
      SEX_int         : 'sex',
      POINTS_int      : 'points',
      GIFT1_uuid      : 'gift1'
    }
  },
  
  /*
   Таблица подарки пользователя user_gifts:
   ИД: генерируется (ключевое поле),
   ИД пользователя (users)(индекс),
   ИД подарка (в таблице магазина),
   Тип подарка,
   Название подарка,
   Путь к файлу,
   Дата подарка,
   ИД подарившего,
   ИД подарившего ВКонтакте
   */
  
  USER_GIFTS : {
    name    : 'user_gifts',
    fields  : {
      ID_uuid_p           : 'id',
      USERID_uuid_i       : 'userid',
      GIFTID_varchar      : 'giftid',
      TYPE_varchar        : 'type',
      TITLE_varchar       : 'title',
      SRC_varhar          : 'src',
      DATE_timestamp      : 'date',
      FROMID_uuid         : 'fromid',
      FROMVID_varchar     : 'fromvid',
      FROMSEX_int         : 'fromsex',
      FROMBDAY_timestamp  : 'frombday'
    }
  },
  
  /*
   Таблица подарки пользователя user_new_gifts:
   ИД: генерируется (ключевое поле),
   ИД пользователя (users)(индекс)
   */
  
  USER_NEW_GIFTS : {
    name    : 'user_new_gifts',
    fields  : {
      ID_uuid_p           : 'id',
      USERID_uuid_i       : 'userid'
    }
  },
  
  /*
   Таблица личные сообщеня пользователя user_messages:
   ИД: генерируется (ключевое поле),
   ИД пользователя (users) (ключевое поле),
   ИД отправителя/получателя (users) (ключевое поле),
   ИД отправителя/получателя ВКонтакте,
   Тип сообщения (входящее/Исходящее true/false),
   Текст сообщения,
   Дата сообщения,
   Состояние сообщения (отрыто/еще нет true/false)
   */
  
  USER_MESSAGES : {
    name    : 'user_messages',
    fields  : {
      ID_timeuuid_c             : 'id',
      USERID_uuid_pci           : 'userid',
      COMPANIONID_uuid_pc2i     : 'companionid',
      COMPANIONVID_varchar      : 'companionvid',
      INCOMING_boolean          : 'incoming',
      TEXT_text                 : 'text',
      DATE_timestamp            : 'date',
      COMPANIONBDAY_timestamp   : 'companionbday',
      COMPANIONSEX_int          : 'companionsex',
      USERBDAY_timestamp        : 'userbday',
      USERSEX_int               : 'usersex'
    }
  },
  
  /*
   Таблица новые личные сообщеня пользователя user_new_messages:
   ИД: генерируется (ключевое поле),
   ИД пользователя (users) (ключевое поле),
   ИД отправителя/получателя (users) (ключевое поле),
   */
  
  USER_NEW_MESSAGES : {
    name    : 'user_messages',
    fields  : {
      ID_timeuuid_c             : 'id',
      USERID_uuid_pci           : 'userid',
      COMPANIONID_uuid_pc2i     : 'companionid'
    }
  },
  
  /*
   Таблица со списком приватных чатов между пользователями
   ИД пользователя (users) (ключевое поле),
   ИД отправителя/получателя (users) (связанный ключ),
   Есть новые сообщения (да/нет)
   */
  
  USER_CHATS : {
    name    : 'user_chats',
    fields  : {
      USERID_uuid_p             : 'userid',
      COMPANIONID_uuid_c        : 'companionid',
      COMPANIONVID_varchar      : 'companionvid',
      COMPANIONSEX_int          : 'companionsex',
      COMPANIONBDAY_timestamp   : 'companionbday',
      ISNEW_boolean             : 'isnew'
    }
  },
  
  /*
   Таблица со списком приватных чатов между пользователями, содержащими новые сообщения
   ИД пользователя (users) (ключевое поле),
   ИД отправителя/получателя (users) (связанный ключ),
   */
 
  USER_NEW_CHATS : {
    name   : 'user_new_chats',
    fields : {
      USERID_uuid_pc1i             : 'userid',
      COMPANIONID_uuid_pc2         : 'companionid'
    }
  },
  
  /*
   Таблица друзей пользователя user_friends:
   ИД пользователя (users) (ключевое поле),
   ИД друга (users) (ключевое поле),
   ИД друга ВКонтакте
   Дата добавления в друзья
   */
  
  USER_FRIENDS : {
    name : 'user_friends',
    fields : {
      USERID_uuid_pi        : 'userid',
      FRIENDID_uuid_c       : 'friendid',
      FRIENDVID_varhcar     : 'friendvid',
      FRIENDBDAY_timestamp  : 'friendbday',
      FRIENDSEX_int         : 'friendsex',
      DATE_timestamp        : 'date'
    }
  },
  
  /*
   Таблица друзей пользователя user_new_friends:
   ИД пользователя (users) (ключевое поле),
   ИД друга (users) (ключевое поле),
   */
  
  USER_NEW_FRIENDS : {
    name : 'user_new_friends',
    fields : {
      USERID_uuid_pc1i         : 'userid',
      FRIENDID_uuid_pc2        : 'friendid'
    }
  },
  
  /*
   Таблица гостей пользователя user_guests:
   ИД пользователя (users)  (ключевое поле),
   ИД гостя (users) (ключевое поле),
   ИД гостя ВКонтакте,
   Дата посещения личной страницы
   */
  
  
  USER_GUESTS : {
    name : 'user_guests',
    fields : {
      USERID_uuid_p         : 'userid',
      GUESTID_uuid_ci       : 'guestid',
      GUESTVID_varchar      : 'guestvid',
      GUESTBDAY_timestamp   : 'guestbday',
      GUESTSEX_int          : 'guestsex',
      DATE_timestamp        : 'date'
    }
  },
  
  /*
   Таблица гостей пользователя user_new_guests:
   ИД пользователя (users)  (ключевое поле),
   ИД гостя (users) (ключевое поле),
   */
  
  USER_NEW_GUESTS : {
    name : 'user_new_guests',
    fields : {
      USERID_uuid_pc1i         : 'userid',
      GUESTID_uuid_pc2i        : 'guestid'
    }
  },
  
  /*
   Таблица магазин подарков:
   ИД: генерируется (ключевое поле),
   Название подарка,
   Цена,
   Путь к файлу,
   Тип подарка
   */
  
  SHOP : {
    name    : 'shop',
    fields  : {
      ID_varchar_p        : 'id',
      TITLE_varchar       : 'title',
      PRICE_int           : 'price',
      PRICE2_int          : 'price2',
      SRC_varchar         : 'src',
      TYPE_varchar        : 'type',
      GOODTYPE_varchar_i  : 'goodtype'
    }
  },
  
  /*
   Таблица заказов:
   ИД: генерируется (ключевое поле),
   ИД ВКонтакте,
   ИД товара (shop),
   ИД пользователя (Кто делал заказ) (users),
   ИД пользователя ВКонтакте,
   Сумма,
   Дата
   */
  
  ORDERS : {
    name    : 'orders',
    fields  : {
      ID_uuid_p         : 'id',
      VID_varchar       : 'vid',
      GOODID_varchar    : 'goodid',
      USERID_uuid_i     : 'userid',
      USERVID_varchar   : 'uservid',
      SUM_int           : 'sum',
      DATE_timestamp    : 'date'
    }
  },
  
  /*
   Таблица с вопросами:
   ИД: генерируется (ключевое поле),
   Текст - текст вопроса
   */
  
  QUESTIONS : {
    name      : 'questions',
    fields    : {
      ID_uuid_p     : 'id',
      TEXT_varchar  : 'text'
    }
  },
  
  /*
   Таблица топа игроков обоих полов:
   ИД: фиксированный  (ключевое поле),
   Количество очков  (ключевое поле),,
   ИД пользователя (users)  (ключевое поле),
   ИД пользователя ВКонтакте,
   ИД пользователя (users)  (индексированное поле)
   */
  
  POINTS : {
    name    : 'points',
    fields  : {
      ID_varchar_p      : 'id',
      POINTS_c_desc     : 'points',
      USERID_uuid       : 'userid',
      USERVID_varchar   : 'uservid',
      SEX_int           : 'sex',
      UID_uuid_i        : 'uid'
    }
  },
  
  /*
   Таблица топа игроков парней:
   ИД: фиксированный  (ключевое поле),
   Количество очков  (ключевое поле),,
   ИД пользователя (users)  (ключевое поле),
   ИД пользователя ВКонтакте,
   ИД пользователя (users)  (индексированное поле)
   */
  
  POINTS_GUYS : {
    name    : 'points_guys',
    fields  : {
      ID_varchar_p      : 'id',
      POINTS_c_desc     : 'points',
      USERID_uuid       : 'userid',
      USERVID_varchar   : 'uservid',
      SEX_int           : 'sex',
      UID_uuid_i        : 'uid'
    }
  },
  
  /*
   Таблица топа игроков девушек:
   ИД: фиксированный  (ключевое поле),
   Количество очков  (ключевое поле),,
   ИД пользователя (users)  (ключевое поле),
   ИД пользователя ВКонтакте,
   ИД пользователя (users)  (индексированное поле)
   */
  
  POINTS_GIRLS : {
    name    : 'points_girls',
    fields  : {
      ID_varchar_p      : 'id',
      POINTS_c_desc     : 'points',
      USERID_uuid       : 'userid',
      USERVID_varchar   : 'uservid',
      SEX_int           : 'sex',
      UID_uuid_i        : 'uid'
    }
  }
};
