G.installMyScenes = (function (Scenes, Game) {
    "use strict";

    function installMyScenes(sceneServices) {
        // create your scenes and add them to the scene manager

        var scenes = new Scenes();

        scenes.add(function (next) {
            var game = new Game(sceneServices, sceneServices.maps['map_test']);
            game.postConstruct();

        });

        return scenes;
    }

    return installMyScenes;
})(H5.Scenes, G.Game);