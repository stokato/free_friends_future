const config = require('./../config.json');
const esession = require('express-session');
const sessionStorage = require('./session_storage');

function Session() {
  this.session = esession({
    store : sessionStorage,
    secret : config.sessions.secret,
    key:   config.sessions.key,
    resave : config.sessions.resave,
    saveUninitialized : config.sessions.saveUninitialized,
    cookie : {
      secure : config.sessions.cookie.secure,
      httpOnly : config.sessions.cookie.httpOnly
    }
  });
}

Session.prototype.getSession = function() { return this.session; };

let session = new Session();

module.exports = session.getSession();