"use strict";

var pathfinder = require('./utils/pathfinder');

class Entity {   
      constructor(x, y) {
        this.position = {};
            
        this.position.x = x;
        this.position.y = y;
    }
}

class Harvestable extends Entity {
    constructor(x, y, growsTime) {
        super(x,y);
        this.growsTime = growsTime;
        this.effectiveGrowsTime = 0;
    }
    
    update(world){
        this.growsTime++;
    }
    
    isGrown(){
        return this.effectiveGrowsTime >= this.growsTime;
    }
}

class LivingEntity extends Entity {
    constructor(x, y, life) {
        super(x,y);
        this.life = life;
    }
}

class Enemy extends LivingEntity {
    constructor(x, y, life, damage) {
        super(x,y,life);
        this.damage = damage;
    }
    
    update(world) {
        var target = world.witch;
        
        var distance = pathfinder.getPathLength(this, target);
        
        if(distance > 1){
            pathfinder.moveTo(this, target, world);
        } else {
            target.life -= this.damage;
        }
    }
}

class Witch extends LivingEntity {
    constructor(x, y, life, mana) {
        super(x,y,life);
        this.mana = mana;
    }
    
    update(world) {
        var target = this.getClosestEntity(world.enemies);
        var isEnemy = true;
        
        if (!target) {
            isEnemy = false;
            target = this.getClosestEntity(world.harvestables);
            
            if (!target) {
                target = this.getClosestEntity(world.exits);
            }
        }
        
        // TODO
        pathfinder.moveTo(this, target, world);
    }
    
    getClosestEntity(entities) {
        var entity;
        var shortestLength;

        for (var i = 0; i < entities.length; i++) {           
            var currentEntity = entities[i];
            var currentLength = pathfinder.getPathLength(this, currentEntity);
            
            if (!shortestLength || currentLength < shortestLength) {
                entity = currentEntity
            }
        }
        
        return entity;
    }
}

exports.Witch = Witch;
exports.Enemy = Enemy;
exports.Harvestable = Harvestable;
exports.Exit = Entity;