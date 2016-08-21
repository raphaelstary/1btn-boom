G.installMyScenes = (function (Scenes, Game, MVVMScene, Scene, Start) {
    "use strict";

    function installMyScenes(services) {
        // create your scenes and add them to the scene manager

        var scenes = new Scenes();

        var start = new Start(services);
        var startScene = new MVVMScene(services, services.scenes[Scene.START], start, Scene.START);

        scenes.add(startScene.show.bind(startScene));

        var game = new Game(services, services.maps['map_test']);
        var gameScene = new MVVMScene(services, services.scenes[Scene.GAME], game, Scene.GAME);

        scenes.add(gameScene.show.bind(gameScene));

        return scenes;
    }

    return installMyScenes;
})(H5.Scenes, G.Game, H5.MVVMScene, G.Scene, G.Start);