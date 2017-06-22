import Root from './Root';
import Claim from './Claim';
import Operation from './Operation';


﻿export default class Score {
    claimId: string;
    selectedScore: Score;
    operation: Operation = new Operation();
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

    select(score: Score, e: Event): void {
        if (score != this.selectedScore) {
            this.selectedScore = score;
            this.operation.setDisplayState();
            this.operation.update();
        }
    }
}

type DisplayState = "newClaim" | "notSelected" | "parent" | "ancestor" | "selected"| "selected editing" | "child" | "sibling";
