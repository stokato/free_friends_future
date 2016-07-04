var dbjs      = require('./../../db/index'),                // База
    GameError = require('./../../game_error'),
    checkInput = require('./../../check_input'),
  profilejs =  require('../../profile/index'),
    constants = require('./../constants');

var db = new dbjs();

/////////////////////////// ТОП ИГРОКОВ ///////////////////////////////////////////////////////////
/*
 Показать топ пользователей
 - Получаем установленное константой количество пользователей,
    отсартированных по очкам, начиная с требуемого количества очков
 - Отправляем клиенту
 */
module.exports = function (socket, userList) {
  socket.on(constants.IO_GET_TOP, function() {
    //if (!checkInput(constants.IO_GET_TOP, socket, userList, options))  { return; }

//////////////////////////////////////////////
//    var fList = [];
//    var counter = 0;
//    db.findAllUsers(fList, function(err, users) {
//      if (err) { return  console.log(err.message); }
//      if (!users) { return callback(new Error("Такого пользователя нет в БД"), null); }
//
//      for(var i = 0; i < users.length; i++) {
//        counter++;
//        var friendProfile = new profilejs();
//        (function(friendProfile, user) {
//          friendProfile.build(user.id, function (err, info) {
//            if (err) { return  console.log(err.message); }
//
//            var rand = Math.floor(Math.random() * 10);
//
//            friendProfile.addPoints(rand, function(err, points) {
//              if(err) { return new GameError(socket, constants.IO_ADD_POINTS,
//                "Ошибка при начислении очков пользователю");}
//
//              onComplete();
//            });
//          });
//        })(friendProfile, users[i]);
//      }
//    });
//
//    function onComplete() {
//      counter--;
//      if(counter == 0) {
//        //var max = options[constants.FIELDS.points];

        ///////////////////////////////////////////////////////
        var res = {};
        db.findPoints(null, function (err, users) {
          if (err) { return new GameError(socket, constants.IO_GET_TOP, err.message); }
          res.all = users;

          db.findPoints(constants.GIRL, function (err, users) {
            if (err) { return new GameError(socket, constants.IO_GET_TOP, err.message); }
            res.girls = users;

            db.findPoints(constants.GUY, function (err, users) {
              if (err) { return new GameError(socket, constants.IO_GET_TOP, err.message); }
              res.guys = users;

              socket.emit(constants.IO_GET_TOP, res);
            });
          });
        });

        ///////////////////////////////////////////////////
    //  }
    //}
//////////////////////////////////////////////////////////

    //var max = options[constants.FIELDS.points];
    //db.findPoints(max, function (err, users) {
    //  if (err) { return new GameError(socket, constants.IO_GET_TOP, err.message); }
    //
    //  socket.emit(constants.IO_GET_TOP, users);
    //});
  });
};

