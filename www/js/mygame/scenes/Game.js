G.Game = (function (PlayFactory, installPlayerKeyBoard, installPlayerGamePad, wrap, Event, ScreenShaker, Camera,
    createViewPort, UI) {
    "use strict";

    function Game(services, map) {
        this.device = services.device;
        this.events = services.events;
        this.stage = services.stage;
        this.timer = services.timer;
        this.screen = services.scaledScreen;

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

        function endMap(p) {
            if (self.__itIsOver)
                return;

            self.__pause();
            self.__itIsOver = true;
            self.nextScene(p);
        }

        var hearts = {
            p1: {
                1: this.p1Heart1,
                2: this.p1Heart2,
                3: this.p1Heart3
            },
            p2: {
                1: this.p2Heart1,
                2: this.p2Heart2,
                3: this.p2Heart3
            }
        };

        this.shaker = new ScreenShaker(this.device);
        var players = [
            {
                key: H5.Key.SPACE,
                type: 'keyboard',
                slot: 0,
                color: 'pink'
            }, {
                key: H5.Key.ENTER,
                type: 'keyboard',
                slot: 1,
                color: 'blue'
            }
        ];
        var viewPort = createViewPort(this.stage);
        var camera = new Camera(viewPort);
        this.shaker.add(viewPort);

        var colors = {
            p1: UI.RED,
            p2: UI.BLUE
        };

        var extracted = function (color) {
            self.screen.style.backgroundColor = color;
            self.timer.doLater(function () {
                self.screen.style.backgroundColor = UI.BACKGROUND_COLOR;
                self.timer.doLater(function () {
                    self.screen.style.backgroundColor = color;
                    self.timer.doLater(function () {
                        self.screen.style.backgroundColor = UI.BACKGROUND_COLOR;
                        self.timer.doLater(function () {
                            self.screen.style.backgroundColor = color;
                            self.timer.doLater(function () {
                                self.screen.style.backgroundColor = UI.BACKGROUND_COLOR;
                                self.timer.doLater(function () {
                                    self.screen.style.backgroundColor = color;
                                    self.timer.doLater(function () {
                                        self.screen.style.backgroundColor = UI.BACKGROUND_COLOR;
                                    }, 2);
                                }, 2);
                            }, 2);
                        }, 2);
                    }, 2);
                }, 2);
            }, 2);
        };

        function shake(isHome, attacker) {
            if (isHome) {
                self.shaker.startBigShake();
                extracted(colors[attacker]);
            } else {
                self.shaker.startSmallShake();
            }
        }

        this.world = PlayFactory.createWorld(this.stage, this.timer, this.device, this.map, endMap,
            this.__pause.bind(this), this.__resume.bind(this), shake, players, camera, hearts);

        this.world.init(function () {
            if (self.__itIsOver)
                return;

            self.__resume();
        });

        this.playerControllers = players.map(toController, this);
        this.__pause();

        this.cameraListener = this.events.subscribe(Event.TICK_CAMERA, this.world.updateCamera.bind(this.world));
        this.inputHandlerTickIds = this.playerControllers.map(installInput, this);
        this.shakerTickId = this.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));
        this.__worldTick = this.events.subscribe(Event.TICK_MOVE, this.world.update.bind(this.world));
    };

    Game.prototype.preDestroy = function () {
        this.inputHandlerTickIds.forEach(function (id) {
            this.events.unsubscribe(id);
        }, this);
        this.events.unsubscribe(this.cameraListener);
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
})(G.PlayFactory, G.installPlayerKeyBoard, G.installPlayerGamePad, H5.wrap, H5.Event, H5.FixRezScreenShaker, G.Camera,
    G.createViewPort, G.UI);