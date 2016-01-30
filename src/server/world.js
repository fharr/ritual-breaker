"use strict";

var param = require('./utils/parameters');
var entities = require('./entities');

class World {
    constructor(){
        this.map = new Array(param.height);
        
        for(var i = 0; i < param.width; i++) {
            this.map[i] = new Array(param.height);
            for(var j = 0; j < param.height; j++) {
                this.map[i][j] = null;
            }
        }
        
        this.harvestables = new Array();
        
        for(var i = 0; i < param.height; i += 2) {
            var h = new entities.Harvestable(3, i, i+1);
            
            this.map[3, i] = h;
            this.harvestables.push(h);
        }
    
        for(var i = 1; i < param.height; i += 2) {
            var h = new entities.Harvestable(1, i, i+1);
            
            this.map[1, i] = h;
            this.harvestables.push(h);
        }
        
        this.witch = new entities.Witch(9, 4, 100, 100);
        
        this.map[9,4] = this.witch;
        
        this.enemies = new Array();
        
        var enemy = new entities.Enemy(9, 0, 10, 5);
        this.map[9,0] = enemy;
        this.enemies.push(enemy);
        
        enemy = new entities.Enemy(7, 1, 20, 1);
        this.map[7,1] = enemy;
        this.enemies.push(enemy);
        
        this.exits = new Array();
        
        var exit = new entities.Exit(8, 1);
        this.map[8,1] = exit;
        this.exits.push(exit);
        
        exit = new entities.Exit(8, 8);
        this.map[7,1] = exit;
        this.exits.push(exit);
    };
}

exports.World = World;