var RitualBreakers = RitualBreakers || {};

RitualBreakers.LevelFinished = function () {
    this.endText = null;
    this.instructions = null;
    this.context = null;
    this.sky = null;
};

RitualBreakers.LevelFinished.prototype = {

    init: function(context) {
        this.context = context;
        this.context.restOk = false;
    },

    preload: function () {
    },

    create: function () {
        this.sky = this.add.tileSprite(0, 0, this.camera.view.width, this.camera.view.width, 'grass');

        this.endText = this.createText(this.camera.view.width / 2,
                                       this.camera.view.height / 2,
                                       30);

        this.instructions = this.createText(this.camera.view.width / 2,
                                            this.camera.view.height * 0.75,
                                            45);
        this.endText.setText("Game Over\nEnding: " + this.context.ending);
        
        var self = this;
        this.context.socket.removeListener('init');
        this.context.socket.on('init', function(data) {
            self.resetOk = true;
            self.context.descriptor = data;
        });
        this.context.socket.emit('reset');
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
        if(this.resetOk) {
            if (this.instructions.text == "") {
                this.instructions.setText("Press Enter to restart");
            }
            
            if (this.input.keyboard.isDown(Phaser.Keyboard.ENTER))
            {
                this.context.resetOk = false;
                this.state.start('Game', true, false, this.context);
            }
        }
    }
};
