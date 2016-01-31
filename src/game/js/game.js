var RitualBreakers = RitualBreakers || {};

RitualBreakers.Game = function () {

    this.witch = null;
    this.harvestables = null;
    this.enemies = null;
    this.exits = null;

    // sprites
    this.explosion = null;
    this.hit = null;

    // sounds
    this.grownupSound = null;
    this.hitSound = null;
    this.explosionSound = null;
    this.invokationSound = null;
    this.ambiance = null;

    this.context = null;

    this.actionFree = true;
    
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

        this.explosion = this.add.sprite(0, 0, "explosion");
        this.explosion.visible = false;
        this.explosion.animations.add("boom", null, 20, false);
        
        this.hit = this.add.sprite(0, 0, "hit");
        this.hit.visible = false;
        this.hit.animations.add("paf", null, 6, false);

        this.hitSound = this.add.audio('hit');
        this.grownupSound = this.add.audio('grownup');
        this.explosionSound = this.add.audio('explosion');
        this.invokationSound = this.add.audio('invokation');
        this.ambiance = this.add.audio('ambiance');
        this.ambiance.loop = true;

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
        this.socket.removeListener('status');
        this.socket.on('status', function(data) {
            for(var i = 0; i < data.length; i++) {
                self.actionBuffer.push(data[i]);   
            }
            
            if(self.actionFree){
                self.nextAction();
            }          
        });
        
        this.socket.removeListener('invokation');
        this.socket.on('invokation', function(data) {
            if(data != null) {
                self.createEnemy(data);
                self.invokationSound.play();
            } else {
                var result = document.getElementById("invokation-result");
                result.innerText = "Invokation échouée !!!"
            }
        });
        
        this.socket.removeListener('gameover');
        this.socket.on('gameover', function(data) {
            self.context.ending = data;
            self.state.start('LevelFinished', true, false, self.context);
        });

        this.ambiance.play();
    },

    // perform the next action
    nextAction: function() {
        if(this.actionBuffer.length > 0) {
            var self = this;
            
            this.actionFree = false;
            
            var action = this.actionBuffer.splice(0,1)[0];
            
            var toComplete = null;
            console.log(action.action);
            switch(action.action) {
                case 'move': 
                    toComplete = game.add.tween(this.items[action.entityId]).to({x: Math.round(this.scaleX(action.x)), y: Math.round(this.scaleY(action.y))}, 500);
                    toComplete.start();
                    break;
                case 'attack':               
                    this.hit.x = this.scaleX(action.x);
                    this.hit.y = this.scaleY(action.y);
                    this.hit.visible = true;

                    toComplete = this.hit.play("paf");
                    this.hitSound.play();
                    toComplete.onComplete.add(function() {
                        self.hit.visible = false;
                    }, this);
                    break;
                case 'cast':                
                    this.explosion.x = this.scaleX(action.x);
                    this.explosion.y = this.scaleY(action.y);
                    this.explosion.visible = true;
                    
                    toComplete = this.explosion.play("boom");
                    this.explosionSound.play();
                    toComplete.onComplete.add(function() {
                        self.explosion.visible = false;
                    }, this);
                    break;
                case 'death':
                    this.items[action.entityId].kill();
                    break;
                case 'grownUp':
                    var plant = this.items[action.entityId];                    
                    plant.play("adult");
                    this.grownupSound.play();
                    break;
                case 'harvest':
                    this.items[action.entityId].kill();
                    break;
            }
            
            if(toComplete){
                toComplete.onComplete.add(this.nextAction, this);
            } else {
                this.actionFree = true;
            }
        } else {
            this.actionFree = true;
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
        this.exits = this.add.group();
    },

    // harvestable factory
    createHarvestable: function(descriptor) {
        var sprite = this.harvestables.create(this.scaleX(descriptor.x), this.scaleY(descriptor.y), 'plants');
        
        sprite.animations.add("young", [48, 49, 50, 49, 48], 5, true);
        sprite.animations.add("adult", [0, 1, 2, 1, 0], 5, true);
        
        sprite.play("young");
        
        this.items[descriptor.id] = sprite;
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

    // exit factory
    createExit: function (descriptor) {
        var exit = this.exits.create(this.scaleX(descriptor.x), this.scaleY(descriptor.y), 'magic_glow');
        
        exit.animations.add("teleport", [9, 10, 11, 10, 9], 6, true);
        
        exit.play('teleport');
        
        this.items[descriptor.id] = exit;
    },

    // converts the server X coordinate in display X coordinate
    scaleX: function(value) {
        return value * this.world.width / 10
    },

    // converts the server Y coordinate in display Y coordinate
    scaleY: function(value) {
        return value * this.world.height / 10
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