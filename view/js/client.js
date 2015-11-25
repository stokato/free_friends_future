$( document ).ready(function() {
	
	//Инициализация подключения к socket.io
	var socket = io();
	
	//Метод для получения имени пользователя
	function getName() {
		
		/* Имя будет браться из социальнх сетей
		   Пока что можно использовать приставку id_ в паре со случайным числом
		   в диапазоне от 1 до 99 */
		   
		var name = Cookies.get('id_' + Math.random() * (99 - 1) + 1);
		Cookies.set('name', name)
		$('#message').focus();
		return name;
	}
	
	//Метод проверки на 0 перед числом меньше 10
	//Будет использован для работы с датой
	function checkZero (num) {
		
		if(num < 10) {
			num = '0' + num;
		}
		
		return num;
	}
	
	//Функция для получения даты
	function getCurrentDate(timestamp) {
		var T, H, M, S, Time;
		T = new Date(timestamp);
		H = checkZero(T.getHours());
		M = checkZero(T.getMinutes());
		S = checkZero(T.getSeconds());
		Time = H + ':' + M + ':' + S;
		return Time;
	}
	
	//Рендерим сообщения
	function renderMessage(msg) {
		msg = JSON.parse(msg);
		var html = "<li>";
		html += "<small class='time'>" + getTime(msg.t)  + " </small>";
		html += "<span class='name'>" + msg.n + ": </span>";
		html += "<span class='msg'>"  + msg.m + "</span>";
		html += "</li>";
		$('#messages').append(html);  
	    return;
    }
	
	
	$('form').submit(function() {
    
	//Если поле ввода пустое, или в нем просто пробелы
	//Сообщение отправлено не будет
    if($('#message').val().match(/^[\s]*$/) !== null) { 
       $('#message').val('');
       $('#message').attr('placeholder', 'Введите свое сообщение');
	   return false; 
    }
    
    if(!Cookies.get('name') || Cookies.get('name').length < 1 || Cookies.get('name') === 'null') {
      getName();
      return false;
    } else {
      var msg  = $('#message').val();
      socket.emit('io:message', msg);
	  //Очищаем поле ввода для нового сообщения
      $('#message').val(''); 
	  //Чистим placeholder если сообщение успешно отправлено
      $('#message').attr('placeholder', ''); 
      return false;
    }
  });
		
	
	
});