class RRDisplay {
    scoresDict: Dict<Score>;
    claimsList: Claim[];
    mainId: string;
    settleIt: SettleIt;
    mainScore: Score;

    constructor(claimElement: Element) {
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
            this.settleIt.calculate(this.mainScore, this.scoresDict)
            this.clearDisplayState();
            this.setClasses();
        //}

        alert("ran");
    }

    clearDisplayState(): void {
        for (let scoreId in this.scoresDict) {
            if (this.scoresDict.hasOwnProperty(scoreId)) {
                this.scoresDict[scoreId].displayState = DisplayState.None;
            }
        }
    }

    setClasses(): void {
        this.setClassesLoop(this.mainScore);
    }

    setClassesLoop(score: Score, parent?: Score): void {
        for (let childId of score.claim.childIds) {
            let childScore = this.scoresDict[childId];
            //process the children first
            this.setClassesLoop(childScore, score);

            if (childScore.displayState == DisplayState.Selected) 
                score.displayState = DisplayState.Parent;

            if (childScore.displayState == DisplayState.Ancestor || childScore.displayState == DisplayState.Parent)
                score.displayState = DisplayState.Ancestor;

            if (score.displayState == DisplayState.Selected)
                childScore.displayState = DisplayState.Child;
        }
    }


}