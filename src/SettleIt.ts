class Dict<T> {
    [K: string]: T;
}

function createDict(claims: Dict<Claim>, dict?: Dict<Score>): Dict<Score> {
    if (dict === undefined) dict = new Dict<Score>();

    for (let claimId in claims) {
        if (claims.hasOwnProperty(claimId)) {
            if (dict[claimId] === undefined) {
                let newScore = new Score();
                newScore.claimId = claimId;
                dict[claimId] = newScore;
            }
        }
    }



    // for (let claim of claims) {
    //     if (dict[claim.id] === undefined) {
    //         let newScore = new Score();
    //         newthis.claims[score.claimId] = claim;
    //         dict[claim.id] = newScore;
    //     }
    // }
    return dict;
}

class SettleIt {

    //The variable s always means score object which contains a claim
    public shouldSort: boolean;
    public scores: Dict<Score>;
    public mainId: string;
    public claims: Dict<Claim>;

    constructor() { }

    public calculate(mainId?: string, claims?: Dict<Claim>, scores?: Dict<Score>, shouldSort?: boolean) {
        this.claims = claims;
        if (mainId !== undefined) this.mainId = mainId;
        if (scores !== undefined) this.scores = scores;
        if (shouldSort !== undefined) this.shouldSort = shouldSort;
        let score = scores[mainId];
        let claim = claims[mainId];
        this.step1ValidateClaims(score);
        this.step2AscendClaims(score);
        this.step3DescendClaims(score);
        this.step4AscendClaims(score);

        return {
            mainId: mainId,
            claims: claims,
            scores: scores
        }
    }

    public step1ValidateClaims(score: Score, parent?: Score) {

        //todo make this a 62bit GUID [a-z,A-Z,0-9]

        //if (this.claims[score.claimId].id == undefined) this.claims[score.claimId].id = ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
        this.calculateProMainParent(score, parent);

        this.calculateGeneration(score, parent);
        let claim = this.claims[score.claimId]
        if (claim.childIds == undefined) claim.childIds = new Array<string>();
        for (let childId of claim.childIds) {
            if (this.claims[childId].disabled) continue; //skip if diabled
            this.step1ValidateClaims(this.scores[childId], score);
        }
    }

    private calculateGeneration(score: Score, parent?: Score) {
        if (score.generation == undefined)
            score.generation = 0;

        if (parent)
            score.generation = parent.generation + 1;
    }

    private calculateProMainParent(score: Score, parent?: Score) {
        var parentIsProMain = true;
        if (parent && this.claims[parent.claimId].isProMain !== undefined)
            parentIsProMain = this.claims[parent.claimId].isProMain;



        //If neither exist then default to proMain
        if (this.claims[score.claimId].isProMain === undefined && this.claims[score.claimId].isProParent === undefined) {
            this.claims[score.claimId].isProMain = true;
            this.claims[score.claimId].isProParent = this.claims[score.claimId].isProMain == parentIsProMain;
        }

        //if both exist then assume isProMain is correct
        if (this.claims[score.claimId].isProMain !== undefined && this.claims[score.claimId].isProParent !== undefined) {
            this.claims[score.claimId].isProParent = this.claims[score.claimId].isProMain == parentIsProMain;
        }

        //if only isProMain exists then set isProParent
        if (this.claims[score.claimId].isProMain !== undefined && this.claims[score.claimId].isProParent === undefined) {
            this.claims[score.claimId].isProParent = this.claims[score.claimId].isProMain == parentIsProMain;
        }

        //if only isProParent exists then set isProMain
        if (this.claims[score.claimId].isProMain === undefined && this.claims[score.claimId].isProParent !== undefined) {
            if (this.claims[score.claimId].isProParent)
                this.claims[score.claimId].isProMain = parentIsProMain;
            else
                this.claims[score.claimId].isProMain = !parentIsProMain;
        }

    }


    private step2AscendClaims(score: Score, parent?: Score) {
        score.siblingWeight = 1; // This may be wrong. Was only set if it has not parent but now there isn't a parent id
        for (let childId of this.claims[score.claimId].childIds) {
            if (this.claims[score.claimId].disabled) continue; //skip if diabled
            this.step2AscendClaims(this.scores[childId], score);
        }
        if (this.claims[score.claimId].affects == undefined) this.claims[score.claimId].affects = "AverageTheConfidence";

        this.calculateSiblingWeight(score);
        this.calculateConfidence(score);
        this.calculateImportance(score);
        this.countNumDesc(score);
    }

    /** Find the sibling with the most weight (so later you can make them all match)
     * max children ( pro + con ) */
    private calculateSiblingWeight(score: Score) {
        var maxPoints = 0;
        //Figure out what is the highest number of points among all the children
        for (let childId of this.claims[score.claimId].childIds) {
            if (this.claims[score.claimId].disabled) continue; //skip if diabled
            let child = this.scores[childId];
            if (this.claims[child.claimId].affects != "Importance") {
                var childsTotal = child.confidencePro + child.confidenceCon;
                maxPoints = Math.max(childsTotal, maxPoints);
            }
        }

        //Figure out the multiplier so that all the children have the same weight
        for (let childId of this.claims[score.claimId].childIds) {
            if (this.claims[score.claimId].disabled) continue; //skip if diabled
            let child = this.scores[childId];
            if (this.claims[child.claimId].affects != "Importance") {
                var childsTotal = child.confidencePro + child.confidenceCon;
                if (childsTotal == 0)
                    child.siblingWeight = 0;
                else
                    child.siblingWeight = maxPoints / childsTotal;
            }
            //If it not a confidence (is an importance) then default the weight to 1
            if (child.siblingWeight == undefined)
                child.siblingWeight = 1;
        }
    }

    private calculateConfidence(score: Score) {
        var avgConfPro: number = 0;
        var avgConfCon: number = 0;
        var maxConfPro: number = 0;
        var maxConfCon: number = 0;
        var found: boolean = false;
        //Add up all the children points
        for (let childId of this.claims[score.claimId].childIds) {
            if (this.claims[score.claimId].disabled) continue; //skip if diabled
            let child = this.scores[childId];
            if (this.claims[child.claimId].affects == "AverageTheConfidence") {
                found = true;

                avgConfPro += child.confidencePro * child.importanceValue * child.siblingWeight;
                avgConfCon += child.confidenceCon * child.importanceValue * child.siblingWeight;
            }
            if (this.claims[child.claimId].affects == "MaximumOfConfidence") {
                found = true;
                var tempPro = child.confidencePro * child.importanceValue * child.siblingWeight;
                var tempCon = child.confidenceCon * child.importanceValue * child.siblingWeight;
                if (tempPro - tempCon > maxConfPro - maxConfCon) {
                    var maxConfPro = tempPro;
                    var maxConfCon = tempCon;
                }
            }
        }

        //Calculate the Pro and Con
        if (found) {
            score.confidencePro = avgConfPro + maxConfPro;
            score.confidenceCon = avgConfCon + maxConfCon;
        } else { // Set the defaults if no confidence items were found
            if (this.claims[score.claimId].isProMain) {
                score.confidencePro = 1;
                score.confidenceCon = 0;
            } else {
                score.confidencePro = 0;
                score.confidenceCon = 1;
            }
        }

        //Set the max Confidence
        if (this.claims[score.claimId].isProMain && this.claims[score.claimId].maxConf) {
            if (score.confidencePro / (score.confidencePro + score.confidenceCon) > (this.claims[score.claimId].maxConf / 100)) {
                score.confidenceCon = 10 - (this.claims[score.claimId].maxConf / 10);
                score.confidencePro = this.claims[score.claimId].maxConf / 10;
            }
        }
        if (!this.claims[score.claimId].isProMain && this.claims[score.claimId].maxConf) {
            if (score.confidenceCon / (score.confidenceCon + score.confidencePro) > (this.claims[score.claimId].maxConf / 100)) {
                score.confidencePro = 10 - (this.claims[score.claimId].maxConf / 10)
                score.confidenceCon = this.claims[score.claimId].maxConf / 10
            }
        }


        //prevents stataments form  if not the top statement
        if (score.generation != 0) {
            if (this.claims[score.claimId].isProMain && score.confidenceCon > score.confidencePro)
                score.confidencePro = score.confidenceCon
            if (!this.claims[score.claimId].isProMain && score.confidencePro > score.confidenceCon)
                score.confidenceCon = score.confidencePro
        }
    }

    /** This performs Importance calculations for both Claims that affect Confidence and Importance.
     * Confidence: sum children(importance) 
     * Importance: (score.importancePro + 1) / (score.importanceCon + 1) */
    private calculateImportance(score: Score) {
        if (this.claims[score.claimId].affects == "Importance") {
            score.importancePro = score.confidencePro;
            score.importanceCon = score.confidenceCon;
        } else {
            var proImportance: number = 0;
            var conImportance: number = 0;
            //Add up all the importance children points
            for (let childId of this.claims[score.claimId].childIds) {
                if (this.claims[score.claimId].disabled) continue; //skip if diabled
                let child = this.scores[childId];
                if (this.claims[child.claimId].affects == "Importance") {
                    proImportance += child.importancePro;
                    conImportance += child.importanceCon;
                }
            }
            score.importancePro = proImportance;
            score.importanceCon = conImportance;
        }
        score.importanceValue = this.safeDivide(score.importancePro + 1, score.importanceCon + 1);
    }

    /** Count the number of descendants */
    private countNumDesc(score: Score) {
        score.numDesc = 0;
        for (let childId of this.claims[score.claimId].childIds) {
            if (this.claims[score.claimId].disabled) continue; //skip if diabled
            let child = this.scores[childId];
            if (child.numDesc)
                score.numDesc += child.numDesc + 1;
            else
                score.numDesc += 1;
        }
    }

    private step3DescendClaims(score: Score, parent?: Score) {
        this.calculatemaxAncestorWeight(score, parent);
        score.weightPro = score.confidencePro * score.importanceValue * score.maxAncestorWeight;
        score.weightCon = score.confidenceCon * score.importanceValue * score.maxAncestorWeight;
        score.weightDif = score.weightPro - score.weightCon;
        this.calculateMainPercent(score, parent);
        for (let childId of this.claims[score.claimId].childIds) {
            if (this.claims[score.claimId].disabled) continue; //skip if diabled
            let child = this.scores[childId];
            this.step3DescendClaims(child, score);
        }
    }

    private step4AscendClaims(score: Score, parent?: Score) {
        for (let childId of this.claims[score.claimId].childIds) {
            if (this.claims[score.claimId].disabled) continue; //skip if diabled
            let child = this.scores[childId];
            this.step4AscendClaims(child, score);
        }
        this.calculateWeightedPercentage(score, parent);
        this.sort(score, parent);

    }

    /** Find the maximum sibling weight of all my ancestors
     * max(parent.maxAncestorWeight, s.siblingWeight) */
    private calculatemaxAncestorWeight(score: Score, parent: Score) {
        if (parent) {
            score.maxAncestorWeight = Math.max(parent.maxAncestorWeight, score.siblingWeight);
        }
        else {
            score.maxAncestorWeight = 1;
        }
    }

    private calculateMainPercent(score: Score, parent: Score) {
        if (parent) {
            if (this.claims[score.claimId].affects == "Importance")
                score.mainPercent = parent.mainPercent * (this.safeDivide(score.confidencePro + score.confidenceCon, parent.confidencePro + parent.confidenceCon))
            else
                score.mainPercent = parent.mainPercent * (this.safeDivide(score.weightPro + score.weightCon, parent.weightPro + parent.weightCon))
        } else {
            score.mainPercent = 1;
        }
    }

    private calculateWeightedPercentage(score: Score, parent: Score) {
        var WeightedPluses = 0;
        var WeightedMinuses = 0;
        var found = false;
        for (let childId of this.claims[score.claimId].childIds) {
            if (this.claims[score.claimId].disabled) continue; //skip if disabled
            found = true;
            let child = this.scores[childId];
            if (child.weightDif > 0)
                WeightedPluses += child.weightDif
            else
                WeightedMinuses += child.weightDif
        }

        score.animatedWeightedPercentage = score.weightedPercentage;
        if (found) {
            if (WeightedPluses - WeightedMinuses === 0)
                score.weightedPercentage = 0;
            else
                score.weightedPercentage = WeightedPluses / (WeightedPluses - WeightedMinuses);
        } else score.weightedPercentage = 1;

        //Prevent NAN first time through by setting animatedWeightedPercentage if it is the first time through
        if (score.animatedWeightedPercentage == undefined)
            score.animatedWeightedPercentage = score.weightedPercentage;
    }

    private sort(score: Score, parent: Score) {
        if (!this.shouldSort) return;
        this.claims[score.claimId].childIds.sort((a, b) =>
            Math.abs(this.scores[b].weightDif) - Math.abs(this.scores[a].weightDif)
        );
    }

    private safeDivide(numerator: number, denomerator: number): number {
        if (denomerator == 0)// Avoid division by zero
            return 0;
        else
            return numerator / denomerator;
    }

}
