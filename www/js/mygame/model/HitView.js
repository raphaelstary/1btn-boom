G.HitView = (function (wrap, Transition, Image) {
    "use strict";

    var Z_INDEX = 6;

    function HitView(stage, timer, drawable) {
        this.stage = stage;
        this.timer = timer;
        this.drawable = drawable;
        this.fadeInSpeed = 2;
        this.fadeOutSpeed = 4;
    }

    HitView.prototype.hit = function () {
        var white = this.stage.createImage(Image.WHITE)
            .setPosition(wrap(this.drawable.x), wrap(this.drawable.y)).setZIndex(Z_INDEX);
        var black = this.stage.createImage(Image.BLACK)
            .setPosition(wrap(this.drawable.x), wrap(this.drawable.y)).setZIndex(Z_INDEX + 1).setAlpha(0);

        black.opacityPattern([
            {
                value: 1,
                duration: this.fadeInSpeed,
                easing: Transition.LINEAR
            }, {
                value: 0,
                duration: this.fadeOutSpeed,
                easing: Transition.LINEAR
            }
        ], true);

        this.timer.doLater(function () {
            white.remove();
            black.remove();
            if (callback)
                callback();
        }, 30);

        var promise = {
            isOver: false,
            callback: undefined
        };

        function callback() {
            promise.isOver = true;
            if (promise.callback)
                promise.callback();
        }

        return promise;
    };

    return HitView;
})(H5.wrap, H5.Transition, G.Image);