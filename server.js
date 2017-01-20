const config        = require('./config.json');

const express       = require('express');
const path          = require('path');
const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const passport      = require('passport');

const initPassport  = require('./lib/passport/init');
const session       = require('./lib/session');
const getCert       = require('./lib/get_cert');
const vkHandle      = require('./lib/vk_handle');
const logger        = require('./lib/log')(module);

const io            = require('./bin/io');

const crossDomain   = require('./lib/cross_dimain');
const questions     = require('./lib/questions/index');
const stat          = require('./lib/stat/index');
const shop          = require('./lib/shop/index');

//let profiles;

let app = express();

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
app.use('/statCtrlr', stat);
app.use('/shop', shop);

let auth = require('./lib/passport/index')(passport);
app.use('/auth', auth);

app.use(function(req, res, next) {
  res.status(404);
  logger.debug('Not found URL: %s', req.url);
  res.send({ error : 'Not found' });
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  logger.error('Internal error(%d): %s', res.statusCode, err.message);
  res.send({ error : err.message });
});



let server = app.listen(config.server.port, function() {
  logger.info('Sever running at: ' + config.server.host + ':' + config.server.port );
});

io.listen(server, function(err){
  if(err) return logger.error('Socket error: %s', err.message);

  //profiles = profs;

  // app.set('profiles', profs);
  
  logger.info('Socket server listening on port :' + config.server.port);

});