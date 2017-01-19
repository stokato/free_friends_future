/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Регистрируем пользователя
 *
 */

const LocalStrategy   = require('passport-local').Strategy;
const bCrypt          = require('bcrypt-nodejs');

const logger    = require('../log')(module);
const db        = require('../../bin/db_manager');
const PF        = require('../../bin/const_fields');

module.exports = function(passport){
  
  passport.use('signup', new LocalStrategy({
      passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, callback) {
      
       function findOrCreateUser(){
  
         db.findAuthUser(null, username, function (err, user) {
           if(err) {
             logger.error('Error in SignUp');
             logger.error(err);
             return callback(err);
           }
  
           if (user) {
             console.log('User already exists with username: '+username);
             return callback(null, false, {'message' : 'User Already Exists'});
             
           } else {
             let newUser = {
               [PF.LOGIN] : username,
               [PF.PASSWORD] : createHash(password)
             };
             
             db.addAuthUser(newUser, function (err, user) {
               if(err) {
                 logger.error('Error in Saving user');
                 logger.error(err);
                 return callback(err);
               }

               logger.info('User Registration succesful');
               logger.info(user);
               
               return(callback(null, user, {'message' : 'success'}))
             });
           }
    
           // return callback(null, user);
         });
      }
      // Delay the execution of findOrCreateUser and execute the method
      // in the next tick of the event loop
      process.nextTick(findOrCreateUser);
    })
  );
  
  // Generates hash using bCrypt
  let createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  }
  
};
