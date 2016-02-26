var async     =  require('async');
// Свои модули
var profilejs =  require('../../profile/index'),          // Профиль
    GameError = require('../../game_error'),
    checkInput = require('../../check_input');

/*
 Получаем профиль (Нужна ли вообще такая функция, если в окне профиля только инф,
 которую можно достать из соц. сетей ????)
 - Если смотрим свой профиль - отправляем клиенту наши данные (какие ?)
 - Если чужой
 -- Получам профиль того, кого смотрим (из ОЗУ или БД)
 -- Добавляем себя ему в гости (пишем сразу в БД)
 -- Отправлем клиенту данные профиля (????)
 -- Если тот, кого смотрим, онлайн, наверно нужно его сразу уведомить о гостях ???
 */
module.exports = function (socket, userList, profiles) {
  socket.on('get_profile', function(options) {
    if (!checkInput('get_profile', socket, userList, options)) {
      return new GameError(socket, "ADDFRIEND", "Верификация не пройдена");
    }

    var selfProfile = userList[socket.id];
    var selfInfo = fillInfo(selfProfile);

    if (selfProfile.getID() == options.id) { // Если открываем свой профиль
      return socket.emit('get_profile', selfInfo);
    }

    var isOnline = false;
    if(profiles[options.id]) { isOnline = true }

    async.waterfall([///////////////////////////////////////////////////////////////////
      function (cb) { // Получаем профиль того, чей просматриваем
        var friendProfile = null;
        var friendInfo = null;
        if (isOnline) { // Если онлайн
          friendProfile = profiles[options.id];
          friendInfo = fillInfo(friendProfile);
          cb(null, friendProfile, friendInfo);
        }
        else {                // Если нет - берем из базы
          friendProfile = new profilejs();
          friendProfile.build(options.id, function (err, info) {
            if (err) { return cb(err, null); }

            friendInfo = fillInfo(friendProfile);

            cb(null, friendProfile, friendInfo);
          });
        }
      },///////////////////////////////////////////////////////////////
      function (friendProfile, friendInfo, cb) { // Добавляем себя в гости
        selfInfo[date] = new Date();
        friendProfile.addToGuests(selfInfo, function (err, res) {
          if (err) { return cb(err, null); }

          cb(null, friendInfo, selfInfo, friendProfile);
        });//////////////////////////////////////////////////////////////
      }], function (err, friendInfo, selfInfo, friendProfile) { // Вызывается последней. Обрабатываем ошибки
      if (err) { return new GameError(socket, "ADDFRIEND", err.message); }

      socket.emit('get_profile', friendInfo); // Отправляем инфу

      if (isOnline) { // Если тот, кого просматирваем, онлайн, сообщаем о посещении
        var friendSocket = friendProfile.getSocket();
        friendSocket.emit('add_guest', selfInfo);
        friendSocket.emit('get_news', friendProfile.getNews());
      }
    }); // waterfall
  });
};

function fillInfo(profile) {
  return  {
    id     : profile.getID(),
    vid    : profile.getVID(),
    age    : profile.getAge(), //
    sex    : profile.getSex(),
    city   : profile.getCity(),
    country: profile.getCountry(), //
    status : profile.getStatus(),
    points : profile.getPoints()
  }
}

