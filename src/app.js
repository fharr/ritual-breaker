var express = require('express');
var socket = require('socket.io');
var world = require('./server/world');
var param = require('./server/utils/parameters');
var entities = require('./server/entities');
var dtoGenerator = require('./server/utils/dtoGenerator');
var pathfinder = require('./server/utils/pathfinder');

// ------------------------
// creating the game server
// ------------------------

var server_io = socket.listen(3001);

var worldInstance = new world.World();
var boucleId = 0;

//Connection from clients
server_io.on('connection', function (server_socket) {

    console.log("[SERVER] Player joined : " + server_socket.id);

    server_socket.emit("connected", dtoGenerator.getWorldDto(worldInstance));

    server_socket.on('invoke', function() {
        var dto = null;
        if(boucleId % 4 == 0){
            var enemy = new entities.Enemy(8,0,30,5);
            worldInstance.enemies.push(enemy);
            dto = dtoGenerator.getDto(enemy, "enemy");
        }
        boucleId++;
        server_socket.emit("invokation", dto);
    });

    server_socket.on('reset', function() {
        server_socket.emit("init", dtoGenerator.getWorldDto(worldInstance));
    });

    server_socket.on('disconnect', function () {
        console.log("[SERVER] Player disconnected : " + server_socket.id);
    });
});

var update = function () {  
    console.log('update loop');
    var witch = worldInstance.witch;
    
    // update witch in the first place
    witch.update(worldInstance);
    
    // then update enemies
    for(var i = 0; i < worldInstance.enemies.length; i++) {
        var enemy = worldInstance.enemies[i];
        
        enemy.update(worldInstance);
    }
    
    // finally update harvestable
    for(var i = 0; i < worldInstance.harvestables.length; i++) {
        var harvestable = worldInstance.harvestables[i];
        
        harvestable.update(worldInstance);
    }

    // notify players with the list of action
    server_io.emit('status', worldInstance.actions);
    
    // call the next update loop
    setTimeout(function() {
        update();
    }, worldInstance.actions.length * param.actionDuration);
    
    // reset nbAction
    worldInstance.actions = new Array();
    
    // ritual condition
    if (witch.life < 0) {
        console.log('GameOver: witch dead');
        worldInstance = new world.World();
        server_io.emit('gameover', "The witch is dead.");
    } else {
        for(var i = 0; i < worldInstance.exits.length; i++) {
            var exit = worldInstance.exits[i];
            
            var distance = pathfinder.getPathLength(witch, exit);
            if(distance == 1) {
                console.log('GameOver: witch finished her daily ritual.');
                worldInstance = new world.World();
                server_io.emit('gameover', "The witch overcame her difficulties.");
                break;
            }
        }
    }
}

// first loop
update();

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