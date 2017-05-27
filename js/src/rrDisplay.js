class RRDisplay {
    constructor(claimElement) {
        this.settings = {};
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
        this.mainScore.isMain = true;
        this.settleIt.calculate(this.mainScore, this.scoresDict);
        this.setDisplayState();
        //}
        this.render = hyperHTML.bind(claimElement);
        this.update();
    }
    clearDisplayState() {
        for (let scoreId in this.scoresDict) {
            if (this.scoresDict.hasOwnProperty(scoreId)) {
                this.scoresDict[scoreId].displayState = "hideClaim";
            }
        }
    }
    setDisplayState() {
        this.clearDisplayState();
        this.setClassesLoop(this.mainScore);
    }
    setClassesLoop(score) {
        if (score == this.selectedScore)
            score.displayState = "selected";
        for (let childId of score.claim.childIds) {
            let childScore = this.scoresDict[childId];
            //process the children first
            this.setClassesLoop(childScore);
            if (childScore == this.selectedScore)
                score.displayState = "parent";
            if (childScore.displayState == "ancestor" || childScore.displayState == "parent")
                score.displayState = "ancestor";
            if (score == this.selectedScore)
                childScore.displayState = "child";
        }
    }
    update() {
        //save(dict[mainId], dict);
        this.render `
        <div class="${'rr ' +
            (this.settings.hideScore ? 'hideScore ' : '')}">
            <div class = "${'settingsHider ' + (this.settings.visible ? 'open' : '')}"> 
                <input type="checkbox" id="hideScore" bind="hideScore" value="hideScore" onclick="${this.updateSettings.bind(this, this.settings)}">
                <label for="hideScore">Hide Score</label>
                <input value="${this.replaceAll(JSON.stringify(this.claimsList), '\'', '&#39;')}"></input>
           </div>
            <div>${this.renderNode(this.scoresDict[this.mainId])}</div>
            <div class="settingsButton" onclick="${this.toggleSettings.bind(this)}"> 
                ⚙
            </div>
        </div>`;
    }
    updateSettings(settings, event) {
        settings[event.srcElement.getAttribute("bind")] = event.srcElement.checked;
        this.update();
        event.stopPropagation();
    }
    toggleSettings(event) {
        this.settings.visible = !this.settings.visible;
        this.update();
    }
    replaceAll(target, search, replacement) {
        return target.split(search).join(replacement);
    }
    ;
    renderNode(score, parent) {
        var claim = score.claim;
        var wire = hyperHTML.wire(score);
        var result = wire `
                <li id="${claim.id}" class="${score.displayState + ' ' + (score.isMain ? 'mainClaim' : '')}">
                    <div class="claimPad" onclick="${this.selectScore.bind(this, score)}">
                        <div class="${"claim " + (claim.isProMain ? 'pro' : 'con') + (claim.disabled ? ' disabled ' : '') + (claim.childIds.length > 0 && !score.open ? ' shadow' : '')}" >
                            <div class="innerClaim">
                                <span class="score" > ${(score.generation == 0 ?
            Math.round(score.animatedWeightedPercentage * 100) + '%' :
            Math.floor(Math.abs(score.weightDif)))}</span>

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
                      
                    <ul>${claim.childIds.map((childId, i) => this.renderNode(this.scoresDict[childId], score))}</ul>
                </li>`;
        return result;
    }
    selectScore(score, e) {
        if (score != this.selectedScore) {
            this.selectedScore = score;
            this.setDisplayState();
            this.update();
        }
    }
}
//# sourceMappingURL=RRDisplay.js.map