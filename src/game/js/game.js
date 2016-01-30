var RitualBreakers = RitualBreakers || {};

RitualBreakers.Game = function () {

    this.witch = null;
    this.harvestables = null;
    this.enemies = null;

    this.facing = 'left';

    this.cursors = null;
    this.context = null;
    // this.levelText = null;
    // this.scoreText = null;

    this.socket;

    this.items = []; // all sprites: witch, exits, enemies, harvestables

    this.speed = 1.0
};

RitualBreakers.Game.prototype = {

    init: function (context) {

        this.context = context;

        console.log(context)

        this.game.renderer.renderSession.roundPixels = true;

        this.world.resize(700, 700);

        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.physics.arcade.skipQuadTree = false;

        this.socket = context.socket;

    },

    create: function () {
        this.background = this.add.tileSprite(0, 0, this.camera.view.width, this.camera.view.width, 'grass');

        this.createGroups();

        for (var i = this.context.descriptor.length - 1; i >= 0; i--) {

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

        // this.cursors = this.input.keyboard.createCursorKeys();

        var style = { fill: "#ffffff", align: "center", fontSize: 32 };

        // this.scoreText = this.createText(20, 20, this.context.score || '000', style);
        // this.levelText = this.createText(520, 20, "level " + (this.context.level || '1'), style);


        // Add a connect listener
        var self = this;
        this.socket.on('status', function(data) {
            self.updateVelocity(data)
        });

    },

    // update the velocity of moving items, according to the new data received from the server
    updateVelocity: function(descriptor) {
        for (var i = descriptor.length - 1; i >= 0; i--) {
            if(descriptor[i].type === 'witch' || descriptor[i].type === 'enemy') {
                var sprite = this.items[descriptor[i].id]
                if(sprite != undefined) {

                    console.log("descriptor[i].x", descriptor[i].x)
                    console.log("descriptor[i].y", descriptor[i].y)
                    console.log("sprite.body.position.x", sprite.body.position.x)
                    console.log("sprite.body.position.y", sprite.body.position.y)
                    sprite.body.velocity.x = this.speed * Math.round(this.scaleX(descriptor[i].x) - sprite.body.position.x);
                    sprite.body.velocity.y = this.speed * Math.round(this.scaleY(descriptor[i].y) - sprite.body.position.y);
                    console.log("sprite.body.velocity.x", sprite.body.velocity.x)
                    console.log("sprite.body.velocity.y", sprite.body.velocity.y)
                }
            }
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
        this.harvestables = this.add.physicsGroup();
        this.harvestables.setAll('body.allowGravity', false);
        this.harvestables.setAll('body.immovable', true);

        this.enemies = this.add.physicsGroup();
        this.enemies.setAll('body.allowGravity', false);
        this.enemies.setAll('body.immovable', true);
    },

    // harvestable factory
    createHarvestable: function(descriptor) {
        this.items[descriptor.id] = 
            this.harvestables.create(this.scaleX(descriptor.x), this.scaleY(descriptor.y), 'harvestable');

    },

    // enemy factory
    createEnemy: function (descriptor) {
        this.items[descriptor.id] = 
            this.enemies.create(this.scaleX(descriptor.x), this.scaleY(descriptor.y), 'enemy');
    },

    // witch factory
    createWitch: function (descriptor) {
        this.items[descriptor.id] = 
            this.witch = this.add.sprite(this.scaleX(descriptor.x), this.scaleY(descriptor.y), 'dude');

        this.physics.arcade.enable(this.witch);

        this.witch.body.collideWorldBounds = true;
        this.witch.body.setSize(20, 32, 5, 16);

        this.witch.body.allowGravity = false;
        

        this.witch.animations.add('left', [0, 1, 2, 3], 10, true);
        this.witch.animations.add('turn', [4], 20, true);
        this.witch.animations.add('right', [5, 6, 7, 8], 10, true);
    },

    // converts the server X coordinate in display X coordinate
    scaleX: function(value) {
        return value * this.camera.view.width / 10
    },

    // converts the server Y coordinate in display Y coordinate
    scaleY: function(value) {
        return value * this.camera.view.height / 10
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

    catchEnemy: function (player, enemy) {
        console.log("catchEnemy")
    },

    catchHarvestable: function (player, enemy) {
        console.log("catchHarvestable")
    },

    removeEnemy: function(enemy) {
        enemy.kill();
    },

    update: function () {

        this.harvestables.forEach(this.animateHarvestable, this);
        this.enemies.forEach(this.animateEnemies, this);

        this.physics.arcade.collide(this.witch, this.harvestables, this.catchHarvestable, null, this);
        this.physics.arcade.overlap(this.witch, this.enemies, this.catchEnemy, null, this);

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

    movePlayer: function()
    {
        // if (this.cursors.left.isDown)
        // {

        //     this.witch.body.velocity.x = -velocity;

        //     if (this.facing !== 'left')
        //     {
        //         this.witch.play('left');
        //         this.facing = 'left';
        //     }
        // }
        // else if (this.cursors.right.isDown)
        // {
        //     this.witch.body.velocity.x = velocity;

        //     if (this.facing !== 'right')
        //     {
        //         this.witch.play('right');
        //         this.facing = 'right';
        //     }
        // }
        // else
        // {
        //     if (this.facing !== 'idle')
        //     {
        //         this.witch.animations.stop();

        //         if (this.facing === 'left')
        //         {
        //             this.witch.frame = 0;
        //         }
        //         else
        //         {
        //             this.witch.frame = 5;
        //         }

        //         this.facing = 'idle';
        //     }
        // }

    },


    die: function(){
        this.sound.play('death');
        this.witch.kill();
        this.context.lives--;
        if(this.context.lives === 0) {
            this.context.isGameOver = true;
            this.context.lives = 3;
            this.state.start('LevelFinished', true, false, this.context);
        }
        else {
            this.state.start('LevelFinished', true, false, this.context);
        }
    },

    levelUp: function() {
        this.sound.play('levelup');
        if(this.context.lives < 3) {
            this.context.lives++;
        }
        this.context.isGameFinished = (this.context.level === levels.length - 1);
        if(this.context.isGameFinished) {
            this.context.level = 1;
        }
        else {
            this.context.level++;
        }
        this.context.isGameOver = false;
        this.state.start('LevelFinished', true, false, this.context);
    }

};