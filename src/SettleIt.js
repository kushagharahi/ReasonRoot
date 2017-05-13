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
    SettleIt.prototype.calculate = function (s, dict, shouldSort) {
        if (s !== undefined)
            this.s = s;
        if (dict !== undefined)
            this.dict = dict;
        if (shouldSort !== undefined)
            this.shouldSort = shouldSort;
        this.step1ValidateClaims(s);
        this.step2AscendClaims(s);
        this.step3DescendClaims(s);
        this.step4AscendClaims(s);
    };
    SettleIt.prototype.step1ValidateClaims = function (s, parent) {
        //todo make this a 62bit GUID [a-z,A-Z,0-9]
        if (s.claim.id == undefined)
            s.claim.id = ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
        this.calculateProMainParent(s, parent);
        this.calculateGeneration(s, parent);
        for (var _i = 0, _a = s.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            this.step1ValidateClaims(this.dict[childId], s);
        }
    };
    SettleIt.prototype.calculateGeneration = function (s, parent) {
        if (s.generation == undefined)
            s.generation = 0;
        if (parent)
            s.generation = parent.generation + 1;
    };
    SettleIt.prototype.calculateProMainParent = function (s, parent) {
        var parentIsProMain = true;
        if (parent && parent.claim.isProMain !== undefined)
            parentIsProMain = parent.claim.isProMain;
        //If neither exist then default to proMain
        if (s.claim.isProMain === undefined && s.claim.isProParent === undefined) {
            s.claim.isProMain = true;
            s.claim.isProParent = s.claim.isProMain == parentIsProMain;
        }
        //if both exist then assume isProMain is correct
        if (s.claim.isProMain !== undefined && s.claim.isProParent !== undefined) {
            s.claim.isProParent = s.claim.isProMain == parentIsProMain;
        }
        //if only isProMain exists then set isProParent
        if (s.claim.isProMain !== undefined && s.claim.isProParent === undefined) {
            s.claim.isProParent = s.claim.isProMain == parentIsProMain;
        }
        //if only isProParent exists then set isProMain
        if (s.claim.isProMain === undefined && s.claim.isProParent !== undefined) {
            if (s.claim.isProParent)
                s.claim.isProMain = parentIsProMain;
            else
                s.claim.isProMain = !parentIsProMain;
        }
    };
    SettleIt.prototype.step2AscendClaims = function (s, parent) {
        s.siblingWeight = 1; // This may be wrong. Was only set if it has not parent but now there isn't a parent id
        for (var _i = 0, _a = s.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            this.step2AscendClaims(this.dict[childId], s);
        }
        if (s.claim.affects == undefined)
            s.claim.affects = "AverageTheConfidence";
        this.calculateSiblingWeight(s);
        this.calculateConfidence(s);
        this.calculateImportance(s);
    };
    /** Find the sibling with the most weight (so later you can make them all match)
     * max children ( pro + con ) */
    SettleIt.prototype.calculateSiblingWeight = function (s) {
        var maxPoints = 0;
        //Figure out what is the highest number of points among all the children
        for (var _i = 0, _a = s.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            var child = this.dict[childId];
            if (child.claim.affects != "Importance") {
                var childsTotal = child.confidencePro + child.confidenceCon;
                maxPoints = Math.max(childsTotal, maxPoints);
            }
        }
        //Figure out the multiplier so that all the children have the same weight
        for (var _b = 0, _c = s.claim.childIds; _b < _c.length; _b++) {
            var childId = _c[_b];
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
    SettleIt.prototype.calculateConfidence = function (s) {
        var avgConfPro = 0;
        var avgConfCon = 0;
        var maxConfPro = 0;
        var maxConfCon = 0;
        var found = false;
        //Add up all the children points
        for (var _i = 0, _a = s.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
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
            s.confidencePro = avgConfPro + maxConfPro;
            s.confidenceCon = avgConfCon + maxConfCon;
            //prevents stataments form reversing
            if (s.claim.isProParent && s.confidenceCon > s.confidencePro)
                s.confidenceCon = s.confidencePro;
            if (!s.claim.isProParent && s.confidencePro > s.confidenceCon)
                s.confidencePro = s.confidenceCon;
        }
        else {
            if (s.claim.isProMain) {
                s.confidencePro = 1;
                s.confidenceCon = 0;
            }
            else {
                s.confidencePro = 0;
                s.confidenceCon = 1;
            }
        }
    };
    /** This performs Importance calculations for both Claims that affect Confidence and Importance.
     * Confidence: sum children(importance)
     * Importance: (s.importancePro + 1) / (s.importanceCon + 1) */
    SettleIt.prototype.calculateImportance = function (s) {
        if (s.claim.affects == "Importance") {
            s.importancePro = s.confidencePro;
            s.importanceCon = s.confidenceCon;
        }
        else {
            var proImportance = 0;
            var conImportance = 0;
            //Add up all the importance children points
            for (var _i = 0, _a = s.claim.childIds; _i < _a.length; _i++) {
                var childId = _a[_i];
                var child = this.dict[childId];
                if (child.claim.affects == "Importance") {
                    proImportance += child.importancePro;
                    conImportance += child.importanceCon;
                }
            }
            s.importancePro = proImportance;
            s.importanceCon = conImportance;
        }
        s.importanceValue = this.safeDivide(s.importancePro + 1, s.importanceCon + 1);
    };
    SettleIt.prototype.step3DescendClaims = function (s, parent) {
        this.calculatemaxAncestorWeight(s, parent);
        s.weightPro = s.confidencePro * s.importanceValue * s.maxAncestorWeight;
        s.weightCon = s.confidenceCon * s.importanceValue * s.maxAncestorWeight;
        s.weightDif = s.weightPro - s.weightCon;
        this.calculateParentWeightedDiferenceText(s);
        this.calculateMainPercent(s, parent);
        for (var _i = 0, _a = s.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            var child = this.dict[childId];
            this.step3DescendClaims(child, s);
        }
    };
    SettleIt.prototype.step4AscendClaims = function (s, parent) {
        for (var _i = 0, _a = s.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            var child = this.dict[childId];
            this.step4AscendClaims(child, s);
        }
        this.calculateWeightedPercentage(s, parent);
        this.sort(s, parent);
    };
    /** Find the maximum sibling weight of all my ancestors
     * max(parent.maxAncestorWeight, s.siblingWeight) */
    SettleIt.prototype.calculatemaxAncestorWeight = function (s, parent) {
        if (parent) {
            s.maxAncestorWeight = Math.max(parent.maxAncestorWeight, s.siblingWeight);
        }
        else {
            s.maxAncestorWeight = 1;
        }
    };
    /** Adds the proper math sign and converts the disDisplay to a string
     * Affects confidence: + or - , importance ? or ? */
    SettleIt.prototype.calculateParentWeightedDiferenceText = function (s) {
        var sign = '';
        var value;
        if (s.claim.affects == "Importance") {
            sign = !s.claim.isProParent ? '?' : '?';
            value = this.safeDivide(s.importancePro + 1, s.importanceCon + 1);
        }
        else {
            var value = s.weightDif;
            sign = value < 0 ? '' : '+';
            if (value == 0)
                sign = s.claim.isProMain ? '+' : '-';
        }
    };
    SettleIt.prototype.calculateMainPercent = function (s, parent) {
        if (parent) {
            if (s.claim.affects == "Importance")
                s.mainPercent = parent.mainPercent * (this.safeDivide(s.confidencePro + s.confidenceCon, parent.confidencePro + parent.confidenceCon));
            else
                s.mainPercent = parent.mainPercent * (this.safeDivide(s.weightPro + s.weightCon, parent.weightPro + parent.weightCon));
        }
        else {
            s.mainPercent = 1;
        }
    };
    SettleIt.prototype.calculateWeightedPercentage = function (s, parent) {
        var WeightedPluses = 0;
        var WeightedMinuses = 0;
        var found = false;
        for (var _i = 0, _a = s.claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            found = true;
            var child = this.dict[childId];
            if (child.weightDif > 0)
                WeightedPluses += child.weightDif;
            else
                WeightedMinuses += child.weightDif;
        }
        if (found) {
            if (WeightedPluses - WeightedMinuses === 0)
                s.weightedPercentage = 0;
            else
                s.weightedPercentage = WeightedPluses / (WeightedPluses - WeightedMinuses);
        }
        else
            s.weightedPercentage = 1;
    };
    SettleIt.prototype.sort = function (s, parent) {
        var _this = this;
        if (!this.shouldSort)
            return;
        s.claim.childIds.sort(function (a, b) {
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