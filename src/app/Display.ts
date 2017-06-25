import Root from './Root';
//import Node from './Node';
import Auth from './Auth';
import Dict from './Dict';
import Score from './Score';
import Claim from './Claim';
import Setting from './Setting';

export default class Display{
  scores: Dict<Score>;
  claims: Dict<Claim>;
  userName: string = 'Sign In';
  render: any;
  settings: any = {};
  settingsVisible: boolean = false;
  setting: Setting = new Setting();
  root: Root = new Root();
  auth: Auth = new Auth();
  selectedScore: Score;
  mainScore: Score;

  constructor(mainScore: Score, claims: Dict<Claim>, scores: Dict<Score>, settings: any, render: any, selectedScore: Score){
    this.mainScore = mainScore;
    this.claims = claims;
    this.scores = scores;
    this.settings = settings;
    this.render = render;
    this.selectedScore = selectedScore;
  }

  update(node: any): void {
    console.log("update");
    let root = this.root;

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

            <input value="${this.replaceAll(JSON.stringify(root), '\'', '&#39;')}"></input>

            <div  onclick="${this.auth.signIn.bind(this)}">
                    [${this.userName} ]
            </div>
       </div>
        <div>${node}</div>
        <div class="settingsButton" onclick="${this.setting.toggle.bind(this.settingsVisible,this)}">
            ⚙
        </div>
    </div>`;
    //console.log("update" + node);

  }

  replaceAll(target: string, search: string, replacement: string): string {
      return target.split(search).join(replacement);
  }

  clearDisplayState(): void {
    //console.log("clearDisplayState");
      for (let scoreId in this.scores) {
          if (this.scores.hasOwnProperty(scoreId)) {
              this.scores[scoreId].displayState = "notSelected";
          }
      }
  }

  setDisplayState(): void {
      //console.log("setDisplayState");
      this.clearDisplayState();
      //this.setDisplayStateLoop(this.mainScore);
  }

  setDisplayStateLoop(score: Score, selectedScore: Score): Score {
      //console.log("setDisplayStateLoop");
      // Compare the param score whit
      //console.log(score.claimId);
      //console.log(selectedScore.claimId);
      if (score == selectedScore)
          score.displayState = "selected";

      for (let childId of this.claims[score.claimId].childIds) {
          let childScore = this.scores[childId];
          //process the children first/
          this.setDisplayStateLoop(childScore, selectedScore);

          if (childScore == selectedScore) {
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

          if (score == selectedScore)
              childScore.displayState = "child";
      }
      return score;
  }

}
