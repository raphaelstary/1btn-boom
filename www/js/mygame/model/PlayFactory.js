G.PlayFactory = (function (Grid, GridHelper, FixRezGridViewHelper, DomainGridHelper, World, WorldView,
    PlayerController) {
    "use strict";

    return {
        createWorld: function (stage, timer, device, level, topOffset, bottomOffset, endMap, pause, resume, shaker) {
            var grid = new Grid(level);
            var gridHelper = new GridHelper(grid, grid.xTiles, grid.yTiles);
            var gridViewHelper = new FixRezGridViewHelper(stage, 256, 256, grid.xTiles, grid.yTiles, topOffset, bottomOffset);
            var domainGridHelper = new DomainGridHelper(gridHelper, grid);
            var worldView = new WorldView(stage, timer, gridViewHelper, shaker);
            return new World(worldView, domainGridHelper, endMap, pause, resume);
        },
        createPlayerController: function (world) {
            return new PlayerController(world);
        }
    };
})(H5.Grid, H5.GridHelper, H5.FixRezGridViewHelper, G.DomainGridHelper, G.World, G.WorldView, G.PlayerController);