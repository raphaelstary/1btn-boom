G.Game = (function (PlayFactory, installPlayerKeyBoard, installPlayerGamePad, wrap, Event, ScreenShaker) {
    "use strict";

    function Game(services, map) {
        this.device = services.device;
        this.events = services.events;
        this.stage = services.stage;
        this.timer = services.timer;

        this.map = map;

        this.__paused = false;
        this.__itIsOver = false;
        this.__stop = false;
    }

    Game.prototype.pause = function () {
        this.__pause();
        this.__stop = true;
    };

    Game.prototype.resume = function () {
        this.__stop = false;
        this.__resume();
    };

    Game.prototype.__pause = function () {
        if (this.__stop)
            return;
        this.playerController.pause();
        this.__paused = true;
    };

    Game.prototype.__resume = function () {
        if (this.__stop)
            return;
        this.playerController.resume();
        this.__paused = false;
    };

    Game.prototype.postConstruct = function () {
        this.__paused = false;
        this.__itIsOver = false;
        this.__stop = false;

        var self = this;

        function endMap() {
            if (self.__itIsOver)
                return;

            self.__pause();
            self.__itIsOver = true;
            self.nextScene({});
        }

        this.shaker = new ScreenShaker(this.device);
        this.world = PlayFactory.createWorld(this.stage, this.timer, this.device, this.map, 0, 0, endMap,
            this.__pause.bind(this), this.__resume.bind(this), this.shaker);

        this.world.init(function () {
            if (self.__itIsOver)
                return;

            self.__resume();
        });

        this.playerController = PlayFactory.createPlayerController(this.world);
        this.__pause();

        this.keyBoardHandler = installPlayerKeyBoard(this.events, this.playerController);
        this.gamePadHandler = installPlayerGamePad(this.events, this.playerController);
        this.shakerResizeId = this.events.subscribe(Event.RESIZE, this.shaker.resize.bind(this.shaker));
        this.shakerTickId = this.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));
        this.__worldTick = this.events.subscribe(Event.TICK_MOVE, this.world.update.bind(this.world));
    };

    Game.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyBoardHandler);
        this.events.unsubscribe(this.gamePadHandler);
        this.events.unsubscribe(this.__worldTick);
        this.events.unsubscribe(this.shakerResizeId);
        this.events.unsubscribe(this.shakerTickId);
        this.world.preDestroy();
    };

    return Game;
})(G.PlayFactory, G.installPlayerKeyBoard, G.installPlayerGamePad, H5.wrap, H5.Event, H5.ScreenShaker);