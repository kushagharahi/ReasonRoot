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
        this.render = hyperHTML.bind(claimElement);
        this.update();
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
    RRDisplay.prototype.update = function () {
        //save(dict[mainId], dict);
        (_a = ["\n        <div class=\"", "\">\n            <div>", "</div>\n        </div>"], _a.raw = ["\n        <div class=\"", "\">\n            <div>", "</div>\n        </div>"], this.render(_a, 'rr ', this.renderNode(this.scoresDict[this.mainId], { open: true })));
        var _a;
    };
    RRDisplay.prototype.renderNode = function (score, parent) {
        var _this = this;
        var claim = score.claim;
        var wire = hyperHTML.wire(score);
        var result = (_a = ["\n                <li id=\"", "\" >\n                    <div class=\"claimPad\" >\n                        <div class=\"", "\" >\n                            <div class=\"innerClaim\">\n                                <span class=\"score\" > ", "</span>\n\n                                ", "\n                                ", "\n                                <a target=\"_blank\" href=\"", "\" > \n                                    <span class=\"citation\">", "</span>\n                                </a>\n\n                             </div>\n                        </div>\n                        \n                        <div class=\"", "\">\n                            <div class=\"", "\">\n                            <div class=\"childIndicatorInner\">\n                            ", " more\n                            </div>\n                            </div>\n                        </div>\n                    </div>  \n                      \n                    <ul>", "</ul>\n                </li>"], _a.raw = ["\n                <li id=\"", "\" >\n                    <div class=\"claimPad\" >\n                        <div class=\"", "\" >\n                            <div class=\"innerClaim\">\n                                <span class=\"score\" > ",
            "</span>\n\n                                ", "\n                                ", "\n                                <a target=\"_blank\" href=\"", "\" > \n                                    <span class=\"citation\">", "</span>\n                                </a>\n\n                             </div>\n                        </div>\n                        \n                        <div class=\"", "\">\n                            <div class=\"", "\">\n                            <div class=\"childIndicatorInner\">\n                            ", " more\n                            </div>\n                            </div>\n                        </div>\n                    </div>  \n                      \n                    <ul>",
            "</ul>\n                </li>"], wire(_a, claim.id, "claim " + (claim.isProMain ? 'pro' : 'con') + (claim.disabled ? ' disabled ' : '') + (claim.childIds.length > 0 && !score.open ? ' shadow' : ''), (score.generation == 0 ?
            Math.round(score.animatedWeightedPercentage * 100) + '%' :
            Math.floor(Math.abs(score.weightDif))), claim.content, claim.maxConf ? " (maximum confidence set to " + claim.maxConf + "%) " : "", claim.citationUrl, claim.citation, "childIndicatorSpace" + (claim.childIds.length == 0 ? '' : ' hasChildren'), "childIndicator " + (claim.isProMain ? 'pro' : 'con'), score.numDesc, claim.childIds.map(function (childId, i) { return _this.renderNode(_this.scoresDict[childId], score); })));
        return result;
        var _a;
    };
    return RRDisplay;
}());
//# sourceMappingURL=rrDisplay.js.map