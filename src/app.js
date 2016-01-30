var express = require('express');
var socket = require('socket.io');
var world = require('./server/world');
var param = require('./server/utils/parameters');
var entities = require('./server/entities');
var dtoGenerator = require('./server/utils/dtoGenerator');

// ------------------------
// creating the game server
// ------------------------

var server_io = socket.listen(3001);
console.log('Game engine listening on port 3001.')

//Connection from clients
server_io.on('connection', function (server_socket) {

    console.log("[SERVER] Player joined : " + server_socket.id);

    server_socket.on('disconnect', function () {
        console.log("[SERVER] Player disconnected : " + server_socket.id);
    });
});

var worldInstance = new world.World();

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
    server_io.emit('status', dtoGenerator.getWorldDto(worldInstance));
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