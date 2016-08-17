window.onload = function () {
    "use strict";

    var app = H5.Bootstrapper.keyBoard().gamePad().lowRez(256, 256).build(G.MyGameResources, G.installMyScenes);
    app.start();
};