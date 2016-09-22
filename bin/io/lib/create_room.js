var gamejs = require('../../game');

var oPool = require('./../../objects_pool');
/*
 Создать новую комнату
 */
var countRoom = 0;    // Счетчки комнат (сейчас нужен для генерации идентификатора окна)

module.exports = function () {
  var name = "Room" + (++countRoom);
  var newRoom =  {
    name: name , // Как-нибудь генерируем новое имя (????)
    guys: {},
    guys_count: 0,
    girls: {},
    girls_count: 0,
    messages: [],
    game : null,
    girls_indexes : [1, 3, 5, 7, 9],
    guys_indexes : [2, 4, 6, 8, 10],
    track_list : [],
    likers : {},
    dislikers : {},
    trackTime : null
  };
  newRoom.game = new gamejs(newRoom);
  return newRoom;
};


//var track = {
//  track_id : "",
//  id : "",
//  vid : "",
//  likes : 0,
//  dislikes : 0
//}