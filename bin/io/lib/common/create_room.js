var constants = require('./../../../constants');
var GameJS = require('../../../game/index');

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
    girls_indexes : [1, 2, 3, 4, 5],
    guys_indexes  : [1, 2, 3, 4, 5],
    track_list : [],
    likers : {},
    dislikers : {},
    trackTime : null,
    
    pushIndex : function (sex, index) {
      var arr = (sex == constants.GUY)? this.guys_indexes : this.girls_indexes;
      
      arr.push(index);
    },
    popIndex : function (sex) {
      var arr = (sex == constants.GUY)? this.guys_indexes : this.girls_indexes;
      arr.sort(function (i1, i2) { return i1 - i2; });
      
      var index = arr[0];

      arr.splice(0, 1);
      
      return index;
    },
    
    getCountInRoom : function (sex) {
      return (sex == constants.GUY)? this.guys_count : this.girls_count;
    },
    
    addProfile : function (sex, profile) {
      if(sex == constants.GUY) {
        this.guys[profile.getID()] = profile;
        this.guys_count++;
      } else {
        this.girls[profile.getID()] = profile;
        this.girls_count++;
      }
    },
    deleteProfile : function (sex, profileID) {
            
      if(sex == constants.GUY) {
        delete  this.guys[profileID];
        this.guys_count--;
      } else {
        delete this.girls[profileID];
        this.girls_count--;
      }
    }
    
    
  };
  
  newRoom.game = new GameJS(newRoom);
  return newRoom;
};

