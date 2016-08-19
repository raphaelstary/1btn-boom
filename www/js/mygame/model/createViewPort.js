G.createViewPort = (function (wrap) {
    "use strict";

    function createViewPort(stage) {
        var viewPort = stage.createRectangle(false).setPosition(wrap(128), wrap(128)).setWidth(wrap(256))
            .setHeight(wrap(256));
        viewPort.show = false;
        return viewPort;
    }

    return createViewPort;
})(H5.wrap);