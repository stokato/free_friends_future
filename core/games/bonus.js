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
}
};

module.exports = bonus;