G.WorldView = (function (Transition, wrap, Image, Height, changeSign, CallbackCounter, Tile, Math, HitView) {
    "use strict";

    function WorldView(stage, timer, gridViewHelper, screenShaker) {
        this.stage = stage;
        this.timer = timer;
        this.gridViewHelper = gridViewHelper;
        this.shaker = screenShaker;

        this.drawables = [];

        this.moveSpeed = 8;
        this.dropInSpeed = 30;
    }

    WorldView.prototype.preDestroy = function () {
        function removeElem(elem) {
            elem.remove();
        }

        this.drawables.forEach(removeElem);
    };

    WorldView.prototype.drawLevel = function (players, homes, walls, backgroundTiles, callback) {
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

        players.forEach(function (player) {
            this.drawables.push(dropIn(this.__createEntity(player, Image.PLAYER)));
        }, this);

        homes.forEach(function (home) {
            this.drawables.push(dropIn(this.__createEntity(home, Image.HOME)));
        }, this);

        walls.forEach(function (wall) {
            this.drawables.push(dropIn(this.__createEntity(wall, Image.WALL)));
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
            this.drawables.push(dropIn(this.__createStatic(tile, img, 0)));
        }, this);

        this.drawables.forEach(function (drawable) {
            this.shaker.add(drawable);
        }, this);
    };

    WorldView.prototype.__createEntity = function (tile, img) {
        var drawable = this.gridViewHelper.create(tile.u, tile.v, img);
        drawable.setRotation(0);
        tile.drawable = drawable;
        return drawable;
    };

    WorldView.prototype.__createStatic = function (tile, img, zIndex) {
        return this.gridViewHelper.createBackground(tile.u, tile.v, img, zIndex);
    };

    WorldView.prototype.move = function (entity, callback) {
        var path = this.gridViewHelper.move(entity.drawable, entity.u, entity.v, this.moveSpeed, callback);
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

    WorldView.prototype.remove = function (drawable, callback) {
        var self = this;
        this.explode(drawable, function () {
            self.shaker.remove(drawable);
            drawable.remove();
            if (callback)
                callback();
        });
    };

    WorldView.prototype.add = function (entity, callback) {
        var spacing = Transition.EASE_IN_SIN;
        var yFn = changeSign(Height.HALF);
        var self = this;

        function dropIn(drawable) {

            function addLater() {
                if (self.shaker.shaking) {
                    self.timer.doLater(addLater, 10);
                    return;
                }
                self.shaker.add(drawable);
                if (callback)
                    callback();
            }

            function afterDropIn() {
                self.timer.doLater(addLater, 10);
            }

            drawable.show = false;
            self.timer.doLater(function () {
                drawable.show = true;
                drawable.moveFrom(wrap(drawable, 'x'), yFn, [drawable]).setDuration(self.dropInSpeed)
                    .setSpacing(spacing).setCallback(afterDropIn);
            }, 1);

            return drawable;
        }

        dropIn(this.__createEntity(entity, Image.PLAYER));
    };

    WorldView.prototype.explode = function (entity, callback) {
        // entity.drawable.animate(Image.EXPLOSION, Image.EXPLOSION_FRAMES, false).setCallback(callback);
        this.shaker.startBigShake();
        this.timer.doLater(callback, 10);
    };

    WorldView.prototype.hit = function (drawable) {
        var hitView = new HitView(this.stage, this.timer, drawable, this.shaker);
        return hitView.hit();
    };

    return WorldView;
})(H5.Transition, H5.wrap, G.Image, H5.Height, H5.changeSign, H5.CallbackCounter, G.Tile, Math, G.HitView);