    //On the

declare const require: any;

type WhichCopy = "original" | "local" | "suggestion";

const hyperHTML = require('hyperhtml');
//const firebase = require('firebase');

import Root from './Root';
import Dict from './Dict';
import SettleIt from'./SettleIt';
import Score from './Score';
import Claim from './Claim';
import Firebase from './Firebase';
import Display from './Display';

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
    //settingsVisible: boolean = false;
    listenerRefs: any[] = new Array<any>();
    canWrite: boolean;
    mainId: any;
    firebase: Firebase;
    score: Score = new Score();
    claim: Claim = new Claim();
    display: Display;

    constructor(firebase: Firebase, claimElement?: Element) {
      if(claimElement){
        this.render = hyperHTML.bind(claimElement);
        this.settleIt = new SettleIt();
        this.rr = JSON.parse(claimElement.getAttribute('root'));
        //console.log(this.rr);
        //this.firebase.firebaseInit(this.rr, this.canWrite);
        this.firebase = firebase;
        console.log(this.firebase);
        this.firebase.onAuthStateChanged(this.rr, this.canWrite);
        this.changeWhichCopy("original");

        //this.attachDB();
        this.initRr();
        //this.update();
      }
    }

    initRr() {
        this.claims = this.rr.claims;
        if (this.rr.settings) this.settings = this.rr.settings;
        this.scores = this.createDict(this.claims);
        this.mainScore = this.scores[this.rr.mainId];
        this.mainScore.isMain = true;
        this.display = new Display(this.render, this.settings);
        console.log(this.scores);
        this.settleIt.calculate(this.rr.mainId, this.claims, this.scores);
        this.setDisplayState(this.selectedScore);
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
            let rr = localStorage.getItem(this.savePrefix + this.rr.mainId);
            console.log(rr);
            if (rr) {
                this.rr = JSON.parse(rr);
            }
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
            // let reasonRoots = this.firebase.getReasonRootFromDB();
            // console.log(reasonRoots);
            // for( let reasonRoot in reasonRoots) {
            //   console.log("reasonRoot");
            //   console.log(reasonRoot);
              //this.appendReasonRoot(reasonRoot);
            // };
        }

        this.initRr();
        this.display.update(this.renderNode(this.scores[this.rr.mainId]));
    }

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

    claimsFromDB(data: any) {
        // Here claims are pulled from firebase.
        // value is the reason root object
        let value = data.val();
        if (value) {
            this.rr.claims = value;
            this.claims = value;
            this.calculate();
            this.display.update(this.renderNode(this.scores[this.rr.mainId]));
        }
    }

    claimFromDB(data: any) {
        let value = data.val();
        if (value) {
            let claim: Claim = value;
            this.claims[claim.claimId] = claim;
            this.calculate();
            this.display.update(this.renderNode(this.scores[this.rr.mainId]));
        }
    }

    setDisplayState(selectedScore?: Score): void {
        this.display.clearDisplayState(this.scores);
        this.mainScore = this.display.setDisplayStateLoop(this.mainScore, this.claims, this.scores, this.selectedScore);
    }

    renderNode(score: Score, parent?: Score): void {
      var claim: Claim = this.claims[score.claimId];
      var claims = this.claims;
      var wire = hyperHTML.wire(score);
      if (this.display.animateNumbers(this.scores)) setTimeout(() => this.display.update(this.renderNode(this.scores[this.rr.mainId])), 100);

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

    selectScore(score: Score, e: Event): void {
      if (score != this.selectedScore) {
          this.selectedScore = score;
          this.setDisplayState();
          this.display.update(this.renderNode(this.scores[this.rr.mainId]));
      }
    };

    noBubbleClick(event: Event): void {
      if (event) event.stopPropagation();
    };


    calculate(): void {
      console.log(this.scores);
      this.settleIt.calculate(this.rr.mainId, this.claims, this.scores)
    };

    // The logic of this functionalities: addClaim, updateClaim, and removeClaim were moved
    // to their own class file, and then they only should be called from other classes like this.

    createReasonRoot() {
      console.log(this.firebase);
      let claimId = this.firebase.createReasonRoot();
      this.appendReasonRoot(claimId);
    };

    appendReasonRoot(mainId){
      let element = document.createElement("claim");
      this.firebase.getDataById(mainId)
        .then(data => {
          element.setAttribute("root", data);
        })
       .then(() => {
         document.body.appendChild(element);
       }
     );
    };


    addClaim(isProMain: boolean, event?: Event) {
      let childClaim: Claim;
      let parentClaim: Claim = this.claims[this.selectedScore.claimId];
      childClaim = this.claim.add(this.selectedScore, isProMain, this.scores, this.claims);
      this.firebase.addData(this.rr, parentClaim, childClaim);
      this.calculate();
      this.setDisplayState(this.selectedScore);
      this.display.update(this.renderNode(this.scores[this.rr.mainId]));

      if (event) event.stopPropagation();
    };

    updateClaim(claim: Claim, event: Event) {
      this.claim.update(claim, event);
      this.firebase.updateData(this.rr, claim);
      //update the UI
      this.calculate();
      this.display.update(this.renderNode(this.scores[this.rr.mainId]));

    };

    removeClaim(claim: Claim, parentScore: Score, event: Event): void {
      this.claim.remove(claim, this.claims, parentScore, event);
      this.firebase.deleteData(this.rr, claim);
      this.calculate();
      this.setDisplayState(this.selectedScore);
      this.display.update(this.renderNode(this.scores[this.rr.mainId]));
    };

    editClaim(score: Score, event?: Event): void {

      this.settings.isEditing = !this.settings.isEditing;
      this.display.update(this.renderNode(this.scores[this.rr.mainId]));
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
