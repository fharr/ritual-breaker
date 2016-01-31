var RitualBreakers = RitualBreakers || {};

RitualBreakers.Boot = function (game) {
};

RitualBreakers.Boot.prototype = {

    preload: function () {

        this.load.image('logo', 'assets/logo.jpg');
        this.load.image('preload', 'assets/preload.png');

    },

    create: function () {
        this.state.start('Preloader');
    }

};