window.onload = function () {
    "use strict";

    var app = H5.Bootstrapper.keyBoard().gamePad().build(G.MyGameResources, G.installMyScenes);
    app.start();
};