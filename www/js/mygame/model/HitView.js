G.HitView = (function (wrap, Transition, Image) {
    "use strict";

    function HitView(stage, timer, drawable) {
        this.stage = stage;
        this.timer = timer;
        this.drawable = drawable;
        this.fadeInSpeed = 2;
        this.fadeOutSpeed = 4;
    }

    HitView.prototype.hit = function () {
        var oldGfx = this.drawable.data;
        this.drawable.data = this.stage.getGraphic(Image.WHITE);

        this.drawable.opacityPattern([
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

        var self = this;
        this.timer.doLater(function () {
            self.drawable.pause();
            self.drawable.setAlpha(1);
            self.drawable.data = oldGfx;
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