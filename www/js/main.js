window.onload = function () {
    "use strict";

    var app = H5.Bootstrapper.keyBoard().gamePad().lowRez(G.UI.WIDTH, G.UI.HEIGHT).responsive()
        .build(G.MyGameResources, G.installMyScenes);
    app.start();
};