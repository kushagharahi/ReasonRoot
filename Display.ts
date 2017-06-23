import Setting from './Setting';
import Root from './Root';
import Node from './Node';
import Auth from './Auth';

export default class Display{
  userName: string = 'Sign In';
  render: any;
  setting: Setting;
  settingsVisible: boolean = false;
  auth: Auth;

  update(node: any, settings: any, root: Root): void {
    // if (!this.settings.noAutoSave)
    //     localStorage.setItem(this.savePrefix + this.root.mainId, JSON.stringify(this.scores));

    this.render`
    <div class="${'rr' +
        (settings.hideScore ? ' hideScore' : '') +
        (settings.hidePoints ? ' hidePoints' : '') +
        (settings.hideClaimMenu ? ' hideClaimMenu' : '') +
        (settings.hideChildIndicator ? ' hideChildIndicator' : '') +
        (settings.showSiblings ? ' showSiblings' : '') +
        (settings.showCompetition ? ' showCompetition' : '')

        }">
        <div class = "${'settingsHider ' + (this.settingsVisible ? 'open' : '')}">
            <input type="checkbox" id="hideScore" bind="hideScore" value="hideScore" onclick="${this.setting.update.bind(this, settings)}">
            <label for="hideScore">Hide Score</label>
            <input type="checkbox" id="hidePoints" bind="hidePoints" value="hidePoints" onclick="${this.setting.update.bind(this, settings)}">
            <label for="hidePoints">Hide Points</label>
            <input type="checkbox" id="noAutoSave" bind="noAutoSave" value="noAutoSave" onclick="${this.setting.update.bind(this, settings)}">
            <label for="noAutoSave">No Auto Save</label>
            <input type="checkbox" id="showSiblings" bind="showSiblings" value="showSiblings" onclick="${this.setting.update.bind(this, settings)}">
            <label for="showSiblings">Show Sibllings</label>
            <input type="checkbox" id="hideClaimMenu" bind="hideClaimMenu" value="hideClaimMenu" onclick="${this.setting.update.bind(this, settings)}">
            <label for="hideClaimMenu">Hide Claim Menu</label>
            <input type="checkbox" id="hideChildIndicator" bind="hideChildIndicator" value="hideChildIndicator" onclick="${this.setting.update.bind(this, settings)}">
            <label for="hideChildIndicator">Hide Child Indicator</label>
            <input type="checkbox" id="showCompetition" bind="showCompetition" value="showCompetition" onclick="${this.setting.update.bind(this, settings)}">
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

  }

  replaceAll(target: string, search: string, replacement: string): string {
      return target.split(search).join(replacement);
  };
}
