import Root from './Root';
import Dict from './Dict';
import SettleIt from'./SettleIt';
import Score from './Score';
import Claim from './Claim';
import Setting from './Setting';
import Animation from './Animation';
import Auth from './Auth';

export default class Operations{
  userName: string = 'Sign In';
  settleIt: SettleIt;
  root: Root = new Root();
  selectedScore: Score;
  score: Score = new Score();
  scores: Dict<Score>;
  claims: Dict<Claim>;
  settings: any = {};
  mainScore: Score;
  render: any;
  setting: Setting = new Setting();
  settingsVisible: boolean = false;
  animation: Animation = new Animation();
  auth: Auth = new Auth();

  calculate(): void {
      this.settleIt.calculate(this.root.mainId, this.claims, this.scores)
  }

  replaceAll(target: string, search: string, replacement: string): string {
      return target.split(search).join(replacement);
  };

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
          <div class = "${'settingsHider ' + (this.settingsVisible ? 'open' : '')}">
              <input type="checkbox" id="hideScore" bind="hideScore" value="hideScore" onclick="${this.setting.update.bind(this, this.settings)}">
              <label for="hideScore">Hide Score</label>
              <input type="checkbox" id="hidePoints" bind="hidePoints" value="hidePoints" onclick="${this.setting.update.bind(this, this.settings)}">
              <label for="hidePoints">Hide Points</label>
              <input type="checkbox" id="noAutoSave" bind="noAutoSave" value="noAutoSave" onclick="${this.setting.update.bind(this, this.settings)}">
              <label for="noAutoSave">No Auto Save</label>
              <input type="checkbox" id="showSiblings" bind="showSiblings" value="showSiblings" onclick="${this.setting.update.bind(this, this.settings)}">
              <label for="showSiblings">Show Sibllings</label>
              <input type="checkbox" id="hideClaimMenu" bind="hideClaimMenu" value="hideClaimMenu" onclick="${this.setting.update.bind(this, this.settings)}">
              <label for="hideClaimMenu">Hide Claim Menu</label>
              <input type="checkbox" id="hideChildIndicator" bind="hideChildIndicator" value="hideChildIndicator" onclick="${this.setting.update.bind(this, this.settings)}">
              <label for="hideChildIndicator">Hide Child Indicator</label>
              <input type="checkbox" id="showCompetition" bind="showCompetition" value="showCompetition" onclick="${this.setting.update.bind(this, this.settings)}">
              <label for="showCompetition">Show Competition</label>

              <input value="${this.replaceAll(JSON.stringify(this.root), '\'', '&#39;')}"></input>

              <div  onclick="${this.auth.signIn.bind(this)}">
                      [${this.userName} ]
              </div>
         </div>
          <div>${this.renderNode(this.scores[this.root.mainId])}</div>
          <div class="settingsButton" onclick="${this.setting.toggle.bind(this.settingsVisible,this)}">
              ⚙
          </div>
      </div>`;
  }

  renderNode(score: Score, parent?: Score): void {
      var claim: Claim = this.claims[score.claimId];
      var wire = hyperHTML.wire(score);
      if (this.animation.animateNumbers(this.scores)) setTimeout(() => this.update(), 100);

      var result = wire`
              <li id="${claim.claimId}" class="${
          score.displayState +
          (score.isMain ? ' mainClaim' : '') +
          (this.settings.isEditing && this.selectedScore == score ? ' editing' : '')}">
                  <div class="claimPad" onclick="${this.score.select.bind(this, score)}">
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


}
