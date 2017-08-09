declare const require: any;

//Import SCSS
require('../src/assets/styles/ReasonRoot.scss');
type WhichCopy = "original" | "local" | "suggestion";

import hyperHTML = require('hyperhtml');
import Root from './app/Root';
import Dict from './app/Dict';
import SettleIt from'./app/SettleIt';
import Score from './app/Score';
import Claim from './app/Claim';
import Firebase from './app/Firebase';

export default class ReasonRoot {
    userName: string = 'Sign In';
    rrRef: any;//The current firebase reference to the ReasonRoot object
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
    rr: Root = new Root();
    whichCopy: WhichCopy;
    settingsVisible: boolean = false;
    listenerRefs: any[] = new Array<any>();
    canWrite: boolean;
    mainId: any;
    firebase: Firebase = new Firebase();
    score: Score = new Score();
    claim: Claim = new Claim();

    constructor(claimElement?: Element) {
      this.settleIt = new SettleIt();
      this.firebase.firebaseInit();
      this.firebase.onAuthStateChanged();
      if(claimElement){
        //this.render is a pointer to the Claim HTML tag.
        this.render = hyperHTML.bind(claimElement);
        this.rr = JSON.parse(claimElement.getAttribute('root'));
        this.changeWhichCopy("original");
        //this.attachDB();
        //this.initRr();
        //this.update();
      } else {
        let claimElement = document.createElement("claim");
        let newClaim: Claim = new Claim();
        this.firebase.createReasonRoot(newClaim);
        let claim = {};
        let root = {};

        claim[newClaim.claimId] = Object.assign({}, newClaim);
        root['claims'] = Object.assign({}, claim);
        root['scores'] = {};
        root['settings'] = {};
        root['mainId'] = newClaim.claimId;

        claimElement.setAttribute("id", newClaim.claimId);
        claimElement.setAttribute("root", JSON.stringify(root));
        document.body.appendChild(claimElement);

        this.render = hyperHTML.bind(claimElement);
        this.rr = JSON.parse(JSON.stringify(root));

        this.canWrite = true;
        this.changeWhichCopy("local");
      }
      // this.render = hyperHTML.bind(claimElement);
    }

    initRr() {
        this.claims = this.rr.claims;
        if (this.rr.settings) this.settings = this.rr.settings;
        this.scores = this.createDict(this.claims);
        this.mainScore = this.scores[this.rr.mainId];
        this.mainScore.isMain = true;

        // Returns a Object loaded with the result of global variables: mainId, claims, scores
        // TODO Why calculate an this.settleIt.calculate is called at the same time?
        //this.settleIt.calculate(this.rr.mainId, this.claims, this.scores);
        this.setDisplayState();
        this.calculate();
    }

    changeWhichCopy(whichCopy?: WhichCopy) {
        if (this.whichCopy === whichCopy) return
        this.whichCopy = whichCopy

        if (whichCopy === undefined) {
            //Determine which one to point to
        }

        //Clear any existing observers
        for (let ref of this.listenerRefs) ref.off();

        if (whichCopy === "local") {
            //pull local data if it exists and set it to save

            // TODO localStorage is null
            // let rr = localStorage.getItem(this.savePrefix + this.rr.mainId);
            // if (rr) {
            //     this.rr = JSON.parse(rr);
            // }
        } else {
          // Original and suggestion both mean remote
          // This is the problem
            //this.firebase.firebaseInit(this.rr, this.canWrite);
            if (whichCopy === "original") {
                this.rrRef = this.firebase.db.ref('roots/' + this.rr.mainId);
            }
            else if (whichCopy === "suggestion") {
                //to do Find the ID of my suggestion
                this.rrRef = this.firebase.db.ref('roots/' + this.rr.mainId);
            }
            this.attachDB();
        }
        this.initRr();
        this.update();
    }

    //This may be on Firebase and it sync reason root remote data with local one
    attachDB() {
      let claimsRef = this.rrRef.child('claims');
      this.listenerRefs.push(claimsRef);
      claimsRef.once('value', this.claimsFromDB.bind(this));
      claimsRef.on('child_changed', this.claimFromDB.bind(this));

      //Check for write permissions
      if (this.firebase.getCurrentUser()) {
          let permissionRef = this.firebase.db.ref('permissions/user/' + this.firebase.getCurrentUser().uid + "/" + this.rr.mainId);
          this.listenerRefs.push(permissionRef);
          //To do the can write below is on the wrong "this"
          permissionRef.on('value', function (snapshot) {
              this.canWrite = snapshot.val();
          })
      } else {
          this.canWrite = false;
      }
    }

    //This may be on Firebase
    claimsFromDB(data: any) {
        // Here claims are pulled from firebase.
        // value is the reason root object
        let value = data.val();
        if (value) {
            this.rr.claims = value;
            this.claims = value;
            this.calculate();
            this.update();
        }
    }

    //This may be on Firebase
    claimFromDB(data: any) {
        let value = data.val();
        if (value) {
            let claim: Claim = value;
            this.claims[claim.claimId] = claim;
            this.calculate();
            this.update();
        }
    }

    setDisplayState(): void {
        this.clearDisplayState();
        this.setDisplayStateLoop(this.mainScore);
    }

    clearDisplayState(): void {
        for (let scoreId in this.scores) {
            if (this.scores.hasOwnProperty(scoreId)) {
                this.scores[scoreId].displayState = "notSelected";
            }
        }
    }

    //Set state of claims every time selected score change
    setDisplayStateLoop(score: Score): void {
        // Compare the param score whit selected Score if they are the same set score state to "selected".
        if (score == this.selectedScore)
            score.displayState = "selected";
        let childIds = this.claims[score.claimId].childIds;
        if(childIds !== undefined){
          for (let childId of childIds) {
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
    }

    // This displays the settngs menu of the main claim.
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
          <div class = "${'settingsHider ' + (this.settingsVisible ? 'open' : '')}">
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

              <input value="${this.replaceAll(JSON.stringify(this.rr), '\'', '&#39;')}"></input>

              <div  onclick="${this.signIn}">
                      [${this.userName} ]
              </div>
         </div>
          <div>${this.renderNode(this.scores[this.rr.mainId])}</div>
          <div class="settingsButton" onclick="${this.toggleSettings.bind(this)}">
              ⚙
          </div>
      </div>`;
    }

    signIn = () => {
      this.firebase.signIn().then((user) => {
        this.userName = user.email + ' - ' + user.uid;
        this.firebase.getReasonRootsByUserId(user.uid)
          .then(snapshot => {
            let reasonRoots = snapshot.val();
            for(let reasonRoot in reasonRoots){
              this.firebase.getDataById(reasonRoot)
                .then(snapshot => {
                  let root = snapshot.val();
                  console.log(root);
                  // console.log(JSON.stringify(snapshot.val()));
                  const claimElement = document.createElement("claim");
                  claimElement.setAttribute("id", root.mainId);
                  claimElement.setAttribute("root", JSON.stringify(root));
                  document.body.appendChild(claimElement);

                  let reasonRoot = new ReasonRoot(claimElement);

                });
              // console.log(reasonRoot);
              // that.appendReasonRoot(reasonRoot);
            }
          });
      });
    }

    // Settings is part of the Reason Root's main claim, this should be on Reason Root component
    updateSettings(settings: any, event: any): void {
        settings[event.srcElement.getAttribute("bind")] = event.srcElement.checked;
        this.update();
        if (event) event.stopPropagation();
    }

    toggleSettings(event: Event, node: any): void {
        this.settingsVisible = !this.settingsVisible;
        this.update();
    }

    replaceAll(target: string, search: string, replacement: string): string {
        return target.split(search).join(replacement);
    }

    // This render a unique Claim, this should be part of Claim component,both main claim and child climes use it.
    renderNode(score: Score, parent?: Score): void {
      let claim: Claim = this.claims[score.claimId];
      const wire = hyperHTML.wire(score);
      this.animateNumbers();

      const result = wire`
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
                              <div class="addClaim pro" onclick="${this.addClaim.bind(this, true)}">add</div>
                              <div class="addClaim con" onclick="${this.addClaim.bind(this, false)}">add</div>
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
              let bindName = input.getAttribute("bind")
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

    //Check for animating numbers of the Reason Root's main claim, this should be on Reason Root component
    animateNumbers() {
        let found = false;
        for (let scoreId in this.scores) {
            let s = this.scores[scoreId];
            if (s.weightedPercentage != s.animatedWeightedPercentage) {
                found = true;
                let difference = s.weightedPercentage - s.animatedWeightedPercentage
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
    };

    noBubbleClick(event: Event): void {
      if (event) event.stopPropagation();
    };


    calculate(): void {
      this.settleIt.calculate(this.rr.mainId, this.claims, this.scores);
    };

    // The logic of this functionalities: addClaim, updateClaim, and removeClaim were moved
    // to their own class file, and then they only should be called from other classes like this.

    addClaim(isProMain: boolean, event?: Event) {
      let childClaim: Claim;
      let parentClaim: Claim = this.claims[this.selectedScore.claimId];
      childClaim = this.claim.add(this.selectedScore, isProMain, this.scores, this.claims);
      this.firebase.addData(this.rr, parentClaim, childClaim);
      this.calculate();
      this.setDisplayState();
      this.update();

      if (event) event.stopPropagation();
    };

    updateClaim(claim: Claim, event: Event) {
      this.claim.update(claim, event);
      this.firebase.updateData(this.rr, claim);
      //update the UI
      this.calculate();
      this.update();

    };

    removeClaim(claim: Claim, parentScore: Score, event: Event): void {
      let parentClaim: Claim = this.claims[parentScore.claimId];
      this.claim.remove(claim, this.claims, parentScore, event);
      this.firebase.deleteData(this.rr, parentClaim, claim);
      this.calculate();
      this.setDisplayState();
      this.update();
    };

    editClaim(score: Score, event?: Event): void {

      this.settings.isEditing = !this.settings.isEditing;
      this.update();
      if (event) event.stopPropagation();
    }

    createDict(claims: Dict<Claim>, dict?: Dict<Score>): Dict<Score> {
        if (dict === undefined) dict = new Dict<Score>();

        for (let claimId in claims) {
            if (claims.hasOwnProperty(claimId)) {
                if (dict[claimId] === undefined) {
                    let newScore = new Score();
                    newScore.claimId = claimId;
                    dict[claimId] = newScore;
                }
            }
        }

        // for (let claim of claims) {
        //     if (dict[claim.id] === undefined) {
        //         let newScore = new Score();
        //         newthis.claims[score.claimId] = claim;
        //         dict[claim.id] = newScore;
        //     }
        // }
        return dict;
    }

}
