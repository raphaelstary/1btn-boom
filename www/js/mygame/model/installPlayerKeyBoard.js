G.installPlayerKeyBoard = (function (Event, Key) {
    "use strict";

    function installPlayerKeyBoard(events, playerController) {
        var actionPressed = false;

        return events.subscribe(Event.KEY_BOARD, function (keyBoard) {

            if (keyBoard[Key.SPACE] && !actionPressed) {
                actionPressed = true;
                playerController.handleAction();
            } else if (!keyBoard[Key.SPACE] && actionPressed) {
                actionPressed = false;
            }
        });
    }

    return installPlayerKeyBoard;
})(H5.Event, H5.Key);