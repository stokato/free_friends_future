/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Обработка запросов на регистрацию и авторизацию
 */

var express = require('express');
var router = express.Router();
var logger    = require('../log')(module);

module.exports = function(passport) {
  
  router.post('/login', function (req, res, next) {
    
    passport.authenticate('login', function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        logger.error('login: ');
        logger.error(info);
  
        var stJSON = JSON.stringify(info);
  
        res.setHeader("Content-Type", "text/json");
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 401;
        return res.end(stJSON);
      }
      
      req.logIn(user, function (err) {
        if (err) { return next(err); }
        
        var stJSON = JSON.stringify(info);
        
        res.setHeader("Content-Type", "text/json");
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(stJSON);
      });
      
    })(req, res, next);
    
  });
  
  router.post('/signup', function (req, res, next) {
    
    passport.authenticate('signup', function (err, user, info) {
      if (err) { return next(err); }
      
      if (!user) {
        logger.error('signup: ');
        logger.error(info);
  
        var stJSON = JSON.stringify(info);
  
        res.setHeader("Content-Type", "text/json");
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 401;
        return res.end(stJSON);
      }
      
      req.logIn(user, function (err) {
        if (err) { return next(err); }
        
        var stJSON = JSON.stringify(info);
        
        res.setHeader("Content-Type", "text/json");
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(stJSON);
      });
      
    })(req, res, next);
    
  });
  
  router.post('/signout', function (req, res, next) {
    req.logout();
    
    var stJSON = JSON.stringify({ 'message' : 'succes'});
    
    res.setHeader("Content-Type", "text/json");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(stJSON);
  });
  
  return router;
};

