var oPool = require('./../../../objects_pool'),
    ProfileJS =  require('../../../profile/index');

module.exports = function (profileID, callback) {
  
  var profile = null;
  
  if (oPool.profiles[profileID]) {        // Если онлайн
    
    profile = oPool.profiles[profileID];
  
    callback(null, profile);
  } else {                           // Если нет - берем из базы
    
    profile = new ProfileJS();
    profile.build(profileID, function (err, info) {  // Нужен VID и все поля, как при подключении
      if (err) { return callback(err, null); }
  
      callback(null, profile);
    });
    
  }
};