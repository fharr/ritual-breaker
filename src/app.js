var express = require('express');
var socket = require('socket.io');
var World = require('./server/world');
var param = require('./server/utils/parameters');
var entities = require('./server/entities');

// ------------------------
// creating the game server
// ------------------------

var server_io = socket.listen(3001);
console.log('Game engine listening on port 3001.')

//Connection from client
// server_io.on('connection', function (server_socket) {
// 
//     console.log("[SERVER] Player joined : " + server_socket.id);
// 
//     server_socket.emit("acquittal", server_socket.id);
// 
//      server_socket.on('update', function (data) {
//          console.log("[SERVER] Player " + server_socket.id + " with param: " + data);
//          var cmd = C.getCommand(data, server_socket.id);
//  
//          if (cmd.CanRun())
//              cmd.Run();
//      });
// 
//     server_socket.on('disconnect', function () {
//         console.log("[SERVER] Player disconnected : " + server_socket.id);
//         world.removePlayer(server_socket.id);
//     });
// });

var worldInstance = new World();

// Update loop
setInterval(function () {
    var witch = worldInstance.witch;
    
    witch.update(worldInstance);
    
    for(var i = 0; i < worldInstance.enemies.length; i++) {
        var enemy = worldInstance.enemies[i];
        
        enemy.update(worldInstance);
    }
    
    for(var i = 0; i < worldInstance.harvestables.length; i++) {
        var harvestable = worldInstance.harvestables[i];
        
        harvestable.update(worldInstance);
    }

    // Notify players
    server_io.emit('status', "yolo");
}, param.updateRate);

// --------------------------------------	
// creating web server to expose the game
// --------------------------------------
var app = express();

app.get('/', function (req, res) {
  res.send('Navigate to index.html to play the game');
});

app.use(express.static('game'));

app.listen(3000, function () {
  console.log('ritual-breakers web server listening on port 3000!');
});