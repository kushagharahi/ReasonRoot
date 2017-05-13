class Dict<T> {
    [K: string]: T;
}

function createDict(statements: Claim[], dict? : Dict<Score>): Dict<Score> {
    if (dict === undefined) dict = new Dict<Score>();
    for (let statement of statements) {
        if (dict[statement.id] === undefined)
        {
            let newScore = new Score();
            newScore.statement = statement;
            dict[statement.id] = newScore;
        }
    }
    return dict;
}

class SettleIt {

    //The variable s always means score object which contains a statement
    public shouldSort: boolean;
    public dict: Dict<Score>;
    public s: Score;

    constructor() { }

    public calculate(s?: Score, dict?: Dict<Score>, shouldSort?: boolean) {
        if (s !== undefined) this.s = s;
        if (dict !== undefined) this.dict = dict;
        if (shouldSort !== undefined) this.shouldSort = shouldSort;

        this.step1ValidateStatements(s);
        this.step2AscendStatements(s);
        this.step3DescendStatements(s);
        this.step4AscendStatements(s);
    }

    public step1ValidateStatements(s: Score, parent?: Score) {

        //todo make this a 62bit GUID [a-z,A-Z,0-9]
        if (s.statement.id == undefined) s.statement.id = ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
        this.calculateProMainParent(s, parent);

        this.calculateGeneration(s, parent);
        for (let childId of s.statement.childIds) {
            this.step1ValidateStatements(this.dict[childId], s);
        }
    }

    private calculateGeneration(s: Score, parent?: Score) {
        if (s.generation == undefined)
            s.generation = 0;

        if (parent)
            s.generation = parent.generation + 1;
    }

    private calculateProMainParent(s: Score, parent?: Score) {
        var parentIsProMain = true;
        if (parent && parent.statement.isProMain !== undefined)
            parentIsProMain = parent.statement.isProMain;



        //If neither exist then default to proMain
        if (s.statement.isProMain === undefined && s.statement.isProParent === undefined) {
            s.statement.isProMain = true;
            s.statement.isProParent = s.statement.isProMain == parentIsProMain;
        }

        //if both exist then assume isProMain is correct
        if (s.statement.isProMain !== undefined && s.statement.isProParent !== undefined) {
            s.statement.isProParent = s.statement.isProMain == parentIsProMain;
        }

        //if only isProMain exists then set isProParent
        if (s.statement.isProMain !== undefined && s.statement.isProParent === undefined) {
            s.statement.isProParent = s.statement.isProMain == parentIsProMain;
        }

        //if only isProParent exists then set isProMain
        if (s.statement.isProMain === undefined && s.statement.isProParent !== undefined) {
            if (s.statement.isProParent)
                s.statement.isProMain = parentIsProMain;
            else
                s.statement.isProMain = !parentIsProMain;
        }

    }


    private step2AscendStatements(s: Score, parent?: Score) {
        s.siblingWeight = 1; // This may be wrong. Was only set if it has not parent but now there isn't a parent id
        for (let childId of s.statement.childIds) {
            this.step2AscendStatements(this.dict[childId], s);
        }
        if (s.statement.affects == undefined) s.statement.affects = "AverageTheConfidence";

        this.calculateSiblingWeight(s);
        this.calculateConfidence(s);
        this.calculateImportance(s);
    }

    /** Find the sibling with the most weight (so later you can make them all match)
     * max children ( pro + con ) */
    private calculateSiblingWeight(s: Score) {
        var maxPoints = 0;
        //Figure out what is the highest number of points among all the children
        for (let childId of s.statement.childIds) {
            let child = this.dict[childId];
            if (child.statement.affects != "Importance") {
                var childsTotal = child.confidencePro + child.confidenceCon;
                maxPoints = Math.max(childsTotal, maxPoints);
            }
        }

        //Figure out the multiplier so that all the children have the same weight
        for (let childId of s.statement.childIds) {
            let child = this.dict[childId];
            if (child.statement.affects != "Importance") {
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

    private calculateConfidence(s: Score) {
        var avgConfPro: number = 0;
        var avgConfCon: number = 0;
        var maxConfPro: number = 0;
        var maxConfCon: number = 0;
        var found: boolean = false;
        //Add up all the children points
        for (let childId of s.statement.childIds) {
            let child = this.dict[childId];
            if (child.statement.affects == "AverageTheConfidence") {
                found = true;

                avgConfPro += child.confidencePro * child.importanceValue * child.siblingWeight;
                avgConfCon += child.confidenceCon * child.importanceValue * child.siblingWeight;
            }
            if (child.statement.affects == "MaximumOfConfidence") {
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
            s.confidencePro = avgConfPro + maxConfPro;
            s.confidenceCon = avgConfCon + maxConfCon;

            //prevents stataments form reversing
            if (s.statement.isProParent && s.confidenceCon > s.confidencePro)
                s.confidenceCon = s.confidencePro
            if (!s.statement.isProParent && s.confidencePro > s.confidenceCon)
                s.confidencePro = s.confidenceCon

        } else { // Set the defaults if no confidence items were found
            if (s.statement.isProMain) {
                s.confidencePro = 1;
                s.confidenceCon = 0;
            } else {
                s.confidencePro = 0;
                s.confidenceCon = 1;
            }
        }
    }

    /** This performs Importance calculations for both Statements that affect Confidence and Importance.
     * Confidence: sum children(importance) 
     * Importance: (s.importancePro + 1) / (s.importanceCon + 1) */
    private calculateImportance(s: Score) {
        if (s.statement.affects == "Importance") {
            s.importancePro = s.confidencePro;
            s.importanceCon = s.confidenceCon;
        } else {
            var proImportance: number = 0;
            var conImportance: number = 0;
            //Add up all the importance children points
            for (let childId of s.statement.childIds) {
                let child = this.dict[childId];
               if (child.statement.affects == "Importance") {
                    proImportance += child.importancePro;
                    conImportance += child.importanceCon;
                }
            }
            s.importancePro = proImportance;
            s.importanceCon = conImportance;
        }
        s.importanceValue = this.safeDivide(s.importancePro + 1, s.importanceCon + 1);
    }

    private step3DescendStatements(s: Score, parent?: Score) {
        this.calculatemaxAncestorWeight(s, parent);
        s.weightPro = s.confidencePro * s.importanceValue * s.maxAncestorWeight;
        s.weightCon = s.confidenceCon * s.importanceValue * s.maxAncestorWeight;
        s.weightDif = s.weightPro - s.weightCon;
        this.calculateParentWeightedDiferenceText(s);
        this.calculateMainPercent(s, parent);
        for (let childId of s.statement.childIds) {
            let child = this.dict[childId];
            this.step3DescendStatements(child, s);
        }
    }

    private step4AscendStatements(s: Score, parent?: Score) {
        for (let childId of s.statement.childIds) {
            let child = this.dict[childId];
            this.step4AscendStatements(child, s);
        }
        this.calculateWeightedPercentage(s, parent);
        this.sort(s, parent);

    }

    /** Find the maximum sibling weight of all my ancestors
     * max(parent.maxAncestorWeight, s.siblingWeight) */
    private calculatemaxAncestorWeight(s: Score, parent: Score) {
        if (parent) {
            s.maxAncestorWeight = Math.max(parent.maxAncestorWeight, s.siblingWeight);
        }
        else {
            s.maxAncestorWeight = 1;
        }
    }

    /** Adds the proper math sign and converts the disDisplay to a string
     * Affects confidence: + or - , importance ? or ? */
    private calculateParentWeightedDiferenceText(s: Score) {
        var sign = '';
        var value: number;
        if (s.statement.affects == "Importance") {
            sign = !s.statement.isProParent ? '?' : '?';
            value = this.safeDivide(s.importancePro + 1, s.importanceCon + 1);
        } else {
            var value = s.weightDif
            sign = value < 0 ? '' : '+';
            if (value == 0)
                sign = s.statement.isProMain ? '+' : '-';
        }
    }

    private calculateMainPercent(s: Score, parent: Score) {
        if (parent) {
            if (s.statement.affects == "Importance")
                s.mainPercent = parent.mainPercent * (this.safeDivide(s.confidencePro + s.confidenceCon, parent.confidencePro + parent.confidenceCon))
            else
                s.mainPercent = parent.mainPercent * (this.safeDivide(s.weightPro + s.weightCon, parent.weightPro + parent.weightCon))
        } else {
            s.mainPercent = 1;
        }
    }

    private calculateWeightedPercentage(s: Score, parent: Score) {
        var WeightedPluses = 0;
        var WeightedMinuses = 0;
        var found = false;
        for (let childId of s.statement.childIds) {
            found = true;
            let child = this.dict[childId];
            if (child.weightDif > 0)
                WeightedPluses += child.weightDif
            else
                WeightedMinuses += child.weightDif
        }
        if (found) {
            if (WeightedPluses - WeightedMinuses === 0)
                s.weightedPercentage = 0;
            else
                s.weightedPercentage = WeightedPluses / (WeightedPluses - WeightedMinuses);
        } else s.weightedPercentage = 1;

    }

    private sort(s: Score, parent: Score) {
        if (!this.shouldSort) return;
        s.statement.childIds.sort((a, b) =>
            Math.abs(this.dict[b].weightDif) - Math.abs(this.dict[a].weightDif)
        );
    }

    private safeDivide(numerator: number, denomerator: number): number {
        if (denomerator == 0)// Avoid division by zero
            return 0;
        else
            return numerator / denomerator;
    }

}
