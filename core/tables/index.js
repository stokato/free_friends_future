//Подключение конфига
var cfg    = require('../config'),
    player = require('../player');
    

//Подключение драйвера Кассандры
var Cassandra = require('cassandra-driver');

//Инициализация Кассандры
var client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});

/* ========== Блок калбэков ========== */

function callback_createNewTable(error, result) {
  if(error) {
      console.log("Error (createNewTable) message: ", error);
  }
  else {
      console.log("The table creating sucess");
  }
};

function callback_Counter(error, result) {
   if(error) {
        console.log("Error (Counter) message: ", error);
    }
    else {
        var count =  +(result.rows[0].count);
        
        if(count == 0) {
            var ID = count++;
            rooms.createNewTable(ID);
        }
        
        else {
            rooms.checkTrueTables();
        }
    }
};

function callback_checkTrueTables(error, result) {
    var count = 0;
    if(error) {
        console.log("Error (checkTrueTables) message: ", error);
    }
    else {
        for(var i = 0; i < result.rows.length; i++) {
            count++;
        }
        if(count == 0) {
            rooms.createID();
        }
        else {
            rooms.selectTrueTable();
        }
    }
};

function callback_createID(error, result) {
    if(error) {
        console.log("Error (createID) message: ", error);
    }
    else {
       var ID =  +(result.rows[0].count);
       rooms.createNewTable(ID);
    }
};

function callback_selectTrueTable(error, result) {
    var IDs = [];
    var min = 0,
        max = result.rows.length - 1;
    if(error) {
        console.log("Error (selectTrueTable) message: ", error);
    }
    else {
        for(var i = 0; i < result.rows.length; i++) {
            IDs[i] = result.rows[i].id;
        }
           var Index = +((Math.random() * (max - min) + min).toFixed(0));
           ID = IDs[Index];
           user_id = player.getID;
           rooms.seatPlayer(ID, user_id);
    }
};

function callback_seatPlayer(error, result) {
    if(error) {
        console.log("Error (seatPlayer) message: ", error);
    }
    else {
        rooms.checkSeats(ID);
    }
};

function callback_checkSeats(error, result) {
    if(error) {
        console.log("Error (checkSeats) message: ", error);
    }
    else {
            if(result.rows[0].seats.length == 12) {
                    rooms.checkFlag(ID);
            }
    }
};

function callback_checkFlag(error, result) {
    if(error) {
        console.log("Error (checkFlag) message: ", error);
    }
    else {
          if(result.rows[0].flag) {
              rooms.setFalse(ID);
          }
    }
};

function callback_setFalse(error, result) {
    if(error) {
        console.log("Error (setFalse) message: ", error);
    }
    else {
        console.log("Флаг изменен на false");
    }
};


function callback_setTrue(error, result) {
    if(error) {
        console.log("Error (setFalse) message: ", error);
    }
    else {
        console.log("Флаг изменен на true");
    }
};

function callback_getSeatNumber (error, result) {
  var indx = 0;
  if(error) {
    console.log("Error (getSeatNumber) message: ", error);
  }
  else {
      for(var i = 0; i < result.rows[0].seats.length; i++) {
        if(result.rows[0].seats[i] == user_id) {
            indx = i;
        }
      }
      
      rooms.deletePlayer(ID, indx);
  }
};


function callback_deletePlayer(error, result) {
  if(error) {
    console.log("Error (deletePlayer) message: ", error);
  }
  else {
      console.log("Пользователь удален из-за стола");
  }
};
/* ============== END ================ */

//Основной блок модуля Rooms
var rooms = {
initGame: function initGame () {
   this.Counter();
},

//Функция создает новый ID для стола
createID: function createID() {
    client.execute("select count(*) from rooms", {prepare: true}, callback_createID);
},

//Функция проверяет общее кол-во столов
Counter: function Counter() {
    client.execute("select count(*) from rooms", {prepare: true}, callback_Counter);
},

//Функция создает новый стол
createNewTable: function createNewTable(ID) {
    client.execute("insert into rooms (id, flag) values (?,?)", [ID, true], {prepare: true}, callback_createNewTable);
},

//Проверяет есть ли столы с флагом: true.
//Подсчитывает их количество
checkTrueTables: function checkTrueTables() {
    client.execute("select id from rooms where flag = true", {prepare: true}, callback_checkTrueTables);
},

//Функция рандомно выбирает стол с флагом: true
selectTrueTable: function selectTrueTable() {
    client.execute("select id from rooms where flag = true", {prepare: true}, callback_selectTrueTable);
},

//Посадить пользователя за стол
seatPlayer: function seatPlayer(ID, user_id) {
    client.execute("update rooms set seats = seats + ?, flag = true where id = ?",[[user_id], ID], {prepare: true}, callback_seatPlayer);
},

//Проверить сколько за столом осталось мест
checkSeats: function checkSeats(ID) {
    client.execute("select seats from rooms where id = ?", [ID], {prepare: true}, callback_checkSeats)
},

//Проверяет флаг стола
checkFlag: function checkFlag(ID) {
    client.execute("select flag from rooms where id = ?", [ID], {prepare: true}, callback_checkFlag);
},

//Сменить флаг стола на false 
setFalse: function setFalse(ID) {
    client.execute("update rooms set flag = false where id = ?", [ID], {prepare: true}, callback_setFalse);
},

//Сменить флаг стола на true 
setFalse: function setTrue(ID) {
    client.execute("update rooms set flag = true where id = ?", [ID], {prepare: true}, callback_setTrue);
},

//Получить номер места пользователя за столом
getSeatNumber: function getSeatNumber(ID, user_id) {
    client.execute("select seats from rooms where id = ?", [ID], {prepare: true}, callback_getSeatNumber);
},

//Удалить пользователя из-за стола
deletePlayer: function deletePlayer(ID, seatNum) {
   client.execute("delete seats[?] from rooms where id = ?", [seatNum, ID], {prepare: true}, callback_deletePlayer);
}

};

module.exports = rooms;