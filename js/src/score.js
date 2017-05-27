class Score {
    /** */
    constructor(claim) {
        if (claim)
            this.claim = claim;
    }
}
var DisplayState;
(function (DisplayState) {
    DisplayState[DisplayState["None"] = 0] = "None";
    DisplayState[DisplayState["Parent"] = 1] = "Parent";
    DisplayState[DisplayState["Ancestor"] = 2] = "Ancestor";
    DisplayState[DisplayState["Selected"] = 3] = "Selected";
    DisplayState[DisplayState["Child"] = 4] = "Child";
})(DisplayState || (DisplayState = {}));
;
//# sourceMappingURL=score.js.map