/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 */

var login = require('./login');
var signup = require('./signup');
var db = require('../../bin/db_manager');
var logger    = require('../log')(module);

module.exports = function(passport){
  
  // Passport needs to be able to serialize and deserialize users to support persistent login sessions
  passport.serializeUser(function(user, callback) {
    // logger.debug('serializing user: ');
    // logger.debug(user);
    callback(null, user.id);
  });
  
  passport.deserializeUser(function(id, callback) {
    db.findAuthUser(id, null, function (err, user) {
      // logger.debug('deserializing user:',user);
      callback(err, user);
    });
  });
  
  // Setting up Passport Strategies for Login and SignUp/Registration
  login(passport);
  signup(passport);
  ;
};