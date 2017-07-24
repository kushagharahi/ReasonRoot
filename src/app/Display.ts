import Root from './Root';
//import Node from './Node';
import Firebase from './Firebase';
import Dict from './Dict';
import Score from './Score';
import Claim from './Claim';

export default class Display{
  userName: string = 'Sign In';
  render: any;
  settings: any = {};
  settingsVisible: boolean = false;
  root: Root = new Root();
  firebase: Firebase = new Firebase();

  constructor(render: any, settings: any){
    this.render = render;
    this.settings = settings;
  }

  update(node: any): void {
    //let root = this.root;

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
            <input type="checkbox" id="hideScore" bind="hideScore" value="hideScore" onclick="${this.updateSettings.bind(this, this.settings, node)}">
            <label for="hideScore">Hide Score</label>
            <input type="checkbox" id="hidePoints" bind="hidePoints" value="hidePoints" onclick="${this.updateSettings.bind(this, this.settings, node)}">
            <label for="hidePoints">Hide Points</label>
            <input type="checkbox" id="noAutoSave" bind="noAutoSave" value="noAutoSave" onclick="${this.updateSettings.bind(this, this.settings, node)}">
            <label for="noAutoSave">No Auto Save</label>
            <input type="checkbox" id="showSiblings" bind="showSiblings" value="showSiblings" onclick="${this.updateSettings.bind(this, this.settings, node)}">
            <label for="showSiblings">Show Sibllings</label>
            <input type="checkbox" id="hideClaimMenu" bind="hideClaimMenu" value="hideClaimMenu" onclick="${this.updateSettings.bind(this, this.settings, node)}">
            <label for="hideClaimMenu">Hide Claim Menu</label>
            <input type="checkbox" id="hideChildIndicator" bind="hideChildIndicator" value="hideChildIndicator" onclick="${this.updateSettings.bind(this, this.settings, node)}">
            <label for="hideChildIndicator">Hide Child Indicator</label>
            <input type="checkbox" id="showCompetition" bind="showCompetition" value="showCompetition" onclick="${this.updateSettings.bind(this, this.settings, node)}">
            <label for="showCompetition">Show Competition</label>

            <input value="${this.replaceAll(JSON.stringify(this.root), '\'', '&#39;')}"></input>

            <div  onclick="${this.firebase.SignIn.bind(this)}">
                    [${this.userName} ]
            </div>
       </div>
        <div>${node}</div>
        <div class="settingsButton" onclick="${this.toggleSettings.bind(this, node)}">
            ⚙
        </div>
    </div>`;
  }

  replaceAll(target: string, search: string, replacement: string): string {
      return target.split(search).join(replacement);
  }

  clearDisplayState(scores: Dict<Score>): void {
      for (let scoreId in scores) {
          if (scores.hasOwnProperty(scoreId)) {
              scores[scoreId].displayState = "notSelected";
          }
      }
  }

  //Set state of claims every time selected score change
  setDisplayStateLoop(score: Score, claims: Dict<Claim>, scores: Dict<Score>, selectedScore: Score): Score {
      // Compare the param score whit selected Score if they are the same set score state to "selected".

      if (score == selectedScore)
          score.displayState = "selected";

      for (let childId of claims[score.claimId].childIds) {
          let childScore = scores[childId];
          //process the children first/
          this.setDisplayStateLoop(childScore, claims, scores, selectedScore);

          if (childScore == selectedScore) {
              score.displayState = "parent";
              //Set Siblings
              for (let siblingId of claims[score.claimId].childIds) {
                  let siblingScore = scores[siblingId];
                  if (siblingScore.displayState != "selected")
                      siblingScore.displayState = "sibling";
              }
          }

          if (childScore.displayState == "ancestor" || childScore.displayState == "parent")
              score.displayState = "ancestor";

          if (score == selectedScore)
              childScore.displayState = "child";
      }
      return score;
  }

  //Check for animating numbers of the Reason Root's main claim, this should be on Reason Root component
  animateNumbers(scores: any): boolean{
    var found = false;
    for (var scoreId in scores) {
      var s = scores[scoreId];
      if (s.weightedPercentage != s.animatedWeightedPercentage) {
        found = true;
        var difference = s.weightedPercentage - s.animatedWeightedPercentage
        if (Math.abs(difference) < .01)
          s.animatedWeightedPercentage = s.weightedPercentage
        else
          s.animatedWeightedPercentage += difference / 100;
      }
    }
    return found;
    // if (found) setTimeout(() => this.update(), 100);
    }

    // Settings is part of the Reason Root's main claim, this should be on Reason Root component
    updateSettings(settings: any, event: any, node: any): void {
        settings[event.srcElement.getAttribute("bind")] = event.srcElement.checked;
        this.update(node);
        if (event) event.stopPropagation();
    }

    toggleSettings(event: Event, node: any): void {
        this.settingsVisible = !this.settingsVisible;
        this.update(node);
    }

    appendReasonRoot(mainId){
      // let element = document.createElement("claim");
      let element
      this.firebase.getDataById(mainId)
        .then(data => {
          element.setAttribute("root", data);
        })
       .then(() => {
         document.body.appendChild(element);
       }
     );
    };

}
