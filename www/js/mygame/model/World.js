G.World = (function (Tile, iterateEntries, Direction, Players, Date, parseInt) {
    "use strict";

    function World(worldView, domainGridHelper, endMap, pause, resume, players, camera, hearts) {
        this.worldView = worldView;
        this.domainGridHelper = domainGridHelper;

        this.__endMap = endMap;
        this.__pause = pause;
        this.__resume = resume;

        this.__ticker = 0;
        this.__conveyorBelt = {};

        this.__players = players;
        this.camera = camera;

        this.hearts = hearts;
    }

    World.prototype.update = function () {
        if (this.__ticker % 30 === 0) {

            this.__moveBelts();

            this.__ticker = 0;
        }
        this.__ticker++;
    };

    World.prototype.updateCamera = function () {
        this.tiles.forEach(Players.updatePosition, this);
    };

    World.prototype.init = function (callback) {
        var spawnTiles = this.domainGridHelper.getPlayers();
        spawnTiles.filter(Players.hasNoSlot, this).forEach(Players.remove, this);
        var players = spawnTiles.filter(Players.hasSlot, this);
        players.forEach(Players.init);
        players.forEach(Players.setDirection);
        players.forEach(Players.setTileType, this);

        this.spawnPoints = players.reduce(Players.toSpawnDict, {});
        this.players = players.reduce(Players.toDict, {});
        var homeBaseTiles = this.domainGridHelper.getHomes();
        homeBaseTiles.filter(Players.hasNoSlot, this).forEach(Players.remove, this);
        var homes = homeBaseTiles.filter(Players.hasSlot, this);
        this.homes = homes.reduce(Players.toHomeDict, {
            H0: [],
            H1: []
        });

        var walls = this.domainGridHelper.getWalls();
        var backgroundTiles = this.domainGridHelper.getBackgroundTiles();

        this.tiles = [];
        this.tiles.push.apply(this.tiles, players);
        this.tiles.push.apply(this.tiles, homes);
        this.tiles.push.apply(this.tiles, walls);
        this.tiles.push.apply(this.tiles, backgroundTiles);

        this.worldView.drawLevel(players, homes, walls, backgroundTiles, callback);
    };

    World.prototype.preDestroy = function () {
        this.worldView.preDestroy(this.tiles);
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
                    time: Date.now(),
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
        var neighbor = this.domainGridHelper.getNeighbor(player);
        var isHome = neighbor.type[0] == Tile.HOME;

        this.__remove(player, isHome, callback);

        if (isHome) {
            var isOver = this.__hit(this.homes[neighbor.type]);
            if (isOver)
                this.__pause();

        } else if (neighbor.type[0] == Tile.PLAYER) {
            this.__remove(this.players[neighbor.type], isHome, undefined, true);
        }
        return true;
    };

    World.prototype.__hitHome = function (home, index) {
        home.lives--;
        if (index !== 0)
            this.worldView.hit(home.drawable);
    };

    World.prototype.__hit = function (homes) {

        homes.forEach(this.__hitHome, this);

        var home = homes[0];

        if (home.type[1] == 0) {
            this.hearts.p1[home.lives + 1].remove();
        } else {
            this.hearts.p2[home.lives + 1].remove();
        }

        var hitPromise = this.worldView.hit(home.drawable);

        if (home.lives <= 0) {
            if (hitPromise.isOver) {
                if (home.type[1] == 0) {
                    this.__endMap('p2');
                } else {
                    this.__endMap('p1');
                }
            } else {
                var self = this;
                hitPromise.callback = function () {
                    if (home.type[1] == 0) {
                        self.__endMap('p2');
                    } else {
                        self.__endMap('p1');
                    }
                }
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

    World.prototype.__remove = function (player, isHome, callback, silentRemove) {
        player.isDead = true;
        player.lastDeath = Date.now() + 16;
        this.domainGridHelper.remove(player);
        if (silentRemove) {
            this.worldView.silentRemove(player, this.__respawn.bind(this, player, callback));
        } else {
            var type = player.type[1];
            this.worldView.remove(player, isHome, 'p' + (parseInt(type) + 1),
                this.__respawn.bind(this, player, callback));
        }
    };

    World.prototype.__moveBelts = function () {
        iterateEntries(this.__conveyorBelt, this.__moveBelt, this);
    };

    World.prototype.__moveBelt = function (beltItem, key) {
        if (beltItem.entity.isDead || beltItem.time <= beltItem.entity.lastDeath) {
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
    };

    return World;
})(G.Tile, H5.iterateEntries, G.Direction, G.Players, Date, parseInt);