Описание используемой базы с фрагментами кода.



create keyspace meet with replication = {'class' : 'SimpleStrategy', 'replication_factor' : 1};



create table rooms (id text, flag boolean, seats list<text>, primary key(id)); 
create index on rooms (flag);

id - идентификатор стола
flag - флаг занятости стола
seats - места за столом



create table users (UID text, name text, city text, date timestamp, sex int, relation int, status text, points int, avatar text, guests list<text>, friends list<text>, photos list<text>, coins int,primary key(UID));
create index on users (name);

UID - идентификатор пользователя
name - имя пользовател¤
city - город откуда пользователь родом
date - дата рождения
sex - пол
relation - семейное положение
status - строка статуса
points - очки рейтинга
avatar - ссылка на аватарку
guests - гости
friends - друзья
photos - фотографии
coins - монетки



create table messages(id_message text, receiver_id text, sender_id text, mess_text text, date timestamp, primary key(id_message));
create index on messages(receiver_id);

id_message - идентификатор сообщения
receiver_id - идентификатор получателя
sender_id text - идентификатор отправителя
mess_text - самое сообщение
date - дата отправки



create table bountyList(bounty_id text, bounty_name text, bounty_price int, bounty_img text, primary key(bounty_id));
create index on bountyList(bounty_name);

bounty_id - идентификатор подарка
bounty_name - наименование подарка
bounty_price - стоимость подарка
bounty_img - изображение подарка



create table bounty(UID text, bounty_id text, uid_sender text, date timestamp, comment text, primary key(UID));
create index on bounty(bounty_id);

UID - идентификатор пользователя
bounty_id - идентификатор подарка
uid_sender - идентификатор отправителя
date - дата получения
comment - комментарий к подарку