G.DomainGridHelper = (function (Tile, Strings) {
    "use strict";

    function DomainGridHelper(gridHelper, grid) {
        this.gridHelper = gridHelper;
        this.grid = grid;
    }

    DomainGridHelper.prototype.getBackgroundTiles = function () {
        return this.gridHelper.getTiles(Tile.BACKGROUND, true);
    };

    DomainGridHelper.prototype.getWalls = function () {
        return this.gridHelper.getTiles(Tile.WALL);
    };

    DomainGridHelper.prototype.getPlayer = function () {
        return this.gridHelper.getTiles(Tile.PLAYER)[0];
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
        return backgroundTileType && Strings.startsWidth(backgroundTileType, Tile.BACKGROUND);
    };

    DomainGridHelper.prototype.movePlayer = function (player, u, v) {
        this.grid.set(player.u, player.v, Tile.EMPTY);
        this.grid.set(u, v, player.type);
        var change = {
            newU: u,
            newV: v,
            tile: player.type
        };
        player.u = u;
        player.v = v;

        return change;
    };

    DomainGridHelper.prototype.isPlayerOnEvent = function (entity) {
        var tile = this.grid.getEvent(entity.u, entity.v);
        if (tile && Strings.startsWidth(tile, Tile.EVENT)) {
            return tile;
        }
        return false;
    };

    DomainGridHelper.prototype.remove = function (npc) {
        this.grid.set(npc.u, npc.v, Tile.EMPTY);
    };

    DomainGridHelper.prototype.add = function (npc) {
        this.grid.set(npc.u, npc.v, npc.type);
    };

    return DomainGridHelper;
})(G.Tile, H5.Strings);