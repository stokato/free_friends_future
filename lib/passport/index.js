/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Обработка запросов на регистрацию и авторизацию
 */

var log = require('./../log')(module);
var express = require('express');
var router = express.Router();

module.exports = function(passport) {
  
  router.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
  }));
  
  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash : true
  }));
  
};

