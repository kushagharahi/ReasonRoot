declare const require: any;
const hyperHTML = require('hyperhtml');

import Root from './Root';
import Score from './Score';
import Claim from './Claim';
import Dict from './Dict';
import Display from './Display';
import Animation from './Animation';

export default class Node{
  display: Display;
  claims: Dict<Claim>;
  scores: Dict<Score>;
  selectedScore: Score;
  animation: Animation;
  root: Root = new Root();
  settings: any = {};

  render(score: Score, claim: Claim, root: Root, parent?: Score): void {
    //var claim: Claim = this.claims[score.claimId];
    let display = this.display;
    let claims = this.claims;
    let scores = this.scores;
    let selectedScore = this.selectedScore;
    let wire = hyperHTML.wire(score);
    if (this.animation.animateNumbers(this.scores)) setTimeout(() => display.update(this.render(scores[root.mainId], claim, root)), 100);

    var result = wire`
            <li id="${claim.claimId}" class="${
        score.displayState +
        (score.isMain ? ' mainClaim' : '') +
        (this.settings.isEditing && selectedScore == score ? ' editing' : '')}">
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
        claim.childIds.map((childId, i) => this.render(scores[root.mainId], claim, root, score))
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

  selectScore(score: Score, e: Event, html: any): void {
    if (score != this.selectedScore) {
        this.selectedScore = score;
        this.setDisplayState();
        this.display.update(html);
    }
  }

  noBubbleClick(event: Event): void {
    if (event) event.stopPropagation();
  }

}
