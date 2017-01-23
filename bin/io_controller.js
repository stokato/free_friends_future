/**
 * Created by s.t.o.k.a.t.o on 28.12.2016.
 *
 * Контроллер обработки вызовов клиента
 */

const emitRes = require('./emit_result');
const checkInput = require('./check_input');

module.exports.setEmit = function (socket, emit, handler) {
  
  socket.removeAllListeners(emit);
  
  socket.on(emit, function(options) {
    checkInput(emit, socket, options, (err, sock, options) => {
      if(err) {
        return emitRes(err, socket, emit);
      }
      
      
      if(!handler) {
        return emitRes({ message : 'Нет обработчика для: ioController'}, socket, emit); // TODO: добавить ошибку - отсутствует обработчик
      }
      
      handler(socket, options);
    });
  });
};

module.exports.removeEmit = function (socket, emit) {
  socket.removeAllListeners(emit);
};

