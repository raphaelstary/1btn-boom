G.World = (function () {
    "use strict";

    function World(worldView, domainGridHelper, endMap, pause, resume) {
        this.worldView = worldView;
        this.domainGridHelper = domainGridHelper;

        this.__endMap = endMap;
        this.__pause = pause;
        this.__resume = resume;
    }

    World.prototype.init = function (callback) {
        this.player = this.domainGridHelper.getPlayer();
        var walls = this.domainGridHelper.getWalls();
        var backgroundTiles = this.domainGridHelper.getBackgroundTiles();
        this.worldView.drawLevel(this.player, walls, backgroundTiles, callback);
    };

    World.prototype.moveLeft = function (callback) {
        return this.__move(this.player, this.player.u - 1, this.player.v, callback);
    };

    World.prototype.moveRight = function (callback) {
        return this.__move(this.player, this.player.u + 1, this.player.v, callback);
    };

    World.prototype.moveTop = function (callback) {
        return this.__move(this.player, this.player.u, this.player.v - 1, callback);
    };

    World.prototype.moveBottom = function (callback) {
        return this.__move(this.player, this.player.u, this.player.v + 1, callback);
    };

    World.prototype.__move = function (player, u, v, callback) {
        var canMove = this.domainGridHelper.canPlayerMove(player, u, v);
        if (!canMove)
            return false;

        function postMove() {
            if (callback)
                callback();
        }

        if (canMove) {
            var change = this.domainGridHelper.movePlayer(player, u, v);
            this.worldView.movePlayer(change, postMove);
        }

        return true;
    };

    return World;
})();