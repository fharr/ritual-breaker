var Jumpup = Jumpup || {};

Jumpup.Game = function () {

    this.player = null;
    this.platforms = null;
    this.sky = null;

    this.facing = 'left';
    this.edgeTimer = 0;
    this.jumpTimer = 0;

    this.wasStanding = false;
    this.cursors = null;
    this.context = null;
    this.levelText = null;
    this.scoreText = null;
};

Jumpup.Game.prototype = {

    init: function (context) {

        this.context = context;

        this.game.renderer.renderSession.roundPixels = true;

        this.world.resize(640, 2000);

        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.physics.arcade.gravity.y = 750;
        this.physics.arcade.skipQuadTree = false;

    },

    create: function () {
        this.sky = this.add.tileSprite(0, 0, 640, 480, 'clouds');
        this.sky.fixedToCamera = true;

        this.add.sprite(0, 1906, 'trees');

        this.createPlatforms();

        this.player = this.add.sprite(320, 1952, 'dude');
        this.player.doubleJumping = false;

        this.life1 = this.add.sprite(20, 440, 'heart');
        this.life1.fixedToCamera = true;
        this.life1.visible = this.context.lives > 0;

        this.life2 = this.add.sprite(60, 440, 'heart');
        this.life2.fixedToCamera = true;
        this.life2.visible = this.context.lives > 1;

        this.life3 = this.add.sprite(100, 440, 'heart');
        this.life3.fixedToCamera = true;
        this.life3.visible = this.context.lives > 2;


        this.physics.arcade.enable(this.player);

        this.player.body.collideWorldBounds = true;
        this.player.body.setSize(20, 32, 5, 16);

        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('turn', [4], 20, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);

        this.camera.follow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();

        var style = { fill: "#ffffff", align: "center", fontSize: 32 };

        this.scoreText = this.createText(20, 20, this.context.score || '000', style);
        this.levelText = this.createText(520, 20, "level " + (this.context.level || '1'), style);

        this.doubleJumpIndicator = this.createText(600, 480, 'D', style);
        this.doubleJumpIndicator.pivot.x = this.doubleJumpIndicator.width;
        this.doubleJumpIndicator.pivot.y = this.doubleJumpIndicator.height;
        this.doubleJumpIndicator.visible = false;

        this.doubleJumpTimer = this.time.create(false);

        this.extraSpeedIndicator = this.createText(560, 480, 'S', style);
        this.extraSpeedIndicator.pivot.x = this.extraSpeedIndicator.width;
        this.extraSpeedIndicator.pivot.y = this.extraSpeedIndicator.height;
        this.extraSpeedIndicator.visible = false;

        this.extraSpeedTimer = this.time.create(false);
    },

    createText: function(x, y, text, style, size)
    {
        var textObject = this.add.text(x, y, text, style);
        textObject.font = "Roboto Slab";
        textObject.fixedToCamera = true;
        return textObject;
    },

    createPlatforms: function() {
        this.platforms = this.add.physicsGroup();
        this.coins = this.add.physicsGroup();

        var level = levels[this.context.level];
        for (var i = 0; i < level.length; i++)
        {
            for (var j = 0; j < level[i].length; j++)
            {
                this.createPlatform(level[i][j], this.context.level);
            }
        }

        this.platforms.setAll('body.allowGravity', false);
        this.platforms.setAll('body.immovable', true);
        this.coins.setAll('body.allowGravity', false);
        this.coins.setAll('body.immovable', true);
    },

    createPlatform: function(descriptor, level) {
        var platform = this.platforms.create(descriptor.x, descriptor.y, descriptor.type);

        platform.body.velocity.x = descriptor.speed;

        //  Inverse it?
        if (descriptor.direction === 'L')
        {
            platform.body.velocity.x *= -1;
        }
        if (descriptor.hasOwnProperty('verticalMove'))
        {
            platform.isMovingUpAndDown = true;
            this.add.tween(platform).to( { y: descriptor.y - descriptor.verticalMove }, 2200, Phaser.Easing.Back.InOut, true, 2000, 20, true).loop(true);
        }
        if (descriptor.ghost === true)
        {
            this.add.tween(platform).to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true).loop(true);
        }
        this.createCoins(platform, descriptor.coins);
    },

    // coin factory
    createCoins: function (platform, coinList) {
        platform.coins = [];
        var coin = null;
        for(var j=0; j < coinList.length; j++)
        {
            var coinKey = coinList[j];
            if(coinList.length == 3) {
                coin = this.add.sprite(platform.x + 13 + j * 45, platform.y - 36, coinKey);
            }
            else {
                coin = this.add.sprite(platform.x + platform.body.halfWidth - 16, platform.y-36, coinKey);
            }
            coin.animations.add('spin', null, 10, true);
            this.coins.add(coin);
            platform.coins[j] = coin;
            coin.body.velocity.x = platform.body.velocity.x;
            coin.isFinalCoin = coinKey === 'redCoin';
            coin.givesDoubleJump = coinKey === 'blueCoin';
            coin.givesExtraSpeed = coinKey === 'greenCoin';
        }
    },

    animatePlatform: function (platform) {
        if (platform.isMovingUpAndDown) {
            var y = platform.y - 36;
            for(var j=0; j < platform.coins.length; j++)
            {
                platform.coins[j].y = y;
            }
        }
        if (platform.body.velocity.x < 0 && platform.x <= -160)
        {
            platform.x = 640;
            this.updateCoinPosition(platform);
        }
        else if (platform.body.velocity.x > 0 && platform.x >= 640)
        {
            platform.x = -160;
            this.updateCoinPosition(platform);
        }

    },

    updateCoinPosition: function(platform) {
        if(platform.coins.length === 1) {
            platform.coins[0].x = platform.x + platform.body.halfWidth - 16;
        }
        else {
            for(var j=0; j < platform.coins.length; j++)
            {
                platform.coins[j].x = platform.x + j * 45;
            }
        }
    },

    setFriction: function (player, platform) {

        if (platform.key === 'ice')
        {
            player.body.x -= platform.body.x - platform.body.prev.x;
        }

    },

    catchCoin: function (player, coin) {
        if(coin.catched === undefined) {
            coin.catched = true;
            coin.play('spin');
            this.sound.play('coin');
            coin.body.allowGravity = true;
            coin.body.velocity.y = -400;
            coin.body.checkCollision.up = false;
            coin.body.checkCollision.down    = false;
            this.context.score += this.context.level * 100;
            this.scoreText.setText(this.context.score);
            this.time.events.add(1000, this.removeCoin, this, coin);
            if(coin.givesDoubleJump) {
                this.allowDoubleJump();
            }
            if(coin.givesExtraSpeed) {
                this.activateExtraSpeed();
            }
        }
    },

    removeCoin: function(coin) {
        if (coin.isFinalCoin) {
            this.levelUp();
        }
        coin.kill();
    },

    allowDoubleJump: function() {
        this.player.doubleJumpAllowed = true;
        this.doubleJumpIndicator.scale.setTo (2, 2);
        this.doubleJumpIndicator.visible = true;

        var tween = this.add.tween(this.doubleJumpIndicator.scale);
        tween.to({x: 1, y: 1}, 1000, Phaser.Easing.Linear.None);
        tween.start();

        this.doubleJumpTimer.removeAll(); // deletes any coming timer event
        this.doubleJumpTimer.add(10000, this.removeDoubleJump, this);
        this.doubleJumpTimer.start();
    },

    removeDoubleJump: function()
    {
        this.player.doubleJumpAllowed = false;
        this.doubleJumpIndicator.visible = false;
    },

    activateExtraSpeed: function()
    {
        this.player.extraSpeed = true;

        this.extraSpeedIndicator.scale.setTo (2, 2);
        this.extraSpeedIndicator.visible = true;

        var tween = this.add.tween(this.extraSpeedIndicator.scale);
        tween.to({x: 1, y: 1}, 1000, Phaser.Easing.Linear.None);
        tween.start();

        this.extraSpeedTimer.removeAll(); // deletes any coming timer event
        this.extraSpeedTimer.add(10000, this.removeExtraSpeed, this);
        this.extraSpeedTimer.start();
    },

    removeExtraSpeed: function()
    {
        this.player.extraSpeed = false;
        this.extraSpeedIndicator.visible = false;
    },

    update: function () {

        this.sky.tilePosition.y = -(this.camera.y * 2.0);

        this.platforms.forEach(this.animatePlatform, this);

        this.physics.arcade.collide(this.player, this.platforms, this.setFriction, this.allowCollision, this);
        this.physics.arcade.overlap(this.player, this.coins, this.catchCoin, null, this);

        var standing = this.player.body.blocked.down || this.player.body.touching.down;

        if(standing && this.previousVelocityY > 900) {
            this.die();
        }

        this.movePlayer(standing);

        this.previousVelocityY = this.player.body.velocity.y;

        this.wasStanding = standing;

        // Shortcuts, for debug only
        if(this.input.keyboard.isDown(Phaser.Keyboard.U)) {
            this.levelUp();
        }

        if(this.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.die();
        }
        if(this.input.keyboard.isDown(Phaser.Keyboard.J)) {
            this.allowDoubleJump();
        }

    },

    allowCollision: function(obj1, obj2) {
        return obj2.alpha >= 0.5;
    },

    movePlayer: function(standing)
    {
        this.player.body.velocity.x = 0;

        var velocity = this.player.extraSpeed ? 400 : 200;
        if (this.cursors.left.isDown)
        {

            this.player.body.velocity.x = -velocity;

            if (this.facing !== 'left')
            {
                this.player.play('left');
                this.facing = 'left';
            }
        }
        else if (this.cursors.right.isDown)
        {
            this.player.body.velocity.x = velocity;

            if (this.facing !== 'right')
            {
                this.player.play('right');
                this.facing = 'right';
            }
        }
        else
        {
            if (this.facing !== 'idle')
            {
                this.player.animations.stop();

                if (this.facing === 'left')
                {
                    this.player.frame = 0;
                }
                else
                {
                    this.player.frame = 5;
                }

                this.facing = 'idle';
            }
        }

        //  No longer standing on the edge, but were
        //  Give them a 250ms grace period to jump after falling
        if (!standing && this.wasStanding)
        {
            this.edgeTimer = this.time.time + 250;
        }
        if(standing  && this.player.doubleJumping){
            this.player.doubleJumping = false;
        }


        //  Allowed to jump?
        if (this.player.alive
            && this.time.time > this.jumpTimer
            && (this.cursors.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)))

        {
            var basicJumpAllowed = (standing || (this.time.time <= this.edgeTimer));
            if (basicJumpAllowed)
            {
                this.jump();
            }
            else if (this.player.doubleJumpAllowed && !basicJumpAllowed && !this.player.doubleJumping)
            {
                this.jump();
                this.player.doubleJumping = true;
            }
        }

    },

    jump: function()
    {
        this.player.body.velocity.y = -500;
        this.jumpTimer = this.time.time + 750;
        this.sound.play('jumping');
    },

    die: function(){
        this.sound.play('death');
        this.removeDoubleJump();
        this.player.kill();
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