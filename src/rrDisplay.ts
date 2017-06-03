declare class firebase { }

declare class hyperHTML {
    static wire(optObj: any): any;
}

class RRDisplay {
    scores: Dict<Score>;
    claims: Dict<Claim>;
    settleIt: SettleIt;
    mainScore: Score;
    render: any;
    settings: any = {};
    selectedScore: Score;
    savePrefix: string = "rr_";
    //dbRef: firebase.database.Reference;
    db: any;
    root: Root = new Root();;


    constructor(claimElement: Element) {
        this.settleIt = new SettleIt();
        this.root = JSON.parse(claimElement.getAttribute('root'));
        this.claims = this.root.claims;
        if (this.root.settings) this.settings = this.root.settings;
        //if (this.root.scores) this.scores = this.root.scores;
        this.scores = createDict(this.claims);


        //set up the firebase connectivity
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyAH_UO_f2F3OuVLfZvAqezEujnMesmx6hA",
                authDomain: "settleitorg.firebaseapp.com",
                databaseURL: "https://settleitorg.firebaseio.com",
                projectId: "settleitorg",
                storageBucket: "settleitorg.appspot.com",
                messagingSenderId: "835574079849"
            });
        }
        this.db = firebase.database();
        // this.dbRef = firebase.database().ref('roots/' + this.root.mainId);
        // this.dbRef.on('child_changed', this.dataFromDB);
        let claimsRef = this.db.ref('roots/' + this.root.mainId + '/claims')
        claimsRef.once('value', this.claimsFromDB.bind(this));
        claimsRef.on('child_changed', this.claimFromDB.bind(this));

        // //Check for write permissions
        // let permissionRef = this.db.ref('permissions/user/' + firebase.auth().currentUser.uid + "/" + this.root.mainId)
        // permissionRef.on('value', function(snapshot){
        //     this.canWrite = snapshot.val();
        // })

        // //Add Suggestions only for now
        // firebase.database().ref(
        //     'suggestions/' + this.root.mainId + "/users/" + firebase.auth().currentUser.uid
        // ).set(this.root.mainId);

        //restore saved dictionairy
        // let potentialDict = localStorage.getItem(this.savePrefix + this.root.mainId);
        // if (potentialDict) {
        //     this.scores = JSON.parse(potentialDict);
        //     this.mainScore = this.scores[this.root.mainId];
        //     this.claims = new Dict<Claim>();
        //     for (let scoreId in this.scores) {
        //         this.claims[scoreId] = this.scores[scoreId].claim;
        //     }
        //     this.settleIt.calculate(this.root.mainId, this.scores);
        // } else {
        this.mainScore = this.scores[this.root.mainId];
        this.mainScore.isMain = true;
        this.settleIt.calculate(this.root.mainId, this.claims, this.scores)
        this.setDisplayState();
        //}

        this.render = hyperHTML.bind(claimElement);
        this.update();
    }

    claimsFromDB(data: any) {
        let value = data.val();
        if (value) {
            this.claims = value;
            this.calculate();
            this.update();
        }
    }

    claimFromDB(data: any) {
        let value = data.val();
        if (value) {
            let claim: Claim = value;
            this.claims[claim.claimId] = claim;
            this.calculate();
            this.update();
        }
    }

    clearDisplayState(): void {
        for (let scoreId in this.scores) {
            if (this.scores.hasOwnProperty(scoreId)) {
                this.scores[scoreId].displayState = "notSelected";
            }
        }
    }

    setDisplayState(): void {
        this.clearDisplayState();
        this.setDisplayStateLoop(this.mainScore);
    }

    setDisplayStateLoop(score: Score): void {
        if (score == this.selectedScore)
            score.displayState = "selected";

        for (let childId of this.claims[score.claimId].childIds) {
            let childScore = this.scores[childId];
            //process the children first/
            this.setDisplayStateLoop(childScore);

            if (childScore == this.selectedScore) {
                score.displayState = "parent";
                //Set Siblings
                for (let siblingId of this.claims[score.claimId].childIds) {
                    let siblingScore = this.scores[siblingId];
                    if (siblingScore.displayState != "selected")
                        siblingScore.displayState = "sibling";
                }
            }

            if (childScore.displayState == "ancestor" || childScore.displayState == "parent")
                score.displayState = "ancestor";

            if (score == this.selectedScore)
                childScore.displayState = "child";
        }
    }

    update(): void {
        // if (!this.settings.noAutoSave)
        //     localStorage.setItem(this.savePrefix + this.root.mainId, JSON.stringify(this.scores));

        this.render`
        <div class="${'rr' +
            (this.settings.hideScore ? ' hideScore' : '') +
            (this.settings.hidePoints ? ' hidePoints' : '') +
            (this.settings.hideClaimMenu ? ' hideClaimMenu' : '') +
            (this.settings.hideChildIndicator ? ' hideChildIndicator' : '') +
            (this.settings.showSiblings ? ' showSiblings' : '') +
            (this.settings.showCompetition ? ' showCompetition' : '')

            }">
            <div class = "${'settingsHider ' + (this.settings.visible ? 'open' : '')}"> 
                <input type="checkbox" id="hideScore" bind="hideScore" value="hideScore" onclick="${this.updateSettings.bind(this, this.settings)}">
                <label for="hideScore">Hide Score</label>
                <input type="checkbox" id="hidePoints" bind="hidePoints" value="hidePoints" onclick="${this.updateSettings.bind(this, this.settings)}">
                <label for="hidePoints">Hide Points</label>
                <input type="checkbox" id="noAutoSave" bind="noAutoSave" value="noAutoSave" onclick="${this.updateSettings.bind(this, this.settings)}">
                <label for="noAutoSave">No Auto Save</label>
                <input type="checkbox" id="showSiblings" bind="showSiblings" value="showSiblings" onclick="${this.updateSettings.bind(this, this.settings)}">
                <label for="showSiblings">Show Sibllings</label>
                <input type="checkbox" id="hideClaimMenu" bind="hideClaimMenu" value="hideClaimMenu" onclick="${this.updateSettings.bind(this, this.settings)}">
                <label for="hideClaimMenu">Hide Claim Menu</label>
                <input type="checkbox" id="hideChildIndicator" bind="hideChildIndicator" value="hideChildIndicator" onclick="${this.updateSettings.bind(this, this.settings)}">
                <label for="hideChildIndicator">Hide Child Indicator</label>
                <input type="checkbox" id="showCompetition" bind="showCompetition" value="showCompetition" onclick="${this.updateSettings.bind(this, this.settings)}">
                <label for="showCompetition">Show Competition</label>

                <input value="${this.replaceAll(JSON.stringify(this.root), '\'', '&#39;')}"></input>
                
                <div  onclick="${this.signIn.bind(this)}"> 
                        [${firebase.auth().currentUser ? firebase.auth().currentUser.email + '-' + firebase.auth().currentUser.uid : 'Sign In'} ]
                </div>
           </div>
            <div>${this.renderNode(this.scores[this.root.mainId])}</div>
            <div class="settingsButton" onclick="${this.toggleSettings.bind(this)}"> 
                ⚙
            </div>
        </div>`;
    }

    updateSettings(settings: any, event: Event): void {
        settings[event.srcElement.getAttribute("bind")] = event.srcElement.checked;
        this.update();
        if (event) event.stopPropagation();
    }

    toggleSettings(event: Event): void {
        this.settings.visible = !this.settings.visible;
        this.update();
    }

    replaceAll(target: string, search: string, replacement: string): string {
        return target.split(search).join(replacement);
    };

    renderNode(score: Score, parent?: Score): void {
        var claim: Claim = this.claims[score.claimId];
        var wire = hyperHTML.wire(score);

        this.animatenumbers()

        var result = wire`
                <li id="${claim.claimId}" class="${
            score.displayState +
            (score.isMain ? ' mainClaim' : '') +
            (this.settings.isEditing && this.selectedScore == score ? ' editing' : '')}">
                    <div class="claimPad" onclick="${this.selectScore.bind(this, score)}">
                        <div class="${"claim " + (claim.isProMain ? 'pro' : 'con') + (claim.disabled ? ' disabled ' : '') + (claim.childIds.length > 0 && !score.open ? ' shadow' : '')}" >
                            <div class="innerClaim">
                                <span class="${score.generation == 0 ? 'score' : 'points'}" >${
            (score.generation == 0 ?
                Math.round(score.animatedWeightedPercentage * 100) + '%' :
                (score.weightDif != undefined ? Math.floor(Math.abs(score.weightDif)) : ''))
            }</span>

            <span class="proPoints" >${Math.round(score.weightPro)}</span>
            <span class="conPoints" >${Math.round(score.weightCon)}</span>

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
                                ID:${claim.claimId}
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
                      
                    <ul>${
            claim.childIds.map((childId, i) => this.renderNode(this.scores[childId], score))
            }</ul>
                        </li>`

        if (!wire.default) {
            wire.default = claim.content;
            let inputs = result.querySelector('.claimPad').querySelectorAll('input');
            for (let input of inputs) {
                var bindName = input.getAttribute("bind")
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

    //Check for animating numbers
    animatenumbers() {
        var found = false;
        for (var scoreId in this.scores) {
            var s = this.scores[scoreId];
            if (s.weightedPercentage != s.animatedWeightedPercentage) {
                found = true;
                var difference = s.weightedPercentage - s.animatedWeightedPercentage
                if (Math.abs(difference) < .01)
                    s.animatedWeightedPercentage = s.weightedPercentage
                else
                    s.animatedWeightedPercentage += difference / 100;
            }
        }
        if (found) setTimeout(() => this.update(), 100);
    }

    selectScore(score: Score, e: Event): void {
        if (score != this.selectedScore) {
            this.selectedScore = score;
            this.setDisplayState();
            this.update();
        }
    }

    noBubbleClick(event: Event): void {
        if (event) event.stopPropagation();
    }

    updateClaim(claim: Claim, event: Event) {
        let inputs = event.srcElement.parentElement.querySelectorAll('input');
        for (let input of inputs) {
            var bindName = input.getAttribute("bind")
            if (bindName) {
                if (input.type == "checkbox")
                    claim[bindName] = input.checked;
                else
                    claim[bindName] = input.value;
            }
        }
        //Update the DB
        firebase.database().ref('roots/' + this.root.mainId + '/claims/' + claim.claimId).set(claim);


        //update the UI
        this.calculate();
        this.update();
    }

    calculate(): void {
        this.settleIt.calculate(this.root.mainId, this.claims, this.scores)
    }

    removeClaim(claim: Claim, parentScore: Score, event: Event): void {
        var index = this.claims[parentScore.claimId].childIds.indexOf(claim.claimId);
        if (index > -1) this.claims[parentScore.claimId].childIds.splice(index, 1);
        this.selectedScore = parentScore;
        this.setDisplayState();
        this.update();
    }

    editClaim(score: Score, event?: Event): void {
        this.settings.isEditing = !this.settings.isEditing;
        this.update();
        if (event) event.stopPropagation();
    }

    addClaim(parentScore: Score, isProMain: boolean, event?: Event) {
        let newClaim: Claim = new Claim();
        newClaim.isProMain = isProMain;
        let newScore: Score = new Score(newClaim)
        this.scores[newClaim.claimId] = newScore;
        this.claims[parentScore.claimId].childIds.unshift(newClaim.claimId);
        this.claims[newClaim.claimId] = newClaim;
        newScore.displayState = "notSelected";
        this.update();

        setTimeout(() => {
            this.selectedScore = newScore;
            this.settings.isEditing = true;
            this.calculate();
            this.setDisplayState();
            this.update();
        }, 10)

        if (event) event.stopPropagation();
    }

    signIn() {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            console.log(result);
            // ...
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            console.log(error);
        });
    }

}



