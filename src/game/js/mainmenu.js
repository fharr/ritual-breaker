var RitualBreakers = RitualBreakers || {};

RitualBreakers.MainMenu = function () {
    this.endText = null;
    this.instructions = null;
    this.context = null;
    this.sky = null;
};

RitualBreakers.MainMenu.prototype = {

    init: function(context) {
        this.context = context;
    },

    preload: function () {
    },

    create: function () {
        this.sky = this.add.tileSprite(0, 0, this.camera.view.width, this.camera.view.width, 'grass');

        this.startText = this.createText(this.camera.view.width / 2,
                                       this.camera.view.height / 2,
                                       60);

        this.instructions = this.createText(this.camera.view.width / 2,
                                            this.camera.view.height / 2,
                                            60);

        this.startText.setText('');
        this.instructions.setText("Press Enter to start");
    },

    createText: function (x, y, fontSize) {
        var style = { fill: "#ffffff", align: "center" };
        var text = this.add.text(x, y, '', style);
        text.font = "Roboto Slab";
        text.fontSize = fontSize;
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;
        text.align = 'center';
        text.fixedToCamera = true;
        return text;
    },

    update: function () {
        if (this.input.keyboard.isDown(Phaser.Keyboard.ENTER))
        {
            this.state.start('Game', true, false, this.context);
        }
    }
};
