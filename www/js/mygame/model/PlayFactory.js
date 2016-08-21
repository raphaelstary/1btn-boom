G.PlayFactory = (function (Grid, GridHelper, FixRezGridViewHelper, DomainGridHelper, World, WorldView, PlayerController,
    UI) {
    "use strict";

    return {
        createWorld: function (stage, timer, device, level, topOffset, bottomOffset, endMap, pause, resume, shake,
            players, camera) {
            var grid = new Grid(level);
            var gridHelper = new GridHelper(grid, grid.xTiles, grid.yTiles);
            var gridViewHelper = new FixRezGridViewHelper(stage, grid.xTiles, grid.yTiles, UI.TILE_LENGTH, topOffset, bottomOffset);
            var domainGridHelper = new DomainGridHelper(gridHelper, grid);
            var worldView = new WorldView(stage, timer, gridViewHelper, shake);
            return new World(worldView, domainGridHelper, endMap, pause, resume, players, camera);
        },
        createPlayerController: function (world, player) {
            return new PlayerController(world, player, world.players[player.tileType]);
        }
    };
})(H5.Grid, H5.GridHelper, H5.FixRezGridViewHelper, G.DomainGridHelper, G.World, G.WorldView, G.PlayerController, G.UI);