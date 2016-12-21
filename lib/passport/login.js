/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Аутентификация пользователя
 */
var LocalStrategy   = require('passport-local').Strategy;
var db = require('../../bin/db_manager');
var logger    = require('../log')(module);
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){
  
  passport.use('login', new LocalStrategy({
      passReqToCallback : true
    },
    function(req, username, password, callback) {
      
      db.findAuthUser(null, username, function (err, user) {
        if(err) { return callback(err); }
        
        if(!user) {
          logger.error('User Not Found with username '+username);
          return callback(null, false, {"message": "User not found."});
        }
        
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
          return callback(null, false, {"message": "Invalid Password."} );
        }
  
        return callback(null, user, { "message" : "success" });
      });
      
    })
  );
  
  
  var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
  }
  
};