G.WorldView = (function (Transition, wrap, Image, Height, changeSign, CallbackCounter, Tile, Math) {
    "use strict";

    function WorldView(stage, timer, gridViewHelper) {
        this.stage = stage;
        this.timer = timer;
        this.gridViewHelper = gridViewHelper;

        this.player = null;
        this.staticTiles = [];

        this.moveSpeed = 10;
        this.dropInSpeed = 30;
    }

    WorldView.prototype.preDestroy = function () {
        function removeElem(elem) {
            elem.remove();
        }

        removeElem(this.player);
        removeElem(this.defaultDrawable);
        this.staticTiles.forEach(removeElem);
    };

    WorldView.prototype.drawLevel = function (player, walls, backgroundTiles, callback) {

        this.defaultDrawable = this.gridViewHelper.create(1, 1, Image.FLOOR);
        this.defaultDrawable.show = false;

        var spacing = Transition.EASE_IN_SIN;
        var yFn = changeSign(Height.HALF);
        var self = this;

        var callbackCounter = new CallbackCounter(callback);

        function dropIn(drawable) {
            drawable.show = false;
            self.timer.doLater(function () {
                drawable.show = true;
                drawable.moveFrom(wrap(drawable, 'x'), yFn, [drawable]).setDuration(self.dropInSpeed)
                    .setSpacing(spacing).setCallback(callbackCounter.register());
            }, 1);

            return drawable;
        }

        this.player = dropIn(this.__createEntity(player, Image.PLAYER));
        this.player.setRotation(0);

        walls.forEach(function (wall) {
            this.staticTiles.push(dropIn(this.__createEntity(wall, Image.WALL)));
        }, this);

        backgroundTiles.forEach(function (tile) {
            var img = Image.FLOOR;
            if (tile.type == Tile.BELT_UP) {
                img = Image.BELT_UP;
            } else if (tile.type == Tile.BELT_UP_TURN_LEFT) {
                img = Image.BELT_UP_TURN_LEFT;
            } else if (tile.type == Tile.BELT_UP_TURN_RIGHT) {
                img = Image.BELT_UP_TURN_RIGHT;
            } else if (tile.type == Tile.BELT_DOWN) {
                img = Image.BELT_DOWN;
            } else if (tile.type == Tile.BELT_DOWN_TURN_LEFT) {
                img = Image.BELT_DOWN_TURN_LEFT;
            } else if (tile.type == Tile.BELT_DOWN_TURN_RIGHT) {
                img = Image.BELT_DOWN_TURN_RIGHT;
            } else if (tile.type == Tile.BELT_LEFT) {
                img = Image.BELT_LEFT;
            } else if (tile.type == Tile.BELT_LEFT_TURN_LEFT) {
                img = Image.BELT_LEFT_TURN_LEFT;
            } else if (tile.type == Tile.BELT_LEFT_TURN_RIGHT) {
                img = Image.BELT_LEFT_TURN_RIGHT;
            } else if (tile.type == Tile.BELT_RIGHT) {
                img = Image.BELT_RIGHT;
            } else if (tile.type == Tile.BELT_RIGHT_TURN_LEFT) {
                img = Image.BELT_RIGHT_TURN_LEFT;
            } else if (tile.type == Tile.BELT_RIGHT_TURN_RIGHT) {
                img = Image.BELT_RIGHT_TURN_RIGHT;
            } else if (tile.type == Tile.BELT_TURN_RIGHT) {
                img = Image.BELT_TURN_RIGHT;
            } else if (tile.type == Tile.BELT_TURN_LEFT) {
                img = Image.BELT_TURN_LEFT;
            }
            this.staticTiles.push(dropIn(this.__createStatic(tile, img, 0)));
        }, this);
    };

    WorldView.prototype.__createEntity = function (tile, img) {
        return this.gridViewHelper.create(tile.u, tile.v, img, this.defaultDrawable.data.height);
    };

    WorldView.prototype.__createStatic = function (tile, img, zIndex) {
        return this.gridViewHelper.createBackground(tile.u, tile.v, img, zIndex, this.defaultDrawable.data.height);
    };

    WorldView.prototype.move = function (changeSet, callback) {
        var path = this.gridViewHelper.move(this.player, changeSet.newU, changeSet.newV, this.moveSpeed, callback);
        path.setSpacing(Transition.EASE_OUT_EXPO);
    };

    WorldView.prototype.turnLeft = function (callback) {
        this.__turn(this.player, -Math.PI / 2, callback);
    };

    WorldView.prototype.turnRight = function (callback) {
        this.__turn(this.player, Math.PI / 2, callback);
    };

    WorldView.prototype.__turn = function (entity, angle, callback) {
        entity.rotateTo(entity.rotation + angle).setCallback(callback).setSpacing(Transition.EASE_OUT_EXPO)
            .setDuration(this.moveSpeed);
    };

    return WorldView;
})(H5.Transition, H5.wrap, G.Image, H5.Height, H5.changeSign, H5.CallbackCounter, G.Tile, Math);