G.Start = (function (Event, Key) {
    "use strict";

    function Start(services) {
        this.events = services.events;
        this.services = services;
    }

    Start.prototype.postConstruct = function () {
        this.itIsOver = false;
        var self = this;
        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver)
                return;

            if (keyBoard[Key.ENTER] || keyBoard[Key.SPACE]) {
                self.itIsOver = true;
                self.nextScene();
            }
        });

        this.gamePadListener = this.events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (self.itIsOver)
                return;

            if (gamePad.isAPressed() || gamePad.isStartPressed()) {
                self.itIsOver = true;
                self.nextScene();
            }
        });

    };

    Start.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return Start;
})(H5.Event, H5.Key);