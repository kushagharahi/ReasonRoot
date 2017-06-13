module.exports = class Claim {
    constructor(id, isProMain) {
        /** The text of the claim with the claim. May include markdown in the future. */
        this.content = "New Claim";
        /** Does this claim support the main top claim in this graph (true) or disput it (false) */
        this.isProMain = true;
        /** Does this claim affect the confidence or the importance of it's parent */
        this.affects = "AverageTheConfidence";
        /** an array of statment id strings representing the ids of this claims children */
        this.childIds = [];
        this.citationUrl = "";
        this.citation = "";
        this.claimId = id || newId();
        if (isProMain !== undefined)
            this.isProMain = isProMain;
    }
}
function newId() {
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
    return result;
}
//# sourceMappingURL=Claim.js.map
