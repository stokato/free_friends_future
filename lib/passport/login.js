/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Аутентификация пользователя
 */
const LocalStrategy   = require('passport-local').Strategy;
const bCrypt = require('bcrypt-nodejs');

const db      = require('../../bin/db_controller');
const logger  = require('../log')(module);

module.exports = function(passport){
  
  passport.use('login', new LocalStrategy({
      passReqToCallback : true
    },
    function(req, username, password, callback) {
      
      db.findAuthUser(null, username, (err, user) => {
        if(err) {
          return callback(err);
        }
        
        if(!user) {
          logger.error('User Not Found with username '+ username);
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
  
  
  let isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
  }
  
};