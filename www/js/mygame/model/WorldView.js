G.WorldView = (function (Transition, wrap, Image, CallbackCounter, Tile, Math, HitView, UI) {
    "use strict";

    function WorldView(stage, timer, gridViewHelper, shake) {
        this.stage = stage;
        this.timer = timer;
        this.gridViewHelper = gridViewHelper;
        this.__shake = shake;

        this.moveSpeed = 8;
        this.dropInSpeed = 30;
    }

    WorldView.prototype.preDestroy = function (tiles) {
        function removeElem(tile) {
            tile.entity.remove();
            tile.drawable.remove();
        }

        tiles.forEach(removeElem);
    };

    WorldView.prototype.drawLevel = function (players, homes, walls, backgroundTiles, callback) {
        var spacing = Transition.EASE_IN_SIN;
        var yFn = wrap(-UI.HEIGHT / 2);
        var self = this;

        var callbackCounter = new CallbackCounter(callback);

        function dropIn(pair) {
            pair.drawable.show = false;
            self.timer.doLater(function () {
                pair.drawable.show = true;
                pair.entity.moveFrom(wrap(pair.entity, 'x'), yFn).setDuration(self.dropInSpeed)
                    .setSpacing(spacing).setCallback(callbackCounter.register());
            }, 1);

            return pair;
        }

        players.forEach(function (player) {
            dropIn(this.__createEntity(player, player.type[1] == 0 ? Image.PLAYER_1 : Image.PLAYER_2));
        }, this);

        homes.forEach(function (home) {
            dropIn(this.__createEntity(home, home.type[1] == 0 ? Image.HOME_1 : Image.HOME_2));
        }, this);

        walls.forEach(function (wall) {
            dropIn(this.__createEntity(wall, Image.WALL));
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
            dropIn(this.__createStatic(tile, img, 0));
        }, this);
    };

    WorldView.prototype.__createEntity = function (tile, img) {
        var entity = this.gridViewHelper.create(tile.u, tile.v, img);
        entity.setRotation(0);
        tile.entity = entity;
        entity.show = false;

        var drawable = this.gridViewHelper.create(tile.u, tile.v, img);
        drawable.setRotation(0);
        tile.drawable = drawable;
        return {
            entity: entity,
            drawable: drawable
        };
    };

    WorldView.prototype.__createStatic = function (tile, img, zIndex) {
        var entity = this.gridViewHelper.createBackground(tile.u, tile.v, img, zIndex);
        tile.entity = entity;
        entity.show = false;
        var drawable = this.gridViewHelper.createBackground(tile.u, tile.v, img, zIndex);
        tile.drawable = drawable;
        return {
            entity: entity,
            drawable: drawable
        }
    };

    WorldView.prototype.move = function (entity, callback) {
        var path = this.gridViewHelper.move(entity.entity, entity.u, entity.v, this.moveSpeed, callback);
        path.setSpacing(Transition.EASE_OUT_EXPO);
    };

    WorldView.prototype.turnLeft = function (drawable, callback) {
        this.__turn(drawable, -Math.PI / 2, callback);
    };

    WorldView.prototype.turnRight = function (drawable, callback) {
        this.__turn(drawable, Math.PI / 2, callback);
    };

    WorldView.prototype.__turn = function (drawable, angle, callback) {
        drawable.rotateTo(drawable.rotation + angle).setCallback(callback).setSpacing(Transition.EASE_OUT_EXPO)
            .setDuration(this.moveSpeed);
    };

    WorldView.prototype.remove = function (entity, callback) {
        this.explode(entity.drawable, function () {
            entity.entity.remove();
            entity.drawable.remove();
            if (callback)
                callback();
        });
    };

    WorldView.prototype.add = function (entity, callback) {
        var spacing = Transition.EASE_IN_SIN;
        var yFn = wrap(-UI.HEIGHT / 2);
        var self = this;

        function dropIn(pair) {
            pair.drawable.show = false;
            self.timer.doLater(function () {
                pair.drawable.show = true;
                pair.entity.moveFrom(wrap(pair.entity, 'x'), yFn).setDuration(self.dropInSpeed)
                    .setSpacing(spacing).setCallback(callback);
            }, 1);

            return pair;
        }

        dropIn(this.__createEntity(entity, entity.type[1] == 0 ? Image.PLAYER_1 : Image.PLAYER_2));
    };

    WorldView.prototype.explode = function (drawable, callback) {
        // drawable.animate(Image.EXPLOSION, Image.EXPLOSION_FRAMES, false).setCallback(callback);
        this.__shake();
        this.timer.doLater(callback, 10);
    };

    WorldView.prototype.hit = function (drawable) {
        var hitView = new HitView(this.stage, this.timer, drawable);
        return hitView.hit();
    };

    return WorldView;
})(H5.Transition, H5.wrap, G.Image, H5.CallbackCounter, G.Tile, Math, G.HitView, G.UI);