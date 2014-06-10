var StartingPosition = (function (Transition) {
    "use strict";

    function StartingPosition(stage, sceneStorage) {
        this.stage = stage;
        this.sceneStorage = sceneStorage;
    }

    StartingPosition.prototype.show = function (nextScene) {
        var self = this;
        var zero = 'num/numeral0';
        var spacing = Transition.EASE_IN_OUT_ELASTIC;
        var speed = 60;
        var yTop = 480 / 20;
        var yBottom = yTop * 19;
        var lifeX = 320 / 10;
        var lifeOneDrawable = self.stage.moveFreshLater(lifeX - lifeX * 2, yTop, 'playerlife', lifeX, yTop, speed, spacing, 20);
        var lifeTwoDrawable = self.stage.moveFreshLater(lifeX - lifeX * 2, yTop, 'playerlife', lifeX + 40, yTop, speed, spacing, 15);
        var lifeThreeDrawable = self.stage.moveFreshLater(lifeX - lifeX * 2, yTop, 'playerlife', lifeX + 80, yTop, speed, spacing, 10);
        var energyX = 320 / 5 + 5;
        var energyBarDrawable = self.stage.moveFresh(energyX - energyX * 2, yBottom, 'energy_bar_full', energyX, yBottom, speed, spacing);
        var digitX = 320 / 3 * 2 + 10;
        var firstDigit = digitX + 75;
        var firstDigitDrawable = self.stage.moveFreshLater(firstDigit + 60, yTop, zero, firstDigit, yTop, speed, spacing, 10);
        var secondDigit = digitX + 50;
        var secondDigitDrawable = self.stage.moveFreshLater(secondDigit + 60, yTop, zero, secondDigit, yTop, speed, spacing, 13);
        var thirdDigit = digitX + 25;
        var thirdDigitDrawable = self.stage.moveFreshLater(thirdDigit + 60, yTop, zero, thirdDigit, yTop, speed, spacing, 17);
        var fourthDigitDrawable = self.stage.moveFreshLater(digitX + 60, yTop, zero, digitX, yTop, speed, spacing, 12, false, function () {

            var lifeDrawablesDict = {1: lifeOneDrawable, 2: lifeTwoDrawable, 3: lifeThreeDrawable};
            var countDrawables = [firstDigitDrawable, secondDigitDrawable, thirdDigitDrawable, fourthDigitDrawable];

            self.next(nextScene, energyBarDrawable, lifeDrawablesDict, countDrawables)
        });
    };

    StartingPosition.prototype.next = function (nextScene, energyBarDrawable, lifeDrawablesDict, countDrawables) {
        this.sceneStorage.energyBar = energyBarDrawable;
        this.sceneStorage.lives = lifeDrawablesDict;
        this.sceneStorage.counts = countDrawables;

        nextScene();
    };

    return StartingPosition;
})(Transition);