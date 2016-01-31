"use strict";

var param = require('./utils/parameters');
var entities = require('./entities');

class World {
    constructor(){
        this.actions = new Array();
        
        // create witch
        this.witch = new entities.Witch(9, 4, 100, 100);
        
        // create harvestables    
        this.harvestables = new Array();
    //     
    //     for(var i = 0; i < param.height; i += 2) {
    //         var h = new entities.Harvestable(3, i, i+1);
    //         this.harvestables.push(h);
    //     }
    // 
    //     for(var i = 1; i < param.height; i += 2) {
    //         var h = new entities.Harvestable(1, i, i+1);
    //         this.harvestables.push(h);
    //     }
        
        // create enemies
        this.enemies = new Array();
        
        var enemy = new entities.Enemy(9, 0, 10, 5);
        this.enemies.push(enemy);
        
        enemy = new entities.Enemy(2, 8, 20, 1);
        this.enemies.push(enemy);
        
        // create exits
        this.exits = new Array();
        
        var exit = new entities.Exit(8, 1);
        this.exits.push(exit);
        
        exit = new entities.Exit(8, 8);
        this.exits.push(exit);
    };
}

exports.World = World;