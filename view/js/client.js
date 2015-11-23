$( document ).ready(function() {
	
	//Инициализация подключения к socket.io
	var socket = io();
	
	//Метод для получения имени пользователя
	function getName() {
		
		/* Имя будет браться из социальнх сетей
		   Пока что можно использовать приставку id_ в паре со случайным числом
		   в диапазоне от 1 до 99 */
		   
		var name = 'id_' + Math.random() * (99 - 1) + 1;
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
	
	
});