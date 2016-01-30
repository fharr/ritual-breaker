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
        this.add.sprite(265, 400, 'logo');
        this.fontLoaded = false;

    },

    preload: function () {

        this.preloadBar = this.add.sprite(120, 260, 'preload');
        this.load.setPreloadSprite(this.preloadBar);
        this.load.image('grass', 'assets/rpgTile019.png');
        this.load.image('harvestable', 'assets/tile_236.png');
        this.load.spritesheet('enemy', 'assets/enemy.png', 32, 32);
        this.load.spritesheet('dude', 'assets/dude.png', 32, 48);
        this.load.audio('enemy', 'assets/coin2.mp3');
        this.load.audio('death', 'assets/death.mp3');
        this.load.audio('jumping', 'assets/Jump-SoundBible.com-1007297584.mp3');
        this.load.audio('levelup', 'assets/243020__plasterbrain__game-start.ogg');

        //  Note: Graphics are Copyright 2015 Photon Storm Ltd.
            //  Load the Google WebFont Loader script
        this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        // this.socket.on('connected', this.connected);

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
            if (this.cache.isSoundDecoded('enemy') &&
                this.cache.isSoundDecoded('jumping') &&
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