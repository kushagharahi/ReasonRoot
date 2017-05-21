var Dict = (function () {
    function Dict() {
    }
    return Dict;
}());
function createDict(claims, dict) {
    if (dict === undefined)
        dict = new Dict();
    for (var _i = 0, claims_1 = claims; _i < claims_1.length; _i++) {
        var claim = claims_1[_i];
        if (dict[claim.id] === undefined) {
            var newScore = new Score();
            newScore.claim = claim;
            dict[claim.id] = newScore;
        }
    }
    return dict;
}
var SettleIt = (function () {
    function SettleIt() {
    }
    SettleIt.prototype.calculate = function (score, dict, shouldSort) {
        if (score !== undefined)
            this.score = score;
        if (dict !== undefined)
            this.dict = dict;
        if (shouldSort !== undefined)
            this.shouldSort = shouldSort;
        this.step1ValidateClaims(score);
        this.step2AscendClaims(score);
        this.step3DescendClaims(score);
        this.step4AscendClaims(score);
    };
    SettleIt.prototype.step1ValidateClaims = function (score, parent) {
        //todo make this a 62bit GUID [a-z,A-Z,0-9]
        if (score.claim.id == undefined)
            score.claim.id = ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
        this.calculateProMainParent(score, parent);
        this.calculateGeneration(score, parent);
        for (var _i = 0, _a = score.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.dict[childId].claim.disabled)
                continue; //skip if diabled
            this.step1ValidateClaims(this.dict[childId], score);
        }
    };
    SettleIt.prototype.calculateGeneration = function (score, parent) {
        if (score.generation == undefined)
            score.generation = 0;
        if (parent)
            score.generation = parent.generation + 1;
    };
    SettleIt.prototype.calculateProMainParent = function (score, parent) {
        var parentIsProMain = true;
        if (parent && parent.claim.isProMain !== undefined)
            parentIsProMain = parent.claim.isProMain;
        //If neither exist then default to proMain
        if (score.claim.isProMain === undefined && score.claim.isProParent === undefined) {
            score.claim.isProMain = true;
            score.claim.isProParent = score.claim.isProMain == parentIsProMain;
        }
        //if both exist then assume isProMain is correct
        if (score.claim.isProMain !== undefined && score.claim.isProParent !== undefined) {
            score.claim.isProParent = score.claim.isProMain == parentIsProMain;
        }
        //if only isProMain exists then set isProParent
        if (score.claim.isProMain !== undefined && score.claim.isProParent === undefined) {
            score.claim.isProParent = score.claim.isProMain == parentIsProMain;
        }
        //if only isProParent exists then set isProMain
        if (score.claim.isProMain === undefined && score.claim.isProParent !== undefined) {
            if (score.claim.isProParent)
                score.claim.isProMain = parentIsProMain;
            else
                score.claim.isProMain = !parentIsProMain;
        }
    };
    SettleIt.prototype.step2AscendClaims = function (score, parent) {
        score.siblingWeight = 1; // This may be wrong. Was only set if it has not parent but now there isn't a parent id
        for (var _i = 0, _a = score.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.dict[childId].claim.disabled)
                continue; //skip if diabled
            this.step2AscendClaims(this.dict[childId], score);
        }
        if (score.claim.affects == undefined)
            score.claim.affects = "AverageTheConfidence";
        this.calculateSiblingWeight(score);
        this.calculateConfidence(score);
        this.calculateImportance(score);
        this.countNumDesc(score);
    };
    /** Find the sibling with the most weight (so later you can make them all match)
     * max children ( pro + con ) */
    SettleIt.prototype.calculateSiblingWeight = function (score) {
        var maxPoints = 0;
        //Figure out what is the highest number of points among all the children
        for (var _i = 0, _a = score.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.dict[childId].claim.disabled)
                continue; //skip if diabled
            var child = this.dict[childId];
            if (child.claim.affects != "Importance") {
                var childsTotal = child.confidencePro + child.confidenceCon;
                maxPoints = Math.max(childsTotal, maxPoints);
            }
        }
        //Figure out the multiplier so that all the children have the same weight
        for (var _b = 0, _c = score.claim.childIds; _b < _c.length; _b++) {
            var childId = _c[_b];
            if (this.dict[childId].claim.disabled)
                continue; //skip if diabled
            var child = this.dict[childId];
            if (child.claim.affects != "Importance") {
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
    };
    SettleIt.prototype.calculateConfidence = function (score) {
        var avgConfPro = 0;
        var avgConfCon = 0;
        var maxConfPro = 0;
        var maxConfCon = 0;
        var found = false;
        //Add up all the children points
        for (var _i = 0, _a = score.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.dict[childId].claim.disabled)
                continue; //skip if diabled
            var child = this.dict[childId];
            if (child.claim.affects == "AverageTheConfidence") {
                found = true;
                avgConfPro += child.confidencePro * child.importanceValue * child.siblingWeight;
                avgConfCon += child.confidenceCon * child.importanceValue * child.siblingWeight;
            }
            if (child.claim.affects == "MaximumOfConfidence") {
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
            //prevents stataments form reversing
            if (score.claim.isProParent && score.confidenceCon > score.confidencePro)
                score.confidenceCon = score.confidencePro;
            if (!score.claim.isProParent && score.confidencePro > score.confidenceCon)
                score.confidencePro = score.confidenceCon;
        }
        else {
            if (score.claim.isProMain) {
                score.confidencePro = 1;
                score.confidenceCon = 0;
            }
            else {
                score.confidencePro = 0;
                score.confidenceCon = 1;
            }
        }
    };
    /** This performs Importance calculations for both Claims that affect Confidence and Importance.
     * Confidence: sum children(importance)
     * Importance: (score.importancePro + 1) / (score.importanceCon + 1) */
    SettleIt.prototype.calculateImportance = function (score) {
        if (score.claim.affects == "Importance") {
            score.importancePro = score.confidencePro;
            score.importanceCon = score.confidenceCon;
        }
        else {
            var proImportance = 0;
            var conImportance = 0;
            //Add up all the importance children points
            for (var _i = 0, _a = score.claim.childIds; _i < _a.length; _i++) {
                var childId = _a[_i];
                if (this.dict[childId].claim.disabled)
                    continue; //skip if diabled
                var child = this.dict[childId];
                if (child.claim.affects == "Importance") {
                    proImportance += child.importancePro;
                    conImportance += child.importanceCon;
                }
            }
            score.importancePro = proImportance;
            score.importanceCon = conImportance;
        }
        score.importanceValue = this.safeDivide(score.importancePro + 1, score.importanceCon + 1);
    };
    /** Count the number of descendants */
    SettleIt.prototype.countNumDesc = function (score) {
        score.numDesc = 0;
        for (var _i = 0, _a = score.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.dict[childId].claim.disabled)
                continue; //skip if diabled
            var child = this.dict[childId];
            if (child.numDesc)
                score.numDesc += child.numDesc + 1;
            else
                score.numDesc += 1;
        }
    };
    SettleIt.prototype.step3DescendClaims = function (score, parent) {
        this.calculatemaxAncestorWeight(score, parent);
        score.weightPro = score.confidencePro * score.importanceValue * score.maxAncestorWeight;
        score.weightCon = score.confidenceCon * score.importanceValue * score.maxAncestorWeight;
        score.weightDif = score.weightPro - score.weightCon;
        this.calculateParentWeightedDiferenceText(score);
        this.calculateMainPercent(score, parent);
        for (var _i = 0, _a = score.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.dict[childId].claim.disabled)
                continue; //skip if diabled
            var child = this.dict[childId];
            this.step3DescendClaims(child, score);
        }
    };
    SettleIt.prototype.step4AscendClaims = function (score, parent) {
        for (var _i = 0, _a = score.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.dict[childId].claim.disabled)
                continue; //skip if diabled
            var child = this.dict[childId];
            this.step4AscendClaims(child, score);
        }
        this.calculateWeightedPercentage(score, parent);
        this.sort(score, parent);
    };
    /** Find the maximum sibling weight of all my ancestors
     * max(parent.maxAncestorWeight, s.siblingWeight) */
    SettleIt.prototype.calculatemaxAncestorWeight = function (score, parent) {
        if (parent) {
            score.maxAncestorWeight = Math.max(parent.maxAncestorWeight, score.siblingWeight);
        }
        else {
            score.maxAncestorWeight = 1;
        }
    };
    /** Adds the proper math sign and converts the disDisplay to a string
     * Affects confidence: + or - , importance ? or ? */
    SettleIt.prototype.calculateParentWeightedDiferenceText = function (score) {
        var sign = '';
        var value;
        if (score.claim.affects == "Importance") {
            sign = !score.claim.isProParent ? '?' : '?';
            value = this.safeDivide(score.importancePro + 1, score.importanceCon + 1);
        }
        else {
            var value = score.weightDif;
            sign = value < 0 ? '' : '+';
            if (value == 0)
                sign = score.claim.isProMain ? '+' : '-';
        }
    };
    SettleIt.prototype.calculateMainPercent = function (score, parent) {
        if (parent) {
            if (score.claim.affects == "Importance")
                score.mainPercent = parent.mainPercent * (this.safeDivide(score.confidencePro + score.confidenceCon, parent.confidencePro + parent.confidenceCon));
            else
                score.mainPercent = parent.mainPercent * (this.safeDivide(score.weightPro + score.weightCon, parent.weightPro + parent.weightCon));
        }
        else {
            score.mainPercent = 1;
        }
    };
    SettleIt.prototype.calculateWeightedPercentage = function (score, parent) {
        var WeightedPluses = 0;
        var WeightedMinuses = 0;
        var found = false;
        for (var _i = 0, _a = score.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.dict[childId].claim.disabled)
                continue; //skip if diabled
            found = true;
            var child = this.dict[childId];
            if (child.weightDif > 0)
                WeightedPluses += child.weightDif;
            else
                WeightedMinuses += child.weightDif;
        }
        score.animatedWeightedPercentage = score.weightedPercentage;
        if (found) {
            if (WeightedPluses - WeightedMinuses === 0)
                score.weightedPercentage = 0;
            else
                score.weightedPercentage = WeightedPluses / (WeightedPluses - WeightedMinuses);
        }
        else
            score.weightedPercentage = 1;
    };
    SettleIt.prototype.sort = function (score, parent) {
        var _this = this;
        if (!this.shouldSort)
            return;
        score.claim.childIds.sort(function (a, b) {
            return Math.abs(_this.dict[b].weightDif) - Math.abs(_this.dict[a].weightDif);
        });
    };
    SettleIt.prototype.safeDivide = function (numerator, denomerator) {
        if (denomerator == 0)
            return 0;
        else
            return numerator / denomerator;
    };
    return SettleIt;
}());
//# sourceMappingURL=SettleIt.js.map