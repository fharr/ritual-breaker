"use strict";

var pathfinder = require('./utils/pathfinder');
var param = require('./utils/parameters');
var action = require('./action');

var entityId = 0;

class Entity {   
    constructor(x, y) {
        // static id sequence
        entityId++;
        this.id = entityId;
        
        this.position = {};
        this.position.x = x;
        this.position.y = y;
        
        this.lastAction = null;
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
        
        if(this.isGrown()) {
            this.lastAction = "grownUp";
        }
    }
    
    isGrown(){
        return this.effectiveGrowsTime >= this.growsTime;
    }
}

class LivingEntity extends Entity {
    constructor(x, y, life, damage) {
        super(x,y);
        this.life = life;
        this.damage = damage;
    }
}

class Enemy extends LivingEntity {
    constructor(x, y, life, damage) {
        super(x,y,life,damage);
    }
    
    update(world) {       
        var newAction = null;
        
        if (this.life < 0) {
            var idx = world.enemies.indexOf(this);
            world.enemies.splice(idx, 1);
            newAction = new action.Action(this.id, "death", null, null);
        } else {
            var target = world.witch;
            
            var distance = pathfinder.getPathLength(this, target);
            
            if (distance > 1) {
                pathfinder.moveTo(target, this);
                newAction = new action.Action(this.id, "move", this.position.x, this.position.y);
            } else {
                target.life -= this.damage;
                newAction = new action.Action(this.id, "attack", target.position.x, target.position.y);
            }
        }
        
        world.actions.push(newAction);
    }
}

class Witch extends LivingEntity {
    constructor(x, y) {
        super(x,y,param.witchLife,param.witchDamage);
        this.mana = param.witchMana;
    }
    
    update(world) {        
        var target = this.getClosestEntity(world.enemies);
        var isEnemy = true;
        
        if (!target) {
            isEnemy = false;
            
            var grownHarvestables = new Array();
            for(var i = 0; i < world.harvestables.length; i++) {
                var harvestable = world.harvestables[i];
                if(harvestable.isGrown()) {
                    grownHarvestables.push(harvestable);
                }
            }
            
            target = this.getClosestEntity(grownHarvestables);
            
            if (!target) {
                target = this.getClosestEntity(world.exits);
            }
        }
        
        var distance = pathfinder.getPathLength(this, target);
        
        var newAction = null;
        
        if (distance > 1) {
            pathfinder.moveTo(target, this);
            newAction = new action.Action(this.id, "move", this.position.x, this.position.y);
        } else if (isEnemy) {
            target.life -= this.damage;
            newAction = new action.Action(this.id, "cast", target.position.x, target.position.y);
        } 
                
        world.actions.push(newAction);
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