G.World = (function (Tile, iterateEntries, Direction) {
    "use strict";

    function World(worldView, domainGridHelper, endMap, pause, resume, players) {
        this.worldView = worldView;
        this.domainGridHelper = domainGridHelper;

        this.__endMap = endMap;
        this.__pause = pause;
        this.__resume = resume;

        this.__ticker = 0;
        this.__conveyorBelt = {};

        this.__players = players;
    }

    World.prototype.update = function () {
        if (this.__ticker % 60 === 0) {

            this.__moveBelts();

            this.__ticker = 0;
        }
        this.__ticker++;
    };

    World.prototype.init = function (callback) {
        var spawnTiles = this.domainGridHelper.getPlayers();
        spawnTiles.filter(hasNoSlot, this).forEach(remove, this);
        var players = spawnTiles.filter(hasSlot, this);
        players.forEach(init);
        players.forEach(setDirection);
        players.forEach(function (player) {
            this.__players.filter(isSame, player).forEach(function (playerControllerInfo) {
                playerControllerInfo.tileType = player.type;
            });
        }, this);

        this.spawnPoints = players.reduce(toSpawnDict, {});
        this.players = players.reduce(toDict, {});
        var homeBaseTiles = this.domainGridHelper.getHomes();
        homeBaseTiles.filter(hasNoSlot, this).forEach(remove, this);
        var homes = homeBaseTiles.filter(hasSlot, this);
        this.homes = homes.reduce(toHomeDict, {});

        var walls = this.domainGridHelper.getWalls();
        var backgroundTiles = this.domainGridHelper.getBackgroundTiles();

        this.worldView.drawLevel(players, homes, walls, backgroundTiles, callback);
    };

    World.prototype.turnLeft = function (player, callback) {
        if (player.isDead || !player.drawable.show)
            return false;

        var direction = player.direction;
        if (direction == Direction.UP) {
            player.direction = Direction.LEFT;
        } else if (direction == Direction.DOWN) {
            player.direction = Direction.RIGHT;
        } else if (direction == Direction.LEFT) {
            player.direction = Direction.DOWN;
        } else if (direction == Direction.RIGHT) {
            player.direction = Direction.UP;
        } else {
            throw 'internal error: unhandled code branch';
        }
        this.worldView.turnLeft(player.drawable, callback);
        return true;
    };

    World.prototype.turnRight = function (player, callback) {
        if (player.isDead || !player.drawable.show)
            return false;

        var direction = player.direction;
        if (direction == Direction.UP) {
            player.direction = Direction.RIGHT;
        } else if (direction == Direction.DOWN) {
            player.direction = Direction.LEFT;
        } else if (direction == Direction.LEFT) {
            player.direction = Direction.UP;
        } else if (direction == Direction.RIGHT) {
            player.direction = Direction.DOWN;
        } else {
            throw 'internal error: unhandled code branch';
        }
        this.worldView.turnRight(player.drawable, callback);
        return true;
    };

    World.prototype.move = function (player, callback) {
        var direction = player.direction;
        if (direction == Direction.UP) {
            return this.moveTop(player, callback);
        } else if (direction == Direction.DOWN) {
            return this.moveBottom(player, callback);
        } else if (direction == Direction.LEFT) {
            return this.moveLeft(player, callback);
        } else if (direction == Direction.RIGHT) {
            return this.moveRight(player, callback);
        } else {
            throw 'internal error: unhandled code branch';
        }
    };

    World.prototype.moveLeft = function (player, callback) {
        return this.__move(player, player.u - 1, player.v, callback);
    };

    World.prototype.moveRight = function (player, callback) {
        return this.__move(player, player.u + 1, player.v, callback);
    };

    World.prototype.moveTop = function (player, callback) {
        return this.__move(player, player.u, player.v - 1, callback);
    };

    World.prototype.moveBottom = function (player, callback) {
        return this.__move(player, player.u, player.v + 1, callback);
    };

    World.prototype.__move = function (player, u, v, callback) {
        if (player.isDead || !player.drawable.show)
            return false;

        var canMove = this.domainGridHelper.canPlayerMove(player, u, v);
        if (!canMove) {
            return this.__attack(player, callback);
        }

        delete this.__conveyorBelt[player.type];

        var self = this;

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
            this.domainGridHelper.movePlayer(player, u, v);
            this.worldView.move(player, postMove);
        }

        return true;
    };

    World.prototype.__attack = function (player, callback) {
        this.__remove(player, callback);

        var neighbor = this.domainGridHelper.getNeighbor(player);
        if (neighbor.type[0] == Tile.HOME) {
            var isOver = this.__hit(this.homes[neighbor.type]);
            if (isOver)
                this.__pause();

        } else if (neighbor.type[0] == Tile.PLAYER) {
            this.__remove(this.players[neighbor.type]);
        }
        return true;
    };

    World.prototype.__hit = function (home) {
        home.lives--;
        var hitPromise = this.worldView.hit(home.drawable);

        if (home.lives <= 0) {
            if (hitPromise.isOver) {
                this.__endMap();
            } else {
                hitPromise.callback = this.__endMap;
            }
            return true;
        }
        return false;
    };

    World.prototype.__respawn = function (player, callback) {
        player.u = this.spawnPoints[player.type].u;
        player.v = this.spawnPoints[player.type].v;
        player.direction = this.spawnPoints[player.type].direction;
        player.isDead = false;

        this.domainGridHelper.add(player);
        this.worldView.add(player, callback);
    };

    World.prototype.__remove = function (player, callback) {
        player.isDead = true;
        this.domainGridHelper.remove(player);
        this.worldView.remove(player.drawable, this.__respawn.bind(this, player, callback));
    };

    World.prototype.__moveBelts = function () {
        iterateEntries(this.__conveyorBelt, function (beltItem, key) {
            if (beltItem.entity.isDead) {
                delete this.__conveyorBelt[key];
                return;
            }
            if (beltItem.type == Tile.BELT_UP) {
                delete this.__conveyorBelt[key];
                this.moveTop(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_UP_TURN_LEFT) {
                delete this.__conveyorBelt[key];
                this.moveTop(beltItem.entity);
                this.turnLeft(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_UP_TURN_RIGHT) {
                delete this.__conveyorBelt[key];
                this.moveTop(beltItem.entity);
                this.turnRight(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_DOWN) {
                delete this.__conveyorBelt[key];
                this.moveBottom(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_DOWN_TURN_LEFT) {
                delete this.__conveyorBelt[key];
                this.moveBottom(beltItem.entity);
                this.turnLeft(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_DOWN_TURN_RIGHT) {
                delete this.__conveyorBelt[key];
                this.moveBottom(beltItem.entity);
                this.turnRight(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_LEFT) {
                delete this.__conveyorBelt[key];
                this.moveLeft(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_LEFT_TURN_LEFT) {
                delete this.__conveyorBelt[key];
                this.moveLeft(beltItem.entity);
                this.turnLeft(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_LEFT_TURN_RIGHT) {
                delete this.__conveyorBelt[key];
                this.moveLeft(beltItem.entity);
                this.turnRight(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_RIGHT) {
                delete this.__conveyorBelt[key];
                this.moveRight(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_RIGHT_TURN_LEFT) {
                delete this.__conveyorBelt[key];
                this.moveRight(beltItem.entity);
                this.turnLeft(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_RIGHT_TURN_RIGHT) {
                delete this.__conveyorBelt[key];
                this.moveRight(beltItem.entity);
                this.turnRight(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_TURN_RIGHT) {
                this.turnRight(beltItem.entity);
            } else if (beltItem.type == Tile.BELT_TURN_LEFT) {
                this.turnLeft(beltItem.entity);
            }
        }, this);
    };

    function isSame(playerControllerInfo) {
        return this.type[1] == playerControllerInfo.slot;
    }

    function hasSlot(player) {
        return this.__players.some(isSame, player);
    }

    function hasNoSlot(player) {
        return !this.__players.some(isSame, player);
    }

    /** @this World */
    function remove(player) {
        this.domainGridHelper.remove(player);
    }

    function toDict(dict, player) {
        dict[player.type] = player;
        return dict;
    }

    function setDirection(player) {
        var direction = player.type[2];
        if (direction == 'U') {
            player.direction = Direction.UP;
        } else if (direction == 'D') {
            player.direction = Direction.DOWN;
        } else if (direction == 'L') {
            player.direction = Direction.LEFT;
        } else if (direction == 'R') {
            player.direction = Direction.RIGHT;
        }
    }

    function init(player) {
        player.isDead = false;
    }

    function toSpawnDict(dict, player) {
        dict[player.type] = {
            u: player.u,
            v: player.v,
            type: player.type,
            direction: player.direction
        };
        return dict
    }

    function toHomeDict(dict, home) {
        dict[home.type] = home;
        home.lives = 3;
        return dict;
    }

    return World;
})(G.Tile, H5.iterateEntries, G.Direction);