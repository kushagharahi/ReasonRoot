class Claim {
    /** a base62 GUID string to identify each claim */
    id: string;

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
        this.id = id || newId();
        if (isProMain !== undefined) this.isProMain = isProMain
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


