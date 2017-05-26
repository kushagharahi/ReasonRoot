var RRDisplay = (function () {
    function RRDisplay(claimElement) {
        this.mainId = claimElement.getAttribute('stmtId');
        this.settleIt = new SettleIt();
        this.claimsList = JSON.parse(claimElement.getAttribute('dict'));
        this.scoresDict = createDict(this.claimsList);
        ////restore saved dictionairy
        //let potentialDict = localStorage.getItem("rr_" + this.mainId);
        // //remove saving
        // if (potentialDict) {
        //     this.scoresDict = JSON.parse(potentialDict);
        //     this.mainScore = this.scoresDict[this.mainId];
        //     this.claimsList = [];
        //     for (let scoreId in this.scoresDict) {
        //         this.claimsList.push(this.scoresDict[scoreId].claim);
        //     }
        //     this.settleIt.calculate(this.scoresDict[this.mainId], this.scoresDict);
        // } else {
        this.mainScore = this.scoresDict[this.mainId];
        this.settleIt.calculate(this.mainScore, this.scoresDict);
        this.clearDisplayState();
        this.setClasses();
        //}
        alert("ran");
    }
    RRDisplay.prototype.clearDisplayState = function () {
        for (var scoreId in this.scoresDict) {
            if (this.scoresDict.hasOwnProperty(scoreId)) {
                this.scoresDict[scoreId].displayState = DisplayState.None;
            }
        }
    };
    RRDisplay.prototype.setClasses = function () {
        this.setClassesLoop(this.mainScore);
    };
    RRDisplay.prototype.setClassesLoop = function (score, parent) {
        for (var _i = 0, _a = score.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            var childScore = this.scoresDict[childId];
            //process the children first
            this.setClassesLoop(childScore, score);
            if (childScore.displayState == DisplayState.Selected)
                score.displayState = DisplayState.Parent;
            if (childScore.displayState == DisplayState.Ancestor || childScore.displayState == DisplayState.Parent)
                score.displayState = DisplayState.Ancestor;
            if (score.displayState == DisplayState.Selected)
                childScore.displayState = DisplayState.Child;
        }
    };
    return RRDisplay;
}());
//# sourceMappingURL=rrDisplay.js.map