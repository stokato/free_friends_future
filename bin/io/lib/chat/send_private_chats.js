var constants             = require('./../../../constants'),
    oPool                 = require('./../../../objects_pool'),
    genDateHistory        = require('./../common/gen_date_history');

module.exports = function (socket, callback) { // Получаем данные по приватным чатам
  var secondDate = new Date();
  var firstDate = genDateHistory(secondDate);
  
  var period = {};
  period.first_date = firstDate;
  period.second_date = secondDate;
  oPool.userList[socket.id].getPrivateChatsWithHistory(period, function(err, history) {
    if(err) { return callback(err, null) }
    
    history = history || [];
    
    history.sort(function (mesA, mesB) {
      return mesA.date - mesB.date;
    });
    
    var i;
    for(i = 0; i < history.length; i++) {
      socket.emit(constants.IO_MESSAGE, history[i]);
    }
    
    callback(null, null);
  });
};