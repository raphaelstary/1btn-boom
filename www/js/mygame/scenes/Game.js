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
        this.playerControllers.forEach(function (controller) {
            controller.pause();
        });
        this.__paused = true;
    };

    Game.prototype.__resume = function () {
        if (this.__stop)
            return;
        this.playerControllers.forEach(function (controller) {
            controller.resume();
        });
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
        var players = [
            {
                key: 'gamepad1',
                type: 'gamepad',
                slot: 0,
                color: 'pink'
            }, {
                key: 'gamepad2',
                type: 'gamepad',
                slot: 1,
                color: 'blue'
            }
        ];
        this.world = PlayFactory.createWorld(this.stage, this.timer, this.device, this.map, 0, 0, endMap,
            this.__pause.bind(this), this.__resume.bind(this), this.shaker, players);

        this.world.init(function () {
            if (self.__itIsOver)
                return;

            self.__resume();
        });

        this.playerControllers = players.map(toController, this);
        this.__pause();

        this.inputHandlerTickIds = this.playerControllers.map(installInput, this);
        this.shakerTickId = this.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));
        this.__worldTick = this.events.subscribe(Event.TICK_MOVE, this.world.update.bind(this.world));
    };

    Game.prototype.preDestroy = function () {
        this.inputHandlerTickIds.forEach(function (id) {
            this.events.unsubscribe(id);
        }, this);
        this.events.unsubscribe(this.__worldTick);
        this.events.unsubscribe(this.shakerTickId);
        this.world.preDestroy();
    };

    /** @this Game */
    function toController(player) {
        return PlayFactory.createPlayerController(this.world, player);
    }

    /** @this Game */
    function installInput(controller) {
        if (controller.player.type == 'gamepad') {
            return installPlayerGamePad(this.events, controller);
        }
        if (controller.player.type == 'keyboard') {
            return installPlayerKeyBoard(this.events, controller);
        }
    }

    return Game;
})(G.PlayFactory, G.installPlayerKeyBoard, G.installPlayerGamePad, H5.wrap, H5.Event, H5.FixRezScreenShaker);