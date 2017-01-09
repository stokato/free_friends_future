/**
 * Проверяем, являются ли пользователи из списка друзьями
 *
 * Ищем в базе друзей, свяряем с полученным списком - друзьям меняем свойство is_friend на true
 *
 * @param usersID - список ид для проверки, callback
 * @result results - список пользователей с признаком is_friend
 */

const db = require('./../../db_manager');
const IOF = require('./../../constants').PFIELDS;

module.exports = function(usersID, callback) {
  let self = this;
  
  db.findFriends(self._pID, usersID, false, function(err, friendsInfo) { friendsInfo = friendsInfo || {};
    if (err) { return callback(err, null); }

    let results = [];
    for(let i = 0; i < usersID.length; i++) {

      results.push({
        [IOF.ID]        : usersID[i],
        [IOF.ISFRIEND]  : false
      });
      
      if(friendsInfo.friends) {
        let friends = friendsInfo.friends;
        
        for(let j = 0; j < friends.length; j++) {
          if(friends[j][IOF.ID] == results[i][IOF.ID]) {
            results[i][IOF.ISFRIEND] = true;
          }
        }
        
      }
      
    }

    callback(null, results);
  });
};