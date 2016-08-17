G.resolveAtlasPaths = (function (ATLAS_BASE_NAME, GFX_PATH, DATA_PATH, GFX_FORMAT, DATA_FORMAT) {
    "use strict";

    var atlases = [
        {
            size: 256,
            count: 1
        }
    ];

    function getFileName(i, size) {
        return ATLAS_BASE_NAME + '_' + i;
    }

    function getFileNames(size, count) {
        var names = [];
        for (var i = 0; i < count; i++) {
            names.push(getFileName(i, size));
        }

        return names;
    }

    function resolveAtlasPaths(width, height) {
        var size = width > height ? width : height;
        for (var i = 0; i < atlases.length; i++) {
            var atlas = atlases[i];
            if (size <= atlas.size) {
                return {
                    paths: getFileTypedNames(getFileNames(atlas.size, atlas.count)),
                    defaultSize: atlas.size
                };
            }
        }

        var last = atlases[atlases.length - 1];
        return {
            paths: getFileTypedNames(getFileNames(last.size, last.count)),
            defaultSize: last.size
        };
    }

    function getFileTypedNames(names) {
        var aggregatedPaths = [];

        names.forEach(function (name) {
            aggregatedPaths.push({
                gfx: GFX_PATH + name + GFX_FORMAT,
                data: DATA_PATH + name + DATA_FORMAT
            });
        });

        return aggregatedPaths;
    }

    return resolveAtlasPaths;
})(G.File.ATLAS_BASE_NAME, G.File.GFX_PATH, G.File.DATA_PATH, G.File.GFX_FORMAT, G.File.DATA_FORMAT);