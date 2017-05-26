declare class hyperHTML {
    static wire(optObj: any);
}

class RRDisplay {
    scoresDict: Dict<Score>;
    claimsList: Claim[];
    mainId: string;
    settleIt: SettleIt;
    mainScore: Score;
    render: any;

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

        this.render = hyperHTML.bind(claimElement);
        this.update();
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

    update(): void {
        //save(dict[mainId], dict);

        this.render`
        <div class="${'rr '}">
            <div>${this.renderNode(this.scoresDict[this.mainId], { open: true })}</div>
        </div>`;
    }

    renderNode(score, parent): void {
        var claim = score.claim;
        var wire = hyperHTML.wire(score);

        var result = wire`
                <li id="${claim.id}" >
                    <div class="claimPad" >
                        <div class="${"claim " + (claim.isProMain ? 'pro' : 'con') + (claim.disabled ? ' disabled ' : '') + (claim.childIds.length > 0 && !score.open ? ' shadow' : '')}" >
                            <div class="innerClaim">
                                <span class="score" > ${(score.generation == 0 ?
                Math.round(score.animatedWeightedPercentage * 100) + '%' :
                Math.floor(Math.abs(score.weightDif)))
            }</span>

                                ${claim.content}
                                ${claim.maxConf ? " (maximum confidence set to " + claim.maxConf + "%) " : ""}
                                <a target="_blank" href="${claim.citationUrl}" > 
                                    <span class="citation">${claim.citation}</span>
                                </a>

                             </div>
                        </div>
                        
                        <div class="${"childIndicatorSpace" + (claim.childIds.length == 0 ? '' : ' hasChildren')}">
                            <div class="${"childIndicator " + (claim.isProMain ? 'pro' : 'con')}">
                            <div class="childIndicatorInner">
                            ${score.numDesc} more
                            </div>
                            </div>
                        </div>
                    </div>  
                      
                    <ul>${
            claim.childIds.map((childId, i) => this.renderNode(this.scoresDict[childId], score))
            }</ul>
                </li>`
        return result;
    }

}