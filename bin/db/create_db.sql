-- База данных, Cassandra: KEYSPACE free_friends
CREATE KEYSPACE IF NOT EXISTS free_friends WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': '1'
};

USE free_friends;


-- Таблица сессий пользователей sessions

CREATE TABLE IF NOT EXISTS sessions (
   sid text,
   session text,
   expires timestamp,
   PRIMARY KEY(sid)
);


-- Таблица пользователей users:
-- ИД: генерируется (ключевое поле),
-- ИД ВКонтакте, (индекс),
-- Возраст,
-- Страна,
-- Город,
-- Статус,
-- Количество денег,
-- Пол (Девушка/Парень 1/2),
-- Количество очков,
-- Подарок1 (последний подаренный подарок)


CREATE TABLE IF NOT EXISTS users (
  id uuid,
  vid varchar,
--   age int,
  bday timestamp,
  country int,
  city int,
  status varchar,
  money int,
  sex int,
  points int,
  newmessages int,
  newgifts int,
  newfriends int,
  newguests int,
  gift1 uuid,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS users_vid ON users (vid);


-- Таблица подарки пользователя user_gifts:
-- ИД: генерируется (ключевое поле),
-- ИД пользователя (users)(индекс),
-- ИД подарка (в таблице магазина),
-- Тип подарка,
-- Название подарка,
-- Путь к файлу,
-- Дата подарка,
-- ИД подарившего,
-- ИД подарившего ВКонтакте


CREATE TABLE IF NOT EXISTS user_gifts (
  id uuid,
  userid uuid,
  giftid varchar,
  type varchar,
  title varchar,
  data varchar,
  date timestamp,
  fromid uuid,
  fromvid varchar,
  fromsex int,
  frombday timestamp,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS user_gifts_userid ON user_gifts (userid);


-- Таблица подарки пользователя user_new_gifts:
-- ИД: генерируется (ключевое поле),
-- ИД пользователя (users)(индекс)

CREATE TABLE IF NOT EXISTS user_new_gifts (
  id uuid,
  userid uuid,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS user_new_gifts_userid ON user_new_gifts (userid);


-- Таблица личные сообщеня пользователя user_messages:
-- ИД: генерируется (ключевое поле),
-- ИД пользователя (users) (ключевое поле),
-- ИД отправителя/получателя (users) (ключевое поле),
-- ИД отправителя/получателя ВКонтакте,
-- Тип сообщения (входящее/Исходящее true/false),
-- Текст сообщения,
-- Дата сообщения,
-- Состояние сообщения (отрыто/еще нет true/false)

CREATE TABLE IF NOT EXISTS user_messages(
  id timeuuid,
  userid uuid,
  companionid uuid,
  companionvid varchar,
  incoming boolean,
  text text,
  date timestamp,
--   opened boolean,
  companionbday timestamp,
  companionsex int,
  PRIMARY KEY ((userid, companionid), id)
);

CREATE INDEX IF NOT EXISTS user_messages_userid ON user_messages(userid);
CREATE INDEX IF NOT EXISTS user_messages_compid ON user_messages(companionid );
CREATE INDEX IF NOT EXISTS user_messages_opened ON user_messages(opened );


-- Таблица со списком приватных чатов между пользователями
-- ИД пользователя (users) (ключевое поле),
-- ИД отправителя/получателя (users) (связанный ключ),
-- Есть новые сообщения (да/нет)

CREATE TABLE IF NOT EXISTS user_chats(
  userid uuid,
  companionid uuid,
  companionvid uuid,
  companionsex int,
  companionbday timestamp,
  isnew boolean,
  PRIMARY KEY (userid, companionid)
);


-- Таблица со списком приватных чатов между пользователями, содержащими новые сообщения
-- ИД пользователя (users) (ключевое поле),
-- ИД отправителя/получателя (users) (связанный ключ),

CREATE TABLE IF NOT EXISTS user_new_chats(
  userid uuid,
  companionid uuid,
  PRIMARY KEY ((userid, companionid))
);

CREATE INDEX IF NOT EXISTS user_new_chats_userid ON user_new_chats(userid);


-- Таблица новые личные сообщеня пользователя user_new_messages:
-- ИД: генерируется (ключевое поле),
-- ИД пользователя (users) (ключевое поле),
-- ИД отправителя/получателя (users) (ключевое поле),
-- ИД отправителя/получателя ВКонтакте,
-- Тип сообщения (входящее/Исходящее true/false),
-- Текст сообщения,
-- Дата сообщения,
-- Состояние сообщения (отрыто/еще нет true/false)

CREATE TABLE IF NOT EXISTS user_new_messages(
  id timeuuid,
  userid uuid,
  companionid uuid,
--   companionvid varchar,
--   incoming boolean,
--   text text,
--   date timestamp,
--   opened boolean,
  PRIMARY KEY ((userid, companionid), id)
);

CREATE INDEX IF NOT EXISTS user_new_messages_userid ON user_new_messages(userid);
CREATE INDEX IF NOT EXISTS user_new_messages_compid ON user_new_messages(companionid );


-- Таблица друзей пользователя user_friends:
-- ИД пользователя (users) (ключевое поле),
-- ИД друга (users) (ключевое поле),
-- ИД друга ВКонтакте
-- Дата добавления в друзья

CREATE TABLE IF NOT EXISTS user_friends (
  userid uuid,
  friendid uuid,
  friendvid varchar,
  friendbday timestamp,
  friendsex int,
  date timestamp,
  PRIMARY KEY (userid, friendid)
);


-- Таблица друзей пользователя user_new_friends:
-- ИД пользователя (users) (ключевое поле),
-- ИД друга (users) (ключевое поле),

CREATE TABLE IF NOT EXISTS user_new_friends (
  userid uuid,
  friendid uuid,
  PRIMARY KEY ((userid, friendid))
);

CREATE INDEX IF NOT EXISTS user_new_friends_userid ON user_new_friends (userid);


-- Таблица гостей пользователя user_guests:
-- ИД пользователя (users)  (ключевое поле),
-- ИД гостя (users) (ключевое поле),
-- ИД гостя ВКонтакте,
-- Дата посещения личной страницы

 CREATE TABLE IF NOT EXISTS user_guests (
   userid uuid,
   guestid uuid,
   guestvid varchar,
   guestbday timestamp,
   guestsex int,
   date timestamp,
   PRIMARY KEY (userid, guestid)
 );

 CREATE INDEX IF NOT EXISTS user_guests_guestid ON user_guests (guestid);


-- Таблица гостей пользователя user_new_guests:
-- ИД пользователя (users)  (ключевое поле),
-- ИД гостя (users) (ключевое поле),

 CREATE TABLE IF NOT EXISTS user_new_guests(
   userid uuid,
   guestid uuid,
   PRIMARY KEY ((userid, guestid))
 );

CREATE INDEX IF NOT EXISTS user_new_guests_guestid ON user_new_guests (guestid);
CREATE INDEX IF NOT EXISTS user_new_guests_userid ON user_new_guests (userid);


-- Таблица магазин подарков:
-- ИД: генерируется (ключевое поле),
-- Название подарка,
-- Цена,
-- Путь к файлу,
-- Тип подарка


  CREATE TABLE IF NOT EXISTS shop (
    id varchar,
    title varchar,
    price int,
    data varchar,
    type varchar,
    goodtype varchar,
    PRIMARY KEY (id)
  );
 CREATE INDEX IF NOT EXISTS shop_goodtype ON shop(goodtype);


-- Таблица заказов:
-- ИД: генерируется (ключевое поле),
-- ИД ВКонтакте,
-- ИД товара (shop),
-- ИД пользователя (Кто делал заказ) (users),
-- ИД пользователя ВКонтакте,
-- Сумма,
-- Дата

  CREATE TABLE IF NOT EXISTS orders (
    id uuid,
    vid varchar,
    goodid varchar,
    userid uuid,
    uservid varchar,
    sum int,
    date timestamp,
    PRIMARY KEY (id)
  );

 CREATE INDEX IF NOT EXISTS orders_userid ON orders (userid);


-- Таблица с вопросами:
-- ИД: генерируется (ключевое поле),
-- Текст - текст вопроса

  CREATE TABLE IF NOT EXISTS questions (
    id uuid,
    text varchar,
    PRIMARY KEY (id)
  );


-- Таблица топа игроков обоих полов:
-- ИД: фиксированный  (ключевое поле),
-- Количество очков  (ключевое поле),,
-- ИД пользователя (users)  (ключевое поле),
-- ИД пользователя ВКонтакте,
-- ИД пользователя (users)  (индексированное поле)


  CREATE TABLE IF NOT EXISTS points (
    id varchar,
    points int,
    userid uuid,
    uservid varchar,
    sex int,
    uid uuid,
    PRIMARY KEY ((id), points, userid)
  )  with clustering order by (points desc);

CREATE INDEX IF NOT EXISTS points_uid ON points (uid);


-- Таблица топа игроков парней:
-- ИД: фиксированный  (ключевое поле),
-- Количество очков  (ключевое поле),,
-- ИД пользователя (users)  (ключевое поле),
-- ИД пользователя ВКонтакте,
-- ИД пользователя (users)  (индексированное поле)

  CREATE TABLE IF NOT EXISTS points_guys (
    id varchar,
    points int,
    userid uuid,
    uservid varchar,
    sex int,
    uid uuid,
    PRIMARY KEY ((id), points, userid)
  )  with clustering order by (points desc);

CREATE INDEX IF NOT EXISTS points_guys_uid ON points_guys (uid);


-- Таблица топа игроков девушек:
-- ИД: фиксированный  (ключевое поле),
-- Количество очков  (ключевое поле),,
-- ИД пользователя (users)  (ключевое поле),
-- ИД пользователя ВКонтакте,
-- ИД пользователя (users)  (индексированное поле)

  CREATE TABLE IF NOT EXISTS points_girls (
    id varchar,
    points int,
    userid uuid,
    uservid varchar,
    sex int,
    uid uuid,
    PRIMARY KEY ((id), points, userid)
  )  with clustering order by (points desc);

CREATE INDEX IF NOT EXISTS points_girls_uid ON points_girls (uid);