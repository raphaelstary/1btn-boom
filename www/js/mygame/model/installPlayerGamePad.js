G.installPlayerGamePad = (function (Event) {
    "use strict";

    function installPlayerGamePad(events, playerController) {
        var actionPressed = false;

        return events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (gamePad.index != playerController.player.slot)
                return;
            if (gamePad.isAPressed() && !actionPressed) {
                actionPressed = true;
                playerController.handleAction();
            } else if (!gamePad.isAPressed() && actionPressed) {
                actionPressed = false;
            }
        });
    }

    return installPlayerGamePad;
})(H5.Event);