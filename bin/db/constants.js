/**
 * Created by s.t.o.k.a.t.o on 21.11.2016.
 */

const constants = require('./../constants');

module.exports = {
  
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
      BDATE_timestamp  : 'bdate',
      COUNTRY_int     : 'country',
      CITY_int        : 'city',
      STATUS_varchar  : 'status',
      MONEY_int       : 'money',
      SEX_int         : 'sex',
      POINTS_int      : 'points',
      GIFT1_uuid      : 'gift1',
      ISMENU_boolean  : 'ismenu',
      LEVEL_int       : 'ulevel',
      FREE_GIFTS_int  : 'free_gifts',
      FREE_MUSIC_int  : 'free_music',
      VIP_boolean     : 'vip'
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
      FROMBDATE_timestamp  : 'frombdate'
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
      COMPANIONBDATE_timestamp   : 'companionbdate',
      COMPANIONSEX_int          : 'companionsex',
      USERBDATE_timestamp        : 'userbdate',
      USERSEX_int               : 'usersex',
      USERVID_varchar           : 'uservid'
    }
  },
  
  /*
   Таблица новые личные сообщеня пользователя user_new_messages:
   ИД: генерируется (ключевое поле),
   ИД пользователя (users) (ключевое поле),
   ИД отправителя/получателя (users) (ключевое поле),
   */
  
  USER_NEW_MESSAGES : {
    name    : 'user_new_messages',
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
      COMPANIONBDATE_timestamp   : 'companionbdate',
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
      FRIENDBDATE_timestamp  : 'friendbdate',
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
      GUESTBDATE_timestamp   : 'guestbdate',
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
      TITLE_varchar       : 'good_title',
      PRICE_COINS_int     : 'price_coins',
      PRICE_VK_int        : 'price_vk',
      SRC_varchar         : 'src',
      TYPE_varchar_i      : 'type',
      GROUP_varchar       : 'group_name',
      GROUP_TITLE_varchar : 'group_title'
    }
  },
  
  
  // SHOP : {
  //   name    : 'shop',
  //   fields  : {
  //     ID_varchar_p        : 'id',
  //     TITLE_varchar       : 'title',
  //     PRICE_int           : 'price',
  //     PRICE2_int          : 'price2',
  //     SRC_varchar         : 'src',
  //     TYPE_varchar        : 'type',
  //     GOODTYPE_varchar_i  : 'goodtype'
  //   }
  // },
  
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
      TEXT_varchar  : 'text',
      IMAGE1_varchar : 'image1',
      IMAGE2_varchar : 'image2',
      IMAGE3_varchar : 'image3',
      ACTIVITY_boolean : 'activity'
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
  },

  BLOCKED : {
    name    : 'user_blocked',
    fields  : {
      USERID_uuid_p         : 'userid',
      BLOCKEDID_uuid_ci     : 'blockedid',
      BLOCKEDVID_varchar    : 'blockedvid',
      DATE_timestamp        : 'date'
    }
  },
  
  USERS_STAT : {
    name   : 'users_stat',
    fields : {
      ID_uuid_pc1i                 : 'id',
      VID_varchar_pc2i             : 'vid',
      C_GIFTS_GIVEN_counter        : 'count_gifts_given',
      C_GIFTS_TAKEN_counter        : 'count_gifts_taken',
      C_COINS_GIVEN_counter        : 'count_coins_given',
      C_COINS_EARNED_counter       : 'count_coins_earned',
      C_COINS_SPENT_counter        : 'count_coins_spent',
      C_BOTTLE_KISSED_counter      : 'count_bottle_kissed',
      C_BEST_SELECTED_counter      : 'count_best_selected',
      C_RANK_GIVEN_counter         : 'count_rank_given',
      C_GAME_TIME_MS_counter       : 'count_game_time_ms'
    }
  },
  
  MAIN_STAT : {
    name   : 'main_stat',
    fields : {
      ID_varchar_p                  : 'id',
      C_GIFTS_LOVES_counter         : 'count_gifts_loves',
      C_GIFTS_BREATH_counter        : 'count_gifts_breath',
      C_GIFTS_FLOWERS_counter       : 'count_gifts_flowers',
      C_GIFTS_DRINKS_counter        : 'count_gifts_drinks',
      C_GIFTS_COMMON_counter        : 'count_gifts_common',
      C_GIFTS_FLIRTATION_counter    : 'count_gifts_flirtation',
      C_GIFTS_MERRY_counter         : 'count_gifts_merry',
      C_MONEY_1_GIVEN_counter       : 'count_money_1_given',
      C_MONEY_3_GIVEN_counter       : 'count_money_3_given',
      C_MONEY_10_GIVEN_counter      : 'count_money_10_given',
      C_MONEY_20_GIVEN_counter      : 'count_money_20_given',
      C_MONEY_60_GIVEN_counter      : 'count_money_60_given',
      C_MONEY_200_GIVEN_counter     : 'count_money_200_given',
      C_MONEY_1_TAKEN_counter       : 'count_money_1_taken',
      C_MONEY_3_TAKEN_counter       : 'count_money_3_taken',
      C_MONEY_10_TAKEN_counter      : 'count_money_10_taken',
      C_MONEY_20_TAKEN_counter      : 'count_money_20_taken',
      C_MONEY_60_TAKEN_counter      : 'count_money_60_taken',
      C_MONEY_200_TAKEN_counter     : 'count_money_200_taken',
      C_MENU_APPEND_counter         : 'count_menu_append',
      C_BEST_ACTIVITY_counter       : 'count_best_activity',
      C_BOTTLE_ACTIVITY_counter     : 'count_bottle_activity',
      C_CARDS_ACTIVITY_counter      : 'count_cards_activity',
      C_QUESTION_ACITVITY_counter   : 'count_question_activity',
      C_SYMPATHY_ACITVITY_counter   : 'count_sympathy_activity',
      C_COINS_EARNED_counter        : 'count_coins_earned',
      C_COUNS_SPENT_counter         : 'count_coins_spent'
    }
  },
  
  USER_QUESTIONS : {
    name    : 'user_questions',
    fields    : {
      ID_uuid_p       : 'id',
      TEXT_varchar    : 'text',
      IMAGE1_varchar  : 'image1',
      IMAGE2_varchar  : 'image2',
      IMAGE3_varchar  : 'image3',
      USERID_uuid     : 'userid',
      USERVID_varchar : 'uservid'
    }
  },
  
  AUTH_USERS : {
    name   : 'auth_users',
    fields : {
      ID_uuid_p : 'id',
      LOGIN_varchar_i : 'login',
      PASSWORD_varchar : 'password'
    }
  }
};

