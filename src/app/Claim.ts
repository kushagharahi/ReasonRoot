declare const require: any;
const firebase = require('firebase');

import Score from './Score';
import Setting from './Setting';
import Dict from './Dict';
import Root from './Root';


type WhichCopy = "original" | "local" | "suggestion";

﻿export default class Claim {
    /** a base62 GUID string to identify each claim */
    claimId: string;
    selectedScore: Score;
    claims: Dict<Claim>;
    scores: Dict<Score>;
    settings: any = {};
    whichCopy: WhichCopy;
    setting: Setting = new Setting();
    canWrite: boolean;
    root: Root = new Root();

    /** The text of the claim with the claim. May include markdown in the future. */
    content: string = "New Claim";

    /** very short unique text for displaying of charts and other areas with limited space. */
    label: string;

    /** Does this claim support the main top claim in this graph (true) or disput it (false) */
    isProMain: boolean = true;

    /** Does this claim support it's parent claim in this graph (true) or disput it (false) */
    isProParent: boolean;

    /** Does this claim affect the confidence or the importance of it's parent */
    affects: Affects = "AverageTheConfidence";

    /** an array of statment id strings representing the ids of this claims children */
    childIds: string[] = [];

    /** the maximum confidence allowed on this statement*/
    maxConf: number;

    /** */
    disabled: boolean;

    citationUrl: string = "";
    citation: string = "";

    constructor(id?: string, isProMain?: boolean) {
        this.claimId = id || newId();
        if (isProMain !== undefined) this.isProMain = isProMain
    }


    remove(claim: Claim, claims: Dict<Claim>, parentScore: Score, event: Event): void {
        var index = claims[parentScore.claimId].childIds.indexOf(claim.claimId);
        if (index > -1) claims[parentScore.claimId].childIds.splice(index, 1);
        this.selectedScore = parentScore;

        // this.operation.calculate();
        // this.operation.setDisplayState();
        // this.operation.update();
    }

    edit(score: Score, event?: Event): void {
        this.settings.isEditing = !this.settings.isEditing;
        // this.operation.update();
        if (event) event.stopPropagation();
    }

    add(parentScore: Score, isProMain: boolean, scores: Dict<Score>, claims: Dict<Claim>) {
      let newClaim: Claim = new Claim();
      newClaim.isProMain = isProMain;
      let newScore: Score = new Score(newClaim)
      scores[newClaim.claimId] = newScore;
      claims[parentScore.claimId].childIds.unshift(newClaim.claimId);
      claims[newClaim.claimId] = newClaim;
      newScore.displayState = "notSelected";

      this.selectedScore = newScore;
      this.settings.isEditing = true;
    }

    update(claim: Claim, event: Event) {
        let inputs: any = event.srcElement.parentElement.querySelectorAll('input');
        for (let input of inputs) {
            var bindName = input.getAttribute("bind")
            if (bindName) {
                if (input.type == "checkbox")
                    claim[bindName] = input.checked;
                else
                    claim[bindName] = input.value;
            }
        }

        //to do Update the storage
        if (this.whichCopy == "original")
            if (this.canWrite)
                firebase.database().ref('roots/' + this.root.mainId + '/claims/' + claim.claimId).set(claim);
            else {
                //Change over to a copy and set it up
            }


        // //update the UI
        // this.operation.calculate();
        // this.operation.update();
    }

}

type Affects = "AverageTheConfidence" | "MaximumOfConfidence" | "Importance";

function newId(): string {
    //take the current date and convert to bas 62
    let decimal = new Date().getTime();
    let s = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let result = "";
    while (decimal >= 1) {
        result = s[(decimal - (62 * Math.floor(decimal / 62)))] + result;
        decimal = Math.floor(decimal / 62);
    }

    //Add 5 extra random characters in case multiple ids are creates at the same time
    result += Array(5).join().split(',').map(function () {
        return s[(Math.floor(Math.random() * s.length))];
    }).join('');

    return result
}
