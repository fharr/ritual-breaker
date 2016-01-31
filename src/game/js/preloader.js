var RitualBreakers = RitualBreakers || {};

RitualBreakers.Preloader = function (game) {
    this.logo = null;
    this.preloadBar = null;
    this.ready = false;
    this.socket = null;
    this.connected = false;
};

RitualBreakers.Preloader.prototype = {

    init: function () {

        this.socket = io(':3001');
        this.add.sprite(65, 120, 'logo');
        this.fontLoaded = false;

    },

    preload: function () {

        this.preloadBar = this.add.sprite(120, 500, 'preload');
        this.load.setPreloadSprite(this.preloadBar);
        
        // images
        this.load.image('grass', 'assets/grass_tile.png');
        
        // sprites
        this.load.spritesheet('alpha_wolf', 'assets/alpha_wolf.png', 48, 48);
        this.load.spritesheet('black_wolf', 'assets/black_wolf.png', 48, 48);
        this.load.spritesheet('tiny_wolf', 'assets/tiny_wolf.png', 30, 30);
        this.load.spritesheet('explosion', 'assets/explosion.png', 60, 110);
        this.load.spritesheet('hit', 'assets/hit.png', 50, 46);
        this.load.spritesheet('fireball', 'assets/fireball.png', 32, 48);
        this.load.spritesheet('magic_glow', 'assets/magic_glow.png', 32, 32);
        this.load.spritesheet('plants', 'assets/plants.png', 32, 32);
        this.load.spritesheet('witch', 'assets/witch.png', 62, 62);
        
        // audios
        // this.load.audio('enemy', 'assets/coin2.mp3');
        // this.load.audio('death', 'assets/death.mp3');
        // this.load.audio('jumping', 'assets/Jump-SoundBible.com-1007297584.mp3');
        // this.load.audio('levelup', 'assets/243020__plasterbrain__game-start.ogg');

        //  Note: Graphics are Copyright 2015 Photon Storm Ltd.
        //  Load the Google WebFont Loader script
        this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

        var self = this;
        this.socket.on('connected', function(data) {
            console.log(data)
            self.descriptor = data;
            self.connected = true;
        });
        this.socket.connect(); 
    },

    create: function () {
    },

    update: function () {
        //  Make sure all our mp3s have decoded before starting the game
        if (!this.ready)
        {
            if (//this.cache.isSoundDecoded('enemy') &&
                //this.cache.isSoundDecoded('jumping') &&
                this.game.fontLoaded &&
                this.connected)
            {
                this.ready = true;

                var context = {
                    score: 0,
                    level: 1,
                    lives: 3,
                    socket: this.socket,
                    descriptor: this.descriptor
                }
                this.state.start('MainMenu', true, false, context);
            }
        }
    }
};