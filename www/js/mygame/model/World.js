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

    var Direction = {
        UP: 'up',
        DOWN: 'down',
        LEFT: 'left',
        RIGHT: 'right'
    };

    World.prototype.init = function (callback) {
        this.player = this.domainGridHelper.getPlayer();
        this.player.direction = Direction.UP;
        this.player.isDead = false;

        this.playerRespawn = {
            u: this.player.u,
            v: this.player.v,
            type: this.player.type,
            direction: this.player.direction
        };

        var walls = this.domainGridHelper.getWalls();
        var backgroundTiles = this.domainGridHelper.getBackgroundTiles();
        this.worldView.drawLevel(this.player, walls, backgroundTiles, callback);
    };

    World.prototype.turnLeft = function (callback) {
        if (this.player.isDead || !this.player.drawable.show)
            return false;

        var direction = this.player.direction;
        if (direction == Direction.UP) {
            this.player.direction = Direction.LEFT;
        } else if (direction == Direction.DOWN) {
            this.player.direction = Direction.RIGHT;
        } else if (direction == Direction.LEFT) {
            this.player.direction = Direction.DOWN;
        } else if (direction == Direction.RIGHT) {
            this.player.direction = Direction.UP;
        } else {
            throw 'internal error: unhandled code branch';
        }
        this.worldView.turnLeft(callback);
        return true;
    };

    World.prototype.turnRight = function (callback) {
        if (this.player.isDead || !this.player.drawable.show)
            return false;

        var direction = this.player.direction;
        if (direction == Direction.UP) {
            this.player.direction = Direction.RIGHT;
        } else if (direction == Direction.DOWN) {
            this.player.direction = Direction.LEFT;
        } else if (direction == Direction.LEFT) {
            this.player.direction = Direction.UP;
        } else if (direction == Direction.RIGHT) {
            this.player.direction = Direction.DOWN;
        } else {
            throw 'internal error: unhandled code branch';
        }
        this.worldView.turnRight(callback);
        return true;
    };

    World.prototype.move = function (callback) {
        var direction = this.player.direction;
        if (direction == Direction.UP) {
            return this.moveTop(callback);
        } else if (direction == Direction.DOWN) {
            return this.moveBottom(callback);
        } else if (direction == Direction.LEFT) {
            return this.moveLeft(callback);
        } else if (direction == Direction.RIGHT) {
            return this.moveRight(callback);
        } else {
            throw 'internal error: unhandled code branch';
        }
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
        if (player.isDead || !player.drawable.show)
            return false;

        var self = this;

        var canMove = this.domainGridHelper.canPlayerMove(player, u, v);
        if (!canMove) {
            player.isDead = true;
            this.worldView.remove(function () {
                self.domainGridHelper.remove(player);
                var newPlayer = self.player = {
                    u: self.playerRespawn.u,
                    v: self.playerRespawn.v,
                    type: self.playerRespawn.type,
                    direction: self.playerRespawn.direction,
                    isDead: false
                };
                self.domainGridHelper.add(newPlayer);
                self.worldView.add(newPlayer, callback);
            });
            return true;
        }

        delete this.__conveyorBelt[player.type];

        function postMove() {
            var belt = self.domainGridHelper.isOnBelt(player);
            if (belt) {
                self.__conveyorBelt[player.type] = {
                    type: belt,
                    entity: player
                }
            }
            if (callback)
                callback();
        }

        if (canMove) {
            var change = this.domainGridHelper.movePlayer(player, u, v);
            this.worldView.move(change, postMove);
        }

        return true;
    };

    World.prototype.__moveBelts = function () {
        iterateEntries(this.__conveyorBelt, function (elem, key) {
            if (elem.entity.isDead) {
                delete this.__conveyorBelt[key];
                return;
            }
            if (elem.type == Tile.BELT_UP) {
                delete this.__conveyorBelt[key];
                this.moveTop();
            } else if (elem.type == Tile.BELT_UP_TURN_LEFT) {
                delete this.__conveyorBelt[key];
                this.moveTop();
                this.turnLeft();
            } else if (elem.type == Tile.BELT_UP_TURN_RIGHT) {
                delete this.__conveyorBelt[key];
                this.moveTop();
                this.turnRight()
            } else if (elem.type == Tile.BELT_DOWN) {
                delete this.__conveyorBelt[key];
                this.moveBottom();
            } else if (elem.type == Tile.BELT_DOWN_TURN_LEFT) {
                delete this.__conveyorBelt[key];
                this.moveBottom();
                this.turnLeft();
            } else if (elem.type == Tile.BELT_DOWN_TURN_RIGHT) {
                delete this.__conveyorBelt[key];
                this.moveBottom();
                this.turnRight();
            } else if (elem.type == Tile.BELT_LEFT) {
                delete this.__conveyorBelt[key];
                this.moveLeft();
            } else if (elem.type == Tile.BELT_LEFT_TURN_LEFT) {
                delete this.__conveyorBelt[key];
                this.moveLeft();
                this.turnLeft();
            } else if (elem.type == Tile.BELT_LEFT_TURN_RIGHT) {
                delete this.__conveyorBelt[key];
                this.moveLeft();
                this.turnRight();
            } else if (elem.type == Tile.BELT_RIGHT) {
                delete this.__conveyorBelt[key];
                this.moveRight();
            } else if (elem.type == Tile.BELT_RIGHT_TURN_LEFT) {
                delete this.__conveyorBelt[key];
                this.moveRight();
                this.turnLeft();
            } else if (elem.type == Tile.BELT_RIGHT_TURN_RIGHT) {
                delete this.__conveyorBelt[key];
                this.moveRight();
                this.turnRight();
            } else if (elem.type == Tile.BELT_TURN_RIGHT) {
                this.turnRight();
            } else if (elem.type == Tile.BELT_TURN_LEFT) {
                this.turnLeft();
            }
        }, this);
    };

    return World;
})(G.Tile, H5.iterateEntries);