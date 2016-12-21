var config = require('./config.json');

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// var socketio = require('socket.io-client');
var passport = require('passport');
var initPassport = require('./lib/passport/init');

var session = require('./lib/session');
var getCert = require('./lib/get_cert');
var vkHandle = require('./lib/vk_handle');
var log = require('./lib/log')(module);

var io = require('./bin/io');

var crossDomain = require('./lib/cross_dimain');
var questions = require('./lib/questions/index');
var stat      = require('./lib/stat/index');

var profiles;

var app = express();

//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.methodOverride());
//app.use(app.router);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(cookieParser(config.sessions.secret));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

initPassport(passport);

app.use(express.static(path.join(__dirname, config.static)));

app.use(getCert);

app.use(crossDomain);
app.use('/', vkHandle);
app.use('/questions', questions);
app.use('/stat', stat);
var auth = require('./lib/passport/index')(passport);
app.use('/auth', auth);

app.use(function(req, res, next) {
  res.status(404);
  log.debug('Not found URL: %s', req.url);
  res.send({ error : 'Not found' });
  return;
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  log.error('Internal error(%d): %s', res.statusCode, err.message);
  res.send({ error : err.message });
  return;
});



var server = app.listen(config.server.port, function() {
  log.info('Sever running at: ' + config.server.host + ':' + config.server.port );
});

io.listen(server, function(err, profs){
  if(err) return log.error('Socket error: %s', err.message);

  profiles = profs;

  app.set('profiles', profs);

  log.info('Socket server listening on port :' + config.server.port);

});