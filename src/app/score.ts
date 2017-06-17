import Root from './Root.ts';
import Claim from './Claim.ts';


﻿export default class Score {
    claimId: string;

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
        if (claim) this.claimId = claim.claimId;
    }

    isMain: boolean;
    isEditing: boolean;
}

type DisplayState = "newClaim" | "notSelected" | "parent" | "ancestor" | "selected"| "selected editing" | "child" | "sibling";
