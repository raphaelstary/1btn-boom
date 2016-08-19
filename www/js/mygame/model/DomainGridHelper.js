G.DomainGridHelper = (function (Tile, Strings, Direction) {
    "use strict";

    function DomainGridHelper(gridHelper, grid) {
        this.gridHelper = gridHelper;
        this.grid = grid;
    }

    DomainGridHelper.prototype.getBackgroundTiles = function () {
        var tiles = this.gridHelper.getTiles(Tile.BACKGROUND, true);
        tiles.push.apply(tiles, this.gridHelper.getTiles(Tile.BELT, true));
        return tiles;
    };

    DomainGridHelper.prototype.getWalls = function () {
        return this.gridHelper.getTiles(Tile.WALL);
    };

    DomainGridHelper.prototype.getPlayers = function () {
        return this.gridHelper.getTiles(Tile.PLAYER);
    };

    DomainGridHelper.prototype.getHomes = function () {
        return this.gridHelper.getTiles(Tile.HOME);
    };

    DomainGridHelper.prototype.canPlayerMove = function (player, u, v) {
        var isNeighborOfPlayer = this.gridHelper.isNeighbor(player.u, player.v, u, v);
        if (isNeighborOfPlayer)
            return this.__isMovable(u, v);
        return false;
    };

    DomainGridHelper.prototype.__isMovable = function (u, v) {
        var tileType = this.grid.get(u, v);
        return tileType === Tile.EMPTY && this.__isTypeMovable(this.grid.getBackground(u, v));
    };

    DomainGridHelper.prototype.__isTypeMovable = function (backgroundTileType) {
        return backgroundTileType && (Strings.startsWidth(backgroundTileType, Tile.BACKGROUND) ||
            Strings.startsWidth(backgroundTileType, Tile.BELT));
    };

    DomainGridHelper.prototype.movePlayer = function (player, u, v) {
        this.grid.set(player.u, player.v, Tile.EMPTY);
        this.grid.set(u, v, player.type);

        player.u = u;
        player.v = v;
    };

    DomainGridHelper.prototype.isOnBelt = function (entity) {
        var tile = this.grid.getBackground(entity.u, entity.v);
        if (tile && Strings.startsWidth(tile, Tile.BELT)) {
            return tile;
        }
        return false;
    };

    DomainGridHelper.prototype.remove = function (entity) {
        this.grid.set(entity.u, entity.v, Tile.EMPTY);
    };

    DomainGridHelper.prototype.add = function (entity) {
        this.grid.set(entity.u, entity.v, entity.type);
    };

    DomainGridHelper.prototype.getNeighbor = function (player) {
        var direction = player.direction;
        if (direction == Direction.UP) {
            return this.gridHelper.getTopNeighbor(player.u, player.v);
        } else if (direction == Direction.DOWN) {
            return this.gridHelper.getBottomNeighbor(player.u, player.v);
        } else if (direction == Direction.LEFT) {
            return this.gridHelper.getLeftNeighbor(player.u, player.v);
        } else if (direction == Direction.RIGHT) {
            return this.gridHelper.getRightNeighbor(player.u, player.v);
        } else {
            throw 'internal error: unhandled code branch';
        }
    };

    return DomainGridHelper;
})(G.Tile, H5.Strings, G.Direction);