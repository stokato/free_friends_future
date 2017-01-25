/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 */

const db      = require('../../bin/db_controller');
const login   = require('./login');
const signup  = require('./signup');

module.exports = function(passport){
  
  // Passport needs to be able to serialize and deserialize users to support persistent login sessions
  passport.serializeUser(function(user, callback) {
    callback(null, user.id);
  });
  
  passport.deserializeUser(function(id, callback) {
    db.findAuthUser(id, null, function (err, user) {
      callback(err, user);
    });
  });
  
  // Setting up Passport Strategies for Login and SignUp/Registration
  login(passport);
  signup(passport);
};