class Statement {
    /** a base62 GUID string to identify each statement */
    id: string;

    /** The text of the statement with the claim. May include markdown in the future. */
    content: string;

    /** very short unique text for displaying of charts and other areas with limited space. */
    label: string;

    /** Does this statement support the main top statement in this graph (true) or disput it (false) */
    isProMain: boolean = true;

    /** Does this statement support it's parent statement in this graph (true) or disput it (false) */
    isProParent: boolean;

    /** Does this statement affect the confidence or the importance of it's parent */
    affects: Affects = "AverageTheConfidence";

    /** an array of statment id strings representing the ids of this statements children */
    childIds: string[] = [];

    constructor(id?: string, isProMain?: boolean) {
        this.id = id || newId();
        if (isProMain !== undefined) this.isProMain = isProMain
    }

}

type Affects = "AverageTheConfidence" | "MaximumOfConfidence" | "Importance";

// inspired by http://stackoverflow.com/a/27872144/96062
function newId(): string {
    var len = 22;
    var str = "";
    for (var i = 0; i < len; i++) {
        var rand = Math.floor(Math.random() * 62);
        var charCode = rand += rand > 9 ? (rand < 36 ? 55 : 61) : 48;
        str += String.fromCharCode(charCode);
    }
    return str;
}


