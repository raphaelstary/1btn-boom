G.Players = (function (Direction) {
    "use strict";

    function isSame(playerControllerInfo) {
        return this.type[1] == playerControllerInfo.slot;
    }

    /** @this World */
    function hasSlot(player) {
        return this.__players.some(isSame, player);
    }

    /** @this World */
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
        home.lives = 3;
        dict[home.type].push(home);

        return dict;
    }

    /** @this World */
    function updatePosition(tile) {
        this.camera.calcScreenPosition(tile.entity, tile.drawable);
    }

    function setType(playerControllerInfo) {
        playerControllerInfo.tileType = this.type;
    }

    /** @this World */
    function setTileType(player) {
        this.__players.filter(isSame, player).forEach(setType.bind(player));
    }

    return {
        isSame: isSame,
        hasSlot: hasSlot,
        hasNoSlot: hasNoSlot,
        remove: remove,
        toDict: toDict,
        setDirection: setDirection,
        init: init,
        toSpawnDict: toSpawnDict,
        toHomeDict: toHomeDict,
        updatePosition: updatePosition,
        setTileType: setTileType
    };
})(G.Direction);