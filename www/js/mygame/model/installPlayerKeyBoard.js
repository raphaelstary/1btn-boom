G.installPlayerKeyBoard = (function (Event) {
    "use strict";

    function installPlayerKeyBoard(events, playerController) {
        var actionPressed = false;

        return events.subscribe(Event.KEY_BOARD, function (keyBoard) {

            if (keyBoard[playerController.player.key] && !actionPressed) {
                actionPressed = true;
                playerController.handleAction();
            } else if (!keyBoard[playerController.player.key] && actionPressed) {
                actionPressed = false;
            }
        });
    }

    return installPlayerKeyBoard;
})(H5.Event);