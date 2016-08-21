G.createViewPort = (function (wrap, UI) {
    "use strict";

    function createViewPort(stage) {
        var viewPort = stage.createRectangle(false).setPosition(wrap(UI.WIDTH / 2), wrap(UI.HEIGHT / 2))
            .setWidth(wrap(UI.BOARD_WIDTH))
            .setHeight(wrap(UI.BOARD_HEIGHT));
        viewPort.show = false;
        return viewPort;
    }

    return createViewPort;
})(H5.wrap, G.UI);