var socketio  =  require('socket.io');
var ios       = require('socket.io-express-session');

var ioClient = require('socket.io-client');

var emitInit = require('./lib/emits/emit_init');

var session     = require('./../../lib/session');
//var checkSession = require('./checkSession');

var oPool       = require('./../objects_pool');

var io = null;                                      // Сокет

/*
При подключении выполняем инициализацию и вешаем эмиттеры
 */
module.exports.listen = function(server, callback) {
  //io = socketio.listen(server);
  io = socketio(server);

  //io.set('log level', 1);
  io.set('origins', '*:*'); // 'dev.foo.com:* foo.com:* 10.10.17.252:* www.foo.com:* https://dev.foo.com:* https://foo.com:* https://10.10.17.252:* https://www.foo.com:*'

  io.use(ios(session));

  //io.use(checkSession);

  io.sockets.on('connection', function (socket) {

    emitInit(socket);
    
  });
  
  //////////// Боты
  var bots = [];
  var ids = [28922, 46733, 3134205, 178755875,  19581362];
  var males = [1, 1, 2, 2, 1];
  var countries = [1, 2, 3, 4, 9];
  var cities = [2, 314, 467, 284, 378];
  var bDate =new Date(1993, 4, 1, 0, 0, 0, 0);

  for(var b = 0; b < 5; b++) {
    var clientS = ioClient.connect('http://localhost:3000');

    clientS.emit('init', {
      sex : males[b],
      bdate : bDate,
      country : countries[b],
      city : cities[b],
      vid : ids[b].toString()
    });

    bots.push(clientS);

  }
  ////////////
  
  callback(null, oPool.profiles);
};


