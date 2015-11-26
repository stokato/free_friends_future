var SocketIO = require('socket.io');
var io;
    
sanitise: function sanitise(txt) {
  if(txt.indexOf("<") > -1 || txt.indexOf(">") > -1) {
    txt = txt.replace(/</g, "&lt").replace(/>/g, "&gt");
  }
  return txt;
}

chatHandler: function chatHandler (socket) {

  socket.emit('Добро пожаловать!');

  socket.on('io:name', function (name) {
    pub.HSET("people", socket.client.conn.id, name);
    pub.publish("chat:people:new", name);
  });

  socket.on('io:message', function (msg) {
    console.log("msg:", msg);
    msg = sanitise(msg);
    pub.HGET("people", socket.client.conn.id, function (err, name) {
        
    var str = JSON.stringify({
	message: msg,
	Time: new Date().getTime(),
	Name: name
    });
    
    console.log(str);
    //История чата
    pub.RPUSH("chat:messages", str); 
    //Последнее сообщение  
    pub.publish("chat:messages:latest", str);  
    })
  });

  socket.on('error', function (err) { console.error(err.stack) })
}
    
/**
 * chat is our Public interface
 * @param {object} (http) listener [required]
 */
 
function init (listener, callback) {
  // setup redis pub/sub independently of any socket.io connections
  pub.on("ready", function () {
    // console.log("PUB Ready!");
    sub.on("ready", function () {
      sub.subscribe("chat:messages:latest", "chat:people:new");
      // now start the socket.io
      io = SocketIO.listen(listener);
      io.on('connection', chatHandler);
      // Here's where all Redis messages get relayed to Socket.io clients
      sub.on("message", function (channel, message) {
	console.log(channel + " : " + message);
	io.emit(channel, message); // relay to all connected socket.io clients
      });
      setTimeout(function(){ callback() }, 300); // wait for socket to boot
    });
  });
}

module.exports = {
  init: init,
  pub: pub,
  sub: sub
};