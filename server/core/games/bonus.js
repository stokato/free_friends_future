// Бонусная игра. Выбери карточку, чтобы выиграть золото

var io = require('socket.io')(3001);
var sockets = io.listen;

//Массив карточек
var cards = new Array(7); 

//Максимум м минимум для генератора случайных чисел
var max = 99,
    min = 0;
	
var temp  = 0, //Хранит максимальное значение массива
	index = 0; //Хранит индекс максимального значения массива
	
//Флаг для проверки истечения таймера   
var Flag = false;

//Генерирует одну выигрышную карту
function generatePot() {
    for(i = 0; i < cards.length; i++) {
     cards[i] = (Math.random() * (max - min) + min).toFixed(0);
    }

    temp = cards[0];
    
    for(i = 0; i < cards.length; i++) {
    if(temp < cards[i]) {
        temp = cards[i];
        index = i;
    }
    else continue;
    }
    
    return index;
}

//Смена флага
function returnFlag() {
    Flag = true;
    return Flag;
}

//Функция задает 15 секундную задержку
function checkTimeInterval () {
    setTimeout(returnFlag, 15000);
}

io.on('bonus', function(socket) {

socket.on('getPot', function(pot) {
	checkTimeInterval ();
	win = generatePot();
    socket.emit('setBonus', {pot:pot.win});  
    socket.broadcast.emit('setBonus', {pot:pot.win}); 
});
});