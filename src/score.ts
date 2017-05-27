class Score {
    claim: Claim;

    /**  */
    confidencePro: number;
    confidenceCon: number;

    /**  */
    importancePro: number;
    importanceCon: number;
    importanceValue: number;

    /**  */
    siblingWeight: number;

    /**  */
    weightPro: number;
    weightCon: number;
    weightDif: number;

    /**  */
    maxAncestorWeight: number;

    /**  */
    mainPercent: number;

    /** */
    weightedPercentage: number;

    /** */
    generation: number;

    /** */
    open: boolean;

    /** */
    numDesc: number;

    /** */
    animatedWeightedPercentage

    /** */
    displayState: DisplayState;

    /** */
    constructor(claim?: Claim) {
        if (claim) this.claim = claim;
    }
    
    isMain: boolean;
    isEditing: boolean;
}

type DisplayState = "hideClaim" | "parent" | "ancestor" | "selected"| "selected editing" | "child";

//enum DisplayState { None, Parent, Ancestor, Selected, Child };