G.PlayerController = (function () {
    "use strict";

    function PlayerController(world, player, entity) {
        this.world = world;

        this.moving = false;
        this.__paused = false;

        this.player = player;
        this.entity = entity;
    }

    PlayerController.prototype.pause = function () {
        this.__paused = true;
    };

    PlayerController.prototype.resume = function () {
        this.__paused = false;
    };

    PlayerController.prototype.__myCallback = function () {
        this.moving = false;
    };

    PlayerController.prototype.handleAction = function () {
        if (this.__paused || this.moving)
            return;

        this.moving = this.world.move(this.entity, this.__myCallback.bind(this));
    };

    return PlayerController;
})();