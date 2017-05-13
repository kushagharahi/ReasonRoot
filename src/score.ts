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

    open: boolean;

    constructor(claim?: Claim) {
        if (claim) this.claim = claim;
    }

}