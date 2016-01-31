var RitualBreakers = RitualBreakers || {};

RitualBreakers.Game = function () {

    this.witch = null;
    this.harvestables = null;
    this.enemies = null;

    this.context = null;

    this.tweenFree = true;
    
    this.socket;
    
    this.actionBuffer = new Array();

    this.items = []; // all sprites: witch, exits, enemies, harvestables
};

RitualBreakers.Game.prototype = {

    init: function (context) {

        this.context = context;

        this.game.renderer.renderSession.roundPixels = true;

        this.socket = context.socket;
    },

    create: function () {
        this.background = this.add.tileSprite(0, 0, this.world.width, this.world.width, 'grass');

        this.createGroups();

        for (var i = 0; i < this.context.descriptor.length; i++) {
            
            var type = this.context.descriptor[i].type;
            if (type === 'harvestable') {
                this.createHarvestable(this.context.descriptor[i])
            }
            else if (type === 'enemy') {
                this.createEnemy(this.context.descriptor[i])
            }
            else if (type === 'witch') {
                this.createWitch(this.context.descriptor[i])
            }
            else if (type === 'exit') {
                this.createExit(this.context.descriptor[i])
            }
            
        };

        // Add a status listener
        var self = this;
        console.log("Socket", this.socket);
        this.socket.removeListener('status');
        this.socket.on('status', function(data) {
            console.log('Status: ', data);
            for(var i = 0; i < data.length; i++) {
                self.actionBuffer.push(data[i]);   
            }
            
            if(self.tweenFree){
                self.nextAction();
            }          
        });
        
        this.socket.removeListener('gameover');
        this.socket.on('gameover', function(data) {
            self.context.ending = data;
            self.state.start('LevelFinished', true, false, self.context);
        });

    },

    // perform the next action
    nextAction: function() {
        if(this.actionBuffer.length > 0) {
            this.tweenFree = false;
            
            var action = this.actionBuffer.splice(0,1)[0];
            
            var tween = null;
            
            console.log("action", action);
            
            // TODO : determine action
            switch(action.action) {
                case 'move': 
                    console.log("entity id", action.entityId);
                    console.log("sprite?", this.items[action.entityId]);
                    tween = game.add.tween(this.items[action.entityId]).to({x: Math.round(this.scaleX(action.x)), y: Math.round(this.scaleY(action.y))}, 1800);
                    tween.start();
                    break;
                default:
                    this.tweenFree = true;
                    break;                
            }
            
            if(tween){
                tween.onComplete.add(this.nextAction, this);
            }
        } else {
            this.tweenFree = true;
        }
    },

    createText: function(x, y, text, style, size)
    {
        var textObject = this.add.text(x, y, text, style);
        textObject.font = "Roboto Slab";
        textObject.fixedToCamera = true;
        return textObject;
    },

    // create collision groups
    createGroups: function() {
        this.harvestables = this.add.group();
        this.enemies = this.add.group();
    },

    // harvestable factory
    createHarvestable: function(descriptor) {
        this.items[descriptor.id] = 
            this.harvestables.create(this.scaleX(descriptor.x), this.scaleY(descriptor.y), 'plants');

    },

    // enemy factory
    createEnemy: function (descriptor) {
        this.items[descriptor.id] = 
            this.enemies.create(this.scaleX(descriptor.x), this.scaleY(descriptor.y), 'tiny_wolf');
    },

    // witch factory
    createWitch: function (descriptor) {
        this.items[descriptor.id] = 
            this.witch = this.add.sprite(this.scaleX(descriptor.x), this.scaleY(descriptor.y), 'witch');

        this.witch.animations.add('left', [0, 1, 2, 3], 10, true);
        this.witch.animations.add('turn', [4], 20, true);
        this.witch.animations.add('right', [5, 6, 7, 8], 10, true);
    },

    // converts the server X coordinate in display X coordinate
    scaleX: function(value) {
        return value * this.world.width / 10
    },

    // converts the server Y coordinate in display Y coordinate
    scaleY: function(value) {
        return value * this.world.height / 10
    },

    // exit factory
    createExit: function (descriptor) {
        //this.items[descriptor.id] = 
        // TODO create exit  
    },

    animateHarvestable: function (harvestable) {
    },

    animateEnemies: function (enemy) {
    },

    removeEnemy: function(enemy) {
        enemy.kill();
    },

    update: function () {

        this.harvestables.forEach(this.animateHarvestable, this);
        this.enemies.forEach(this.animateEnemies, this);

        // Shortcuts, for debug only
        // if(this.input.keyboard.isDown(Phaser.Keyboard.U)) {
        //     this.levelUp();
        // }

        // if(this.input.keyboard.isDown(Phaser.Keyboard.D)) {
        //     this.die();
        // }
        // if(this.input.keyboard.isDown(Phaser.Keyboard.J)) {
        //     this.allowDoubleJump();
        // }

    },
};