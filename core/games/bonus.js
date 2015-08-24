/*
 * The game "Bonus level"
 * Guess the card, win gold
 */
 
//Массив карточек
var cards = new Array(7); 
 
//Максимум м минимум для генератора случайных чисел
var max = 99,
    min = 0;
  
var temp  = 0, //Хранит максимальное значение массива
    index = 0; //Хранит индекс максимального значения массива
 
//Флаг для проверки истечения таймера   
var Flag = false;
    
var bonus =  {
    
generatePot: function generatePot() {
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
},

checkTimeInterval: function checkTimeInterval () {
    Flag = true;
    return Flag;
}
};

setTimeout(function() {console.log('Check time interval - complete');}, 15000);

module.exports = bonus;