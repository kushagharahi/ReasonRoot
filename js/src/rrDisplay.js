var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        if (event)
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
                <li id="${claim.id}" class="${score.displayState + ' ' +
            (score.isMain ? 'mainClaim' : '') + ' ' +
            (this.settings.isEditing && this.selectedScore == score ? 'editing' : '')}">
                    <div class="claimPad" onclick="${this.selectScore.bind(this, score)}">
                        <div class="${"claim " + (claim.isProMain ? 'pro' : 'con') + (claim.disabled ? ' disabled ' : '') + (claim.childIds.length > 0 && !score.open ? ' shadow' : '')}" >
                            <div class="innerClaim">
                                <span class="score" >${(score.generation == 0 ?
            Math.round(score.animatedWeightedPercentage * 100) + '%' :
            Math.floor(Math.abs(score.weightDif)))}</span>

                                ${claim.content}
                                ${claim.maxConf && claim.maxConf < 100 ? " (maximum confidence set to " + claim.maxConf + "%) " : ""}
                                <a target="_blank" href="${claim.citationUrl}" onclick="${this.noBubbleClick}"> 
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

                        <div class="claimEditHider">
                            <div class="claimEditSection">
                                <input bind="content"  oninput="${this.updateClaim.bind(this, claim)}" ><br>
                                <input bind="citation" oninput="${this.updateClaim.bind(this, claim)}" ><br>
                                <input bind="citationUrl" oninput="${this.updateClaim.bind(this, claim)}" ><br>
                                <label for="maxConf" >Maximum Confidence </label><br/>
                                <input bind="maxConf" name="maxConf" type="number" oninput="${this.updateClaim.bind(this, claim)}" ><br>
                                <input type="checkbox" bind="isProMain" onclick="${this.updateClaim.bind(this, claim)}">
                                <label for="isProMain">Does this claim supports the main claim?</label><br/>
                                <input type="checkbox" bind="disabled" onclick="${this.updateClaim.bind(this, claim)}">
                                <label for="disabled">Disabled?</label><br/>
                                <button onclick="${this.removeClaim.bind(this, claim, parent)}" name="button">
                                    Remove this claim from it's parent
                                </button><br/>
                                ID:${claim.id}
                            </div>
                        </div>

                        <div class="claimMenuHider">
                            <div class="claimMenuSection">
                                <div class="addClaim pro" onclick="${this.addClaim.bind(this, score, true)}">add</div>
                                <div class="addClaim con" onclick="${this.addClaim.bind(this, score, false)}">add</div>
                                <div class="editClaimButton" onclick="${this.editClaim.bind(this, score)}">edit</div>
                            </div>
                        </div>

                    </div>  
                      
                    <ul>${claim.childIds.map((childId, i) => this.renderNode(this.scoresDict[childId], score))}</ul>
                        </li>`;
        if (!wire.default) {
            wire.default = claim.content;
            let inputs = result.querySelector('.claimPad').querySelectorAll('input');
            for (let input of inputs) {
                var bindName = input.getAttribute("bind");
                if (bindName) {
                    if (input.type == "checkbox")
                        input.checked = claim[bindName];
                    else
                        input.value = claim[bindName];
                }
            }
        }
        return result;
    }
    selectScore(score, e) {
        if (score != this.selectedScore) {
            this.selectedScore = score;
            this.setDisplayState();
            this.update();
        }
    }
    noBubbleClick(event) {
        var event = arguments[0] || window.event;
        if (event)
            event.stopPropagation();
    }
    updateClaim(claim, event) {
        //this.content = e.target.value;
        let inputs = event.srcElement.parentElement.querySelectorAll('input');
        for (let input of inputs) {
            var bindName = input.getAttribute("bind");
            if (bindName) {
                if (input.type == "checkbox")
                    claim[bindName] = input.checked;
                else
                    claim[bindName] = input.value;
            }
        }
        this.settleIt.calculate(this.mainScore, this.scoresDict);
        this.update();
    }
    removeClaim(claim, parentScore, event) {
        var index = parentScore.claim.childIds.indexOf(claim.id);
        if (index > -1)
            parentScore.claim.childIds.splice(index, 1);
        this.selectedScore = parentScore;
        this.setDisplayState();
        this.update();
    }
    editClaim(score, event) {
        this.settings.isEditing = !this.settings.isEditing;
        this.update();
        if (event)
            event.stopPropagation();
    }
    addClaim(parentScore, isProMain, event) {
        let newClaim = new Claim();
        newClaim.isProMain = isProMain;
        let newScore = new Score(newClaim);
        this.scoresDict[newClaim.id] = newScore;
        parentScore.claim.childIds.unshift(newClaim.id);
        this.claimsList.push(newScore.claim);
        newScore.displayState = "hideClaim";
        this.update();
        setTimeout(() => {
            this.selectedScore = newScore;
            this.settings.isEditing = true;
            this.settleIt.calculate(this.mainScore, this.scoresDict);
            this.setDisplayState();
            this.update();
        }, 10);
        if (event)
            event.stopPropagation();
    }
}
let mainClaimsDict = {};
window.onload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        var claimElements = document.getElementsByTagName('claim');
        for (let claimElement of claimElements) {
            let rr = new RRDisplay(claimElement);
            mainClaimsDict[rr.mainId] = rr;
        }
        //Run the Demo ________________________________________________________________
        demo();
    });
};
function demo() {
    return __awaiter(this, void 0, void 0, function* () {
        let rr = mainClaimsDict[0];
        yield wait(3000);
        rr.addClaim(rr.mainScore, false);
    });
}
function wait(milliseconds) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    });
}
//# sourceMappingURL=RRDisplay.js.map