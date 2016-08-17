G.World = (function (Tile, iterateEntries) {
    "use strict";

    function World(worldView, domainGridHelper, endMap, pause, resume) {
        this.worldView = worldView;
        this.domainGridHelper = domainGridHelper;

        this.__endMap = endMap;
        this.__pause = pause;
        this.__resume = resume;

        this.__ticker = 0;
        this.__conveyorBelt = {};
    }

    World.prototype.update = function () {
        if (this.__ticker % 60 === 0) {

            this.__moveBelts();

            this.__ticker = 0;
        }
        this.__ticker++;
    };

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

        delete this.__conveyorBelt[player.type];

        var self = this;

        function postMove() {
            var belt = self.domainGridHelper.isOnBelt(self.player);
            if (belt) {
                self.__conveyorBelt[self.player.type] = {
                    type: belt,
                    entity: self.player
                }
            }
            if (callback)
                callback();
        }

        if (canMove) {
            var change = this.domainGridHelper.movePlayer(player, u, v);
            this.worldView.movePlayer(change, postMove);
        }

        return true;
    };

    World.prototype.__moveBelts = function () {
        iterateEntries(this.__conveyorBelt, function (elem, key) {
            delete this.__conveyorBelt[key];

            if (elem.type == Tile.BELT_UP) {
                this.moveTop();
            } else if (elem.type == Tile.BELT_DOWN) {
                this.moveBottom();
            } else if (elem.type == Tile.BELT_LEFT) {
                this.moveLeft();
            } else if (elem.type == Tile.BELT_RIGHT) {
                this.moveRight();
            }
        }, this);
    };

    return World;
})(G.Tile, H5.iterateEntries);