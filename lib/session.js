var config = require('./../config.json');
var esession = require('express-session');

var sessionStorage = require('./session_storage');
//
//var session = esession({
//  store : sessionStorage,
//  secret : config.sessions.secret,
//  key:   config.sessions.key,
//  resave : config.sessions.resave,
//  saveUninitialized : config.sessions.saveUninitialized
//  //cookie : { secure : true }
//});

function Session() {
  this.session = esession({
    store : sessionStorage,
    secret : config.sessions.secret,
    key:   config.sessions.key,
    resave : config.sessions.resave,
    saveUninitialized : config.sessions.saveUninitialized
    //cookie : { secure : true }
  });
}

Session.prototype.getSession = function() { return this.session; };

var session = new Session();

module.exports = session.getSession();