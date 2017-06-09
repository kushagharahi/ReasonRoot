/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var Claim = (function () {
    function Claim(id, isProMain) {
        /** The text of the claim with the claim. May include markdown in the future. */
        this.content = "New Claim";
        /** Does this claim support the main top claim in this graph (true) or disput it (false) */
        this.isProMain = true;
        /** Does this claim affect the confidence or the importance of it's parent */
        this.affects = "AverageTheConfidence";
        /** an array of statment id strings representing the ids of this claims children */
        this.childIds = [];
        this.citationUrl = "";
        this.citation = "";
        this.claimId = id || newId();
        if (isProMain !== undefined)
            this.isProMain = isProMain;
    }
    return Claim;
}());
function newId() {
    //take the current date and convert to bas 62
    var decimal = new Date().getTime();
    var s = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    var result = "";
    while (decimal >= 1) {
        result = s[(decimal - (62 * Math.floor(decimal / 62)))] + result;
        decimal = Math.floor(decimal / 62);
    }
    //Add 5 extra random characters in case multiple ids are creates at the same time
    result += Array(5).join().split(',').map(function () {
        return s[(Math.floor(Math.random() * s.length))];
    }).join('');
    return result;
}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

var Root = (function () {
    function Root() {
        this.claims = new Dict();
        this.scores = new Dict();
        this.settings = {};
    }
    return Root;
}());


/***/ }),
/* 2 */
/***/ (function(module, exports) {

var Dict = (function () {
    function Dict() {
    }
    return Dict;
}());
function createDict(claims, dict) {
    if (dict === undefined)
        dict = new Dict();
    for (var claimId in claims) {
        if (claims.hasOwnProperty(claimId)) {
            if (dict[claimId] === undefined) {
                var newScore = new Score();
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
var SettleIt = (function () {
    function SettleIt() {
    }
    SettleIt.prototype.calculate = function (mainId, claims, scores, shouldSort) {
        if (claims !== undefined)
            this.claims = claims;
        if (mainId !== undefined)
            this.mainId = mainId;
        if (scores !== undefined)
            this.scores = scores;
        if (shouldSort !== undefined)
            this.shouldSort = shouldSort;
        var score = this.scores[mainId];
        var claim = this.claims[mainId];
        this.step1ValidateClaims(score);
        this.step2AscendClaims(score);
        this.step3DescendClaims(score);
        this.step4AscendClaims(score);
        return {
            mainId: this.mainId,
            claims: this.claims,
            scores: this.scores
        };
    };
    SettleIt.prototype.step1ValidateClaims = function (score, parent) {
        //todo make this a 62bit GUID [a-z,A-Z,0-9]
        //if (this.claims[score.claimId].id == undefined) this.claims[score.claimId].id = ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
        this.calculateProMainParent(score, parent);
        this.calculateGeneration(score, parent);
        var claim = this.claims[score.claimId];
        if (claim.childIds == undefined)
            claim.childIds = new Array();
        for (var _i = 0, _a = claim.childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.claims[childId].disabled)
                continue; //skip if diabled
            this.step1ValidateClaims(this.scores[childId], score);
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
    };
    SettleIt.prototype.step2AscendClaims = function (score, parent) {
        score.siblingWeight = 1; // This may be wrong. Was only set if it has not parent but now there isn't a parent id
        for (var _i = 0, _a = this.claims[score.claimId].childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.claims[score.claimId].disabled)
                continue; //skip if diabled
            this.step2AscendClaims(this.scores[childId], score);
        }
        if (this.claims[score.claimId].affects == undefined)
            this.claims[score.claimId].affects = "AverageTheConfidence";
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
        for (var _i = 0, _a = this.claims[score.claimId].childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.claims[score.claimId].disabled)
                continue; //skip if diabled
            var child = this.scores[childId];
            if (this.claims[child.claimId].affects != "Importance") {
                var childsTotal = child.confidencePro + child.confidenceCon;
                maxPoints = Math.max(childsTotal, maxPoints);
            }
        }
        //Figure out the multiplier so that all the children have the same weight
        for (var _b = 0, _c = this.claims[score.claimId].childIds; _b < _c.length; _b++) {
            var childId = _c[_b];
            if (this.claims[score.claimId].disabled)
                continue; //skip if diabled
            var child = this.scores[childId];
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
    };
    SettleIt.prototype.calculateConfidence = function (score) {
        var avgConfPro = 0;
        var avgConfCon = 0;
        var maxConfPro = 0;
        var maxConfCon = 0;
        var found = false;
        //Add up all the children points
        for (var _i = 0, _a = this.claims[score.claimId].childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.claims[score.claimId].disabled)
                continue; //skip if diabled
            var child = this.scores[childId];
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
        }
        else {
            if (this.claims[score.claimId].isProMain) {
                score.confidencePro = 1;
                score.confidenceCon = 0;
            }
            else {
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
                score.confidencePro = 10 - (this.claims[score.claimId].maxConf / 10);
                score.confidenceCon = this.claims[score.claimId].maxConf / 10;
            }
        }
        //prevents stataments form  if not the top statement
        if (score.generation != 0) {
            if (this.claims[score.claimId].isProMain && score.confidenceCon > score.confidencePro)
                score.confidencePro = score.confidenceCon;
            if (!this.claims[score.claimId].isProMain && score.confidencePro > score.confidenceCon)
                score.confidenceCon = score.confidencePro;
        }
    };
    /** This performs Importance calculations for both Claims that affect Confidence and Importance.
     * Confidence: sum children(importance)
     * Importance: (score.importancePro + 1) / (score.importanceCon + 1) */
    SettleIt.prototype.calculateImportance = function (score) {
        if (this.claims[score.claimId].affects == "Importance") {
            score.importancePro = score.confidencePro;
            score.importanceCon = score.confidenceCon;
        }
        else {
            var proImportance = 0;
            var conImportance = 0;
            //Add up all the importance children points
            for (var _i = 0, _a = this.claims[score.claimId].childIds; _i < _a.length; _i++) {
                var childId = _a[_i];
                if (this.claims[score.claimId].disabled)
                    continue; //skip if diabled
                var child = this.scores[childId];
                if (this.claims[child.claimId].affects == "Importance") {
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
        for (var _i = 0, _a = this.claims[score.claimId].childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.claims[score.claimId].disabled)
                continue; //skip if diabled
            var child = this.scores[childId];
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
        this.calculateMainPercent(score, parent);
        for (var _i = 0, _a = this.claims[score.claimId].childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.claims[score.claimId].disabled)
                continue; //skip if diabled
            var child = this.scores[childId];
            this.step3DescendClaims(child, score);
        }
    };
    SettleIt.prototype.step4AscendClaims = function (score, parent) {
        for (var _i = 0, _a = this.claims[score.claimId].childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.claims[score.claimId].disabled)
                continue; //skip if diabled
            var child = this.scores[childId];
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
    SettleIt.prototype.calculateMainPercent = function (score, parent) {
        if (parent) {
            if (this.claims[score.claimId].affects == "Importance")
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
        for (var _i = 0, _a = this.claims[score.claimId].childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            if (this.claims[score.claimId].disabled)
                continue; //skip if disabled
            found = true;
            var child = this.scores[childId];
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
        //Prevent NAN first time through by setting animatedWeightedPercentage if it is the first time through
        if (score.animatedWeightedPercentage == undefined)
            score.animatedWeightedPercentage = score.weightedPercentage;
    };
    SettleIt.prototype.sort = function (score, parent) {
        var _this = this;
        if (!this.shouldSort)
            return;
        this.claims[score.claimId].childIds.sort(function (a, b) {
            return Math.abs(_this.scores[b].weightDif) - Math.abs(_this.scores[a].weightDif);
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


/***/ }),
/* 3 */
/***/ (function(module, exports) {

var RRDisplay = (function () {
    function RRDisplay(claimElement) {
        this.userName = 'Sign In';
        this.settings = {};
        this.savePrefix = "rr_";
        this.rr = new Root();
        this.settingsVisible = false;
        this.listenerRefs = new Array();
        this.render = hyperHTML.bind(claimElement);
        this.settleIt = new SettleIt();
        this.rr = JSON.parse(claimElement.getAttribute('root'));
        this.firebaseInit();
        this.changeWhichCopy("original");
        //this.attachDB();
        //this.initRr();
        //this.update();
    }
    RRDisplay.prototype.initRr = function () {
        this.claims = this.rr.claims;
        if (this.rr.settings)
            this.settings = this.rr.settings;
        this.scores = createDict(this.claims);
        this.mainScore = this.scores[this.rr.mainId];
        this.mainScore.isMain = true;
        this.settleIt.calculate(this.rr.mainId, this.claims, this.scores);
        this.setDisplayState();
        this.calculate();
    };
    RRDisplay.prototype.changeWhichCopy = function (whichCopy) {
        if (this.whichCopy === whichCopy)
            return;
        this.whichCopy = whichCopy;
        if (whichCopy === undefined) {
            //Determine which one to point to 
        }
        //Clear any existing observers
        for (var _i = 0, _a = this.listenerRefs; _i < _a.length; _i++) {
            var ref = _a[_i];
            ref.off();
        }
        if (whichCopy === "local") {
            //pull local data if it exists and set it to save
            var rr = localStorage.getItem(this.savePrefix + this.rr.mainId);
            if (rr) {
                this.rr = JSON.parse(rr);
            }
        }
        else {
            this.firebaseInit();
            if (whichCopy === "original") {
                this.rrRef = this.db.ref('roots/' + this.rr.mainId);
            }
            else if (whichCopy === "suggestion") {
                //to do Find the ID of my suggestion
                this.rrRef = this.db.ref('roots/' + this.rr.mainId);
            }
            this.attachDB();
        }
        this.initRr();
        this.update();
    };
    RRDisplay.prototype.attachDB = function () {
        var claimsRef = this.rrRef.child('claims');
        this.listenerRefs.push(claimsRef);
        claimsRef.once('value', this.claimsFromDB.bind(this));
        claimsRef.on('child_changed', this.claimFromDB.bind(this));
        //Check for write permissions
        if (firebase.auth().currentUser) {
            var permissionRef = this.db.ref('permissions/user/' + firebase.auth().currentUser.uid + "/" + this.rr.mainId);
            this.listenerRefs.push(permissionRef);
            //To do the can write below is on the wrong "this"
            permissionRef.on('value', function (snapshot) {
                this.canWrite = snapshot.val();
            });
        }
        else {
            this.canWrite = false;
        }
    };
    RRDisplay.prototype.firebaseInit = function () {
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyAH_UO_f2F3OuVLfZvAqezEujnMesmx6hA",
                authDomain: "settleitorg.firebaseapp.com",
                databaseURL: "https://settleitorg.firebaseio.com",
                projectId: "settleitorg",
                storageBucket: "settleitorg.appspot.com",
                messagingSenderId: "835574079849"
            });
        }
        this.db = firebase.database();
    };
    RRDisplay.prototype.claimsFromDB = function (data) {
        var value = data.val();
        if (value) {
            this.rr.claims = value;
            this.claims = value;
            this.calculate();
            this.update();
        }
    };
    RRDisplay.prototype.claimFromDB = function (data) {
        var value = data.val();
        if (value) {
            var claim = value;
            this.claims[claim.claimId] = claim;
            this.calculate();
            this.update();
        }
    };
    RRDisplay.prototype.clearDisplayState = function () {
        for (var scoreId in this.scores) {
            if (this.scores.hasOwnProperty(scoreId)) {
                this.scores[scoreId].displayState = "notSelected";
            }
        }
    };
    RRDisplay.prototype.setDisplayState = function () {
        this.clearDisplayState();
        this.setDisplayStateLoop(this.mainScore);
    };
    RRDisplay.prototype.setDisplayStateLoop = function (score) {
        if (score == this.selectedScore)
            score.displayState = "selected";
        for (var _i = 0, _a = this.claims[score.claimId].childIds; _i < _a.length; _i++) {
            var childId = _a[_i];
            var childScore = this.scores[childId];
            //process the children first/
            this.setDisplayStateLoop(childScore);
            if (childScore == this.selectedScore) {
                score.displayState = "parent";
                //Set Siblings
                for (var _b = 0, _c = this.claims[score.claimId].childIds; _b < _c.length; _b++) {
                    var siblingId = _c[_b];
                    var siblingScore = this.scores[siblingId];
                    if (siblingScore.displayState != "selected")
                        siblingScore.displayState = "sibling";
                }
            }
            if (childScore.displayState == "ancestor" || childScore.displayState == "parent")
                score.displayState = "ancestor";
            if (score == this.selectedScore)
                childScore.displayState = "child";
        }
    };
    RRDisplay.prototype.update = function () {
        // if (!this.settings.noAutoSave)
        //     localStorage.setItem(this.savePrefix + this.root.mainId, JSON.stringify(this.scores));
        (_a = ["\n        <div class=\"", "\">\n            <div class = \"", "\"> \n                <input type=\"checkbox\" id=\"hideScore\" bind=\"hideScore\" value=\"hideScore\" onclick=\"", "\">\n                <label for=\"hideScore\">Hide Score</label>\n                <input type=\"checkbox\" id=\"hidePoints\" bind=\"hidePoints\" value=\"hidePoints\" onclick=\"", "\">\n                <label for=\"hidePoints\">Hide Points</label>\n                <input type=\"checkbox\" id=\"noAutoSave\" bind=\"noAutoSave\" value=\"noAutoSave\" onclick=\"", "\">\n                <label for=\"noAutoSave\">No Auto Save</label>\n                <input type=\"checkbox\" id=\"showSiblings\" bind=\"showSiblings\" value=\"showSiblings\" onclick=\"", "\">\n                <label for=\"showSiblings\">Show Sibllings</label>\n                <input type=\"checkbox\" id=\"hideClaimMenu\" bind=\"hideClaimMenu\" value=\"hideClaimMenu\" onclick=\"", "\">\n                <label for=\"hideClaimMenu\">Hide Claim Menu</label>\n                <input type=\"checkbox\" id=\"hideChildIndicator\" bind=\"hideChildIndicator\" value=\"hideChildIndicator\" onclick=\"", "\">\n                <label for=\"hideChildIndicator\">Hide Child Indicator</label>\n                <input type=\"checkbox\" id=\"showCompetition\" bind=\"showCompetition\" value=\"showCompetition\" onclick=\"", "\">\n                <label for=\"showCompetition\">Show Competition</label>\n\n                <input value=\"", "\"></input>\n                \n                <div  onclick=\"", "\"> \n                        [", " ]\n                </div>\n           </div>\n            <div>", "</div>\n            <div class=\"settingsButton\" onclick=\"", "\"> \n                \u2699\n            </div>\n        </div>"], _a.raw = ["\n        <div class=\"",
            "\">\n            <div class = \"", "\"> \n                <input type=\"checkbox\" id=\"hideScore\" bind=\"hideScore\" value=\"hideScore\" onclick=\"", "\">\n                <label for=\"hideScore\">Hide Score</label>\n                <input type=\"checkbox\" id=\"hidePoints\" bind=\"hidePoints\" value=\"hidePoints\" onclick=\"", "\">\n                <label for=\"hidePoints\">Hide Points</label>\n                <input type=\"checkbox\" id=\"noAutoSave\" bind=\"noAutoSave\" value=\"noAutoSave\" onclick=\"", "\">\n                <label for=\"noAutoSave\">No Auto Save</label>\n                <input type=\"checkbox\" id=\"showSiblings\" bind=\"showSiblings\" value=\"showSiblings\" onclick=\"", "\">\n                <label for=\"showSiblings\">Show Sibllings</label>\n                <input type=\"checkbox\" id=\"hideClaimMenu\" bind=\"hideClaimMenu\" value=\"hideClaimMenu\" onclick=\"", "\">\n                <label for=\"hideClaimMenu\">Hide Claim Menu</label>\n                <input type=\"checkbox\" id=\"hideChildIndicator\" bind=\"hideChildIndicator\" value=\"hideChildIndicator\" onclick=\"", "\">\n                <label for=\"hideChildIndicator\">Hide Child Indicator</label>\n                <input type=\"checkbox\" id=\"showCompetition\" bind=\"showCompetition\" value=\"showCompetition\" onclick=\"", "\">\n                <label for=\"showCompetition\">Show Competition</label>\n\n                <input value=\"", "\"></input>\n                \n                <div  onclick=\"", "\"> \n                        [", " ]\n                </div>\n           </div>\n            <div>", "</div>\n            <div class=\"settingsButton\" onclick=\"", "\"> \n                \u2699\n            </div>\n        </div>"], this.render(_a, 'rr' +
            (this.settings.hideScore ? ' hideScore' : '') +
            (this.settings.hidePoints ? ' hidePoints' : '') +
            (this.settings.hideClaimMenu ? ' hideClaimMenu' : '') +
            (this.settings.hideChildIndicator ? ' hideChildIndicator' : '') +
            (this.settings.showSiblings ? ' showSiblings' : '') +
            (this.settings.showCompetition ? ' showCompetition' : ''), 'settingsHider ' + (this.settingsVisible ? 'open' : ''), this.updateSettings.bind(this, this.settings), this.updateSettings.bind(this, this.settings), this.updateSettings.bind(this, this.settings), this.updateSettings.bind(this, this.settings), this.updateSettings.bind(this, this.settings), this.updateSettings.bind(this, this.settings), this.updateSettings.bind(this, this.settings), this.replaceAll(JSON.stringify(this.rr), '\'', '&#39;'), this.signIn.bind(this), this.userName, this.renderNode(this.scores[this.rr.mainId]), this.toggleSettings.bind(this)));
        var _a;
    };
    RRDisplay.prototype.updateSettings = function (settings, event) {
        settings[event.srcElement.getAttribute("bind")] = event.srcElement.checked;
        this.update();
        if (event)
            event.stopPropagation();
    };
    RRDisplay.prototype.toggleSettings = function (event) {
        this.settingsVisible = !this.settingsVisible;
        this.update();
    };
    RRDisplay.prototype.replaceAll = function (target, search, replacement) {
        return target.split(search).join(replacement);
    };
    ;
    RRDisplay.prototype.renderNode = function (score, parent) {
        var _this = this;
        var claim = this.claims[score.claimId];
        var wire = hyperHTML.wire(score);
        this.animatenumbers();
        var result = (_a = ["\n                <li id=\"", "\" class=\"", "\">\n                    <div class=\"claimPad\" onclick=\"", "\">\n                        <div class=\"", "\" >\n                            <div class=\"innerClaim\">\n                                <span class=\"", "\" >", "</span>\n\n            <span class=\"proPoints\" >", "</span>\n            <span class=\"conPoints\" >", "</span>\n\n                                ", "\n                                ", "\n                                <a target=\"_blank\" href=\"", "\" onclick=\"", "\"> \n                                    <span class=\"citation\">", "</span>\n                                </a>\n\n                             </div>\n                        </div>\n                        \n                        <div class=\"", "\">\n                            <div class=\"", "\">\n                            <div class=\"childIndicatorInner\">\n                            ", " more\n                            </div>\n                            </div>\n                        </div>\n\n                        <div class=\"claimEditHider\">\n                            <div class=\"claimEditSection\">\n                                <input bind=\"content\"  oninput=\"", "\" ><br>\n                                <input bind=\"citation\" oninput=\"", "\" ><br>\n                                <input bind=\"citationUrl\" oninput=\"", "\" ><br>\n                                <label for=\"maxConf\" >Maximum Confidence </label><br/>\n                                <input bind=\"maxConf\" name=\"maxConf\" type=\"number\" oninput=\"", "\" ><br>\n                                <input type=\"checkbox\" bind=\"isProMain\" onclick=\"", "\">\n                                <label for=\"isProMain\">Does this claim supports the main claim?</label><br/>\n                                <input type=\"checkbox\" bind=\"disabled\" onclick=\"", "\">\n                                <label for=\"disabled\">Disabled?</label><br/>\n                                <button onclick=\"", "\" name=\"button\">\n                                    Remove this claim from it's parent\n                                </button><br/>\n                                ID:", "\n                            </div>\n                        </div>\n\n                        <div class=\"claimMenuHider\">\n                            <div class=\"claimMenuSection\">\n                                <div class=\"addClaim pro\" onclick=\"", "\">add</div>\n                                <div class=\"addClaim con\" onclick=\"", "\">add</div>\n                                <div class=\"editClaimButton\" onclick=\"", "\">edit</div>\n                            </div>\n                        </div>\n\n                    </div>  \n                      \n                    <ul>", "</ul>\n                        </li>"], _a.raw = ["\n                <li id=\"", "\" class=\"",
            "\">\n                    <div class=\"claimPad\" onclick=\"", "\">\n                        <div class=\"", "\" >\n                            <div class=\"innerClaim\">\n                                <span class=\"", "\" >",
            "</span>\n\n            <span class=\"proPoints\" >", "</span>\n            <span class=\"conPoints\" >", "</span>\n\n                                ", "\n                                ", "\n                                <a target=\"_blank\" href=\"", "\" onclick=\"", "\"> \n                                    <span class=\"citation\">", "</span>\n                                </a>\n\n                             </div>\n                        </div>\n                        \n                        <div class=\"", "\">\n                            <div class=\"", "\">\n                            <div class=\"childIndicatorInner\">\n                            ", " more\n                            </div>\n                            </div>\n                        </div>\n\n                        <div class=\"claimEditHider\">\n                            <div class=\"claimEditSection\">\n                                <input bind=\"content\"  oninput=\"", "\" ><br>\n                                <input bind=\"citation\" oninput=\"", "\" ><br>\n                                <input bind=\"citationUrl\" oninput=\"", "\" ><br>\n                                <label for=\"maxConf\" >Maximum Confidence </label><br/>\n                                <input bind=\"maxConf\" name=\"maxConf\" type=\"number\" oninput=\"", "\" ><br>\n                                <input type=\"checkbox\" bind=\"isProMain\" onclick=\"", "\">\n                                <label for=\"isProMain\">Does this claim supports the main claim?</label><br/>\n                                <input type=\"checkbox\" bind=\"disabled\" onclick=\"", "\">\n                                <label for=\"disabled\">Disabled?</label><br/>\n                                <button onclick=\"", "\" name=\"button\">\n                                    Remove this claim from it's parent\n                                </button><br/>\n                                ID:", "\n                            </div>\n                        </div>\n\n                        <div class=\"claimMenuHider\">\n                            <div class=\"claimMenuSection\">\n                                <div class=\"addClaim pro\" onclick=\"", "\">add</div>\n                                <div class=\"addClaim con\" onclick=\"", "\">add</div>\n                                <div class=\"editClaimButton\" onclick=\"", "\">edit</div>\n                            </div>\n                        </div>\n\n                    </div>  \n                      \n                    <ul>",
            "</ul>\n                        </li>"], wire(_a, claim.claimId, score.displayState +
            (score.isMain ? ' mainClaim' : '') +
            (this.settings.isEditing && this.selectedScore == score ? ' editing' : ''), this.selectScore.bind(this, score), "claim " + (claim.isProMain ? 'pro' : 'con') + (claim.disabled ? ' disabled ' : '') + (claim.childIds.length > 0 && !score.open ? ' shadow' : ''), score.generation == 0 ? 'score' : 'points', (score.generation == 0 ?
            Math.round(score.animatedWeightedPercentage * 100) + '%' :
            (score.weightDif != undefined ? Math.floor(Math.abs(score.weightDif)) : '')), Math.round(score.weightPro), Math.round(score.weightCon), claim.content, claim.maxConf && claim.maxConf < 100 ? " (maximum confidence set to " + claim.maxConf + "%) " : "", claim.citationUrl, this.noBubbleClick, claim.citation, "childIndicatorSpace" + (claim.childIds.length == 0 ? '' : ' hasChildren'), "childIndicator " + (claim.isProMain ? 'pro' : 'con'), score.numDesc, this.updateClaim.bind(this, claim), this.updateClaim.bind(this, claim), this.updateClaim.bind(this, claim), this.updateClaim.bind(this, claim), this.updateClaim.bind(this, claim), this.updateClaim.bind(this, claim), this.removeClaim.bind(this, claim, parent), claim.claimId, this.addClaim.bind(this, score, true), this.addClaim.bind(this, score, false), this.editClaim.bind(this, score), claim.childIds.map(function (childId, i) { return _this.renderNode(_this.scores[childId], score); })));
        if (!wire.default) {
            wire.default = claim.content;
            var inputs = result.querySelector('.claimPad').querySelectorAll('input');
            for (var _i = 0, inputs_1 = inputs; _i < inputs_1.length; _i++) {
                var input = inputs_1[_i];
                var bindName = input.getAttribute("bind");
                if (bindName) {
                    if (input.type == "checkbox")
                        input.checked = claim[bindName];
                    else
                        input.value = claim[bindName];
                }
            }
        }
        return result;
        var _a;
    };
    //Check for animating numbers
    RRDisplay.prototype.animatenumbers = function () {
        var _this = this;
        var found = false;
        for (var scoreId in this.scores) {
            var s = this.scores[scoreId];
            if (s.weightedPercentage != s.animatedWeightedPercentage) {
                found = true;
                var difference = s.weightedPercentage - s.animatedWeightedPercentage;
                if (Math.abs(difference) < .01)
                    s.animatedWeightedPercentage = s.weightedPercentage;
                else
                    s.animatedWeightedPercentage += difference / 100;
            }
        }
        if (found)
            setTimeout(function () { return _this.update(); }, 100);
    };
    RRDisplay.prototype.selectScore = function (score, e) {
        if (score != this.selectedScore) {
            this.selectedScore = score;
            this.setDisplayState();
            this.update();
        }
    };
    RRDisplay.prototype.noBubbleClick = function (event) {
        if (event)
            event.stopPropagation();
    };
    RRDisplay.prototype.updateClaim = function (claim, event) {
        var inputs = event.srcElement.parentElement.querySelectorAll('input');
        for (var _i = 0, inputs_2 = inputs; _i < inputs_2.length; _i++) {
            var input = inputs_2[_i];
            var bindName = input.getAttribute("bind");
            if (bindName) {
                if (input.type == "checkbox")
                    claim[bindName] = input.checked;
                else
                    claim[bindName] = input.value;
            }
        }
        //to do Update the storage
        if (this.whichCopy == "original")
            if (this.canWrite)
                firebase.database().ref('roots/' + this.rr.mainId + '/claims/' + claim.claimId).set(claim);
            else {
                //Change over to a copy and set it up
            }
        //update the UI
        this.calculate();
        this.update();
    };
    RRDisplay.prototype.calculate = function () {
        this.settleIt.calculate(this.rr.mainId, this.claims, this.scores);
    };
    RRDisplay.prototype.removeClaim = function (claim, parentScore, event) {
        var index = this.claims[parentScore.claimId].childIds.indexOf(claim.claimId);
        if (index > -1)
            this.claims[parentScore.claimId].childIds.splice(index, 1);
        this.selectedScore = parentScore;
        this.calculate();
        this.setDisplayState();
        this.update();
    };
    RRDisplay.prototype.editClaim = function (score, event) {
        this.settings.isEditing = !this.settings.isEditing;
        this.update();
        if (event)
            event.stopPropagation();
    };
    RRDisplay.prototype.addClaim = function (parentScore, isProMain, event) {
        var _this = this;
        var newClaim = new Claim();
        newClaim.isProMain = isProMain;
        var newScore = new Score(newClaim);
        this.scores[newClaim.claimId] = newScore;
        this.claims[parentScore.claimId].childIds.unshift(newClaim.claimId);
        this.claims[newClaim.claimId] = newClaim;
        newScore.displayState = "notSelected";
        this.update();
        setTimeout(function () {
            _this.selectedScore = newScore;
            _this.settings.isEditing = true;
            _this.calculate();
            _this.setDisplayState();
            _this.update();
        }, 10);
        if (event)
            event.stopPropagation();
    };
    RRDisplay.prototype.signIn = function () {
        this.firebaseInit();
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then((function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            this.userName = firebase.auth().currentUser ? firebase.auth().currentUser.email + ' - ' + firebase.auth().currentUser.uid : 'Sign In';
            console.log(result);
            // ...
        }).bind(this)).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            console.log(error);
        });
    };
    return RRDisplay;
}());


/***/ }),
/* 4 */
/***/ (function(module, exports) {

var Score = (function () {
    /** */
    function Score(claim) {
        if (claim)
            this.claimId = claim.claimId;
    }
    return Score;
}());


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3);
__webpack_require__(0);
__webpack_require__(1);
__webpack_require__(4);
__webpack_require__(2);

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMjM5Mzg1YTE2NmI3MWQ4NTlhYWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL0NsYWltLnRzIiwid2VicGFjazovLy8uL3NyYy9Sb290LnRzIiwid2VicGFjazovLy8uL3NyYy9TZXR0bGVJdC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvcnJEaXNwbGF5LnRzIiwid2VicGFjazovLy8uL3NyYy9zY29yZS50cyIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUEyQyxjQUFjOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7QUNoRUE7SUErQkksZUFBWSxFQUFXLEVBQUUsU0FBbUI7UUEzQjVDLGdGQUFnRjtRQUNoRixZQUFPLEdBQVcsV0FBVyxDQUFDO1FBSzlCLDJGQUEyRjtRQUMzRixjQUFTLEdBQVksSUFBSSxDQUFDO1FBSzFCLDZFQUE2RTtRQUM3RSxZQUFPLEdBQVksc0JBQXNCLENBQUM7UUFFMUMsbUZBQW1GO1FBQ25GLGFBQVEsR0FBYSxFQUFFLENBQUM7UUFReEIsZ0JBQVcsR0FBVyxFQUFFLENBQUM7UUFDekIsYUFBUSxHQUFXLEVBQUUsQ0FBQztRQUdsQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsSUFBSSxLQUFLLEVB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bEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTCxnQkFBQztBQUFELENBQUM7Ozs7Ozs7QUMvYkQ7SUE0Q0ksTUFBTTtJQUNOLGVBQVksS0FBYTtRQUNyQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7SUFDNUMsQ0FBQztJQUlMLFlBQUM7QUFBRCxDQUFDOzs7Ozs7O0FDbkREO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUIiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA1KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAyMzkzODVhMTY2YjcxZDg1OWFhZSIsImNsYXNzIENsYWltIHtcclxuICAgIC8qKiBhIGJhc2U2MiBHVUlEIHN0cmluZyB0byBpZGVudGlmeSBlYWNoIGNsYWltICovXHJcbiAgICBjbGFpbUlkOiBzdHJpbmc7XHJcblxyXG4gICAgLyoqIFRoZSB0ZXh0IG9mIHRoZSBjbGFpbSB3aXRoIHRoZSBjbGFpbS4gTWF5IGluY2x1ZGUgbWFya2Rvd24gaW4gdGhlIGZ1dHVyZS4gKi9cclxuICAgIGNvbnRlbnQ6IHN0cmluZyA9IFwiTmV3IENsYWltXCI7XHJcblxyXG4gICAgLyoqIHZlcnkgc2hvcnQgdW5pcXVlIHRleHQgZm9yIGRpc3BsYXlpbmcgb2YgY2hhcnRzIGFuZCBvdGhlciBhcmVhcyB3aXRoIGxpbWl0ZWQgc3BhY2UuICovXHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG5cclxuICAgIC8qKiBEb2VzIHRoaXMgY2xhaW0gc3VwcG9ydCB0aGUgbWFpbiB0b3AgY2xhaW0gaW4gdGhpcyBncmFwaCAodHJ1ZSkgb3IgZGlzcHV0IGl0IChmYWxzZSkgKi9cclxuICAgIGlzUHJvTWFpbjogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgLyoqIERvZXMgdGhpcyBjbGFpbSBzdXBwb3J0IGl0J3MgcGFyZW50IGNsYWltIGluIHRoaXMgZ3JhcGggKHRydWUpIG9yIGRpc3B1dCBpdCAoZmFsc2UpICovXHJcbiAgICBpc1Byb1BhcmVudDogYm9vbGVhbjtcclxuXHJcbiAgICAvKiogRG9lcyB0aGlzIGNsYWltIGFmZmVjdCB0aGUgY29uZmlkZW5jZSBvciB0aGUgaW1wb3J0YW5jZSBvZiBpdCdzIHBhcmVudCAqL1xyXG4gICAgYWZmZWN0czogQWZmZWN0cyA9IFwiQXZlcmFnZVRoZUNvbmZpZGVuY2VcIjtcclxuXHJcbiAgICAvKiogYW4gYXJyYXkgb2Ygc3RhdG1lbnQgaWQgc3RyaW5ncyByZXByZXNlbnRpbmcgdGhlIGlkcyBvZiB0aGlzIGNsYWltcyBjaGlsZHJlbiAqL1xyXG4gICAgY2hpbGRJZHM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgLyoqIHRoZSBtYXhpbXVtIGNvbmZpZGVuY2UgYWxsb3dlZCBvbiB0aGlzIHN0YXRlbWVudCovXHJcbiAgICBtYXhDb25mOiBudW1iZXI7XHJcblxyXG4gICAgLyoqICovXHJcbiAgICBkaXNhYmxlZDogYm9vbGVhbjtcclxuXHJcbiAgICBjaXRhdGlvblVybDogc3RyaW5nID0gXCJcIjtcclxuICAgIGNpdGF0aW9uOiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlkPzogc3RyaW5nLCBpc1Byb01haW4/OiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5jbGFpbUlkID0gaWQgfHwgbmV3SWQoKTtcclxuICAgICAgICBpZiAoaXNQcm9NYWluICE9PSB1bmRlZmluZWQpIHRoaXMuaXNQcm9NYWluID0gaXNQcm9NYWluXHJcbiAgICB9XHJcblxyXG59XHJcblxyXG50eXBlIEFmZmVjdHMgPSBcIkF2ZXJhZ2VUaGVDb25maWRlbmNlXCIgfCBcIk1heGltdW1PZkNvbmZpZGVuY2VcIiB8IFwiSW1wb3J0YW5jZVwiO1xyXG5cclxuZnVuY3Rpb24gbmV3SWQoKTogc3RyaW5nIHtcclxuICAgIC8vdGFrZSB0aGUgY3VycmVudCBkYXRlIGFuZCBjb252ZXJ0IHRvIGJhcyA2MlxyXG4gICAgbGV0IGRlY2ltYWwgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIGxldCBzID0gXCIwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlwiLnNwbGl0KFwiXCIpO1xyXG4gICAgbGV0IHJlc3VsdCA9IFwiXCI7XHJcbiAgICB3aGlsZSAoZGVjaW1hbCA+PSAxKSB7XHJcbiAgICAgICAgcmVzdWx0ID0gc1soZGVjaW1hbCAtICg2MiAqIE1hdGguZmxvb3IoZGVjaW1hbCAvIDYyKSkpXSArIHJlc3VsdDtcclxuICAgICAgICBkZWNpbWFsID0gTWF0aC5mbG9vcihkZWNpbWFsIC8gNjIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vQWRkIDUgZXh0cmEgcmFuZG9tIGNoYXJhY3RlcnMgaW4gY2FzZSBtdWx0aXBsZSBpZHMgYXJlIGNyZWF0ZXMgYXQgdGhlIHNhbWUgdGltZVxyXG4gICAgcmVzdWx0ICs9IEFycmF5KDUpLmpvaW4oKS5zcGxpdCgnLCcpLm1hcChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHNbKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHMubGVuZ3RoKSldO1xyXG4gICAgfSkuam9pbignJyk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG5cclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL0NsYWltLnRzIiwiY2xhc3MgUm9vdCB7XHJcbiAgICBtYWluSWQ6IHN0cmluZztcclxuICAgIGNsYWltczogRGljdDxDbGFpbT4gPSBuZXcgRGljdDxDbGFpbT4oKTtcclxuICAgIHNjb3JlczogRGljdDxTY29yZT4gPSBuZXcgRGljdDxTY29yZT4oKTtcclxuICAgIHNldHRpbmdzOiBhbnkgPSB7fTtcclxufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9Sb290LnRzIiwiY2xhc3MgRGljdDxUPiB7XHJcbiAgICBbSzogc3RyaW5nXTogVDtcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlRGljdChjbGFpbXM6IERpY3Q8Q2xhaW0+LCBkaWN0PzogRGljdDxTY29yZT4pOiBEaWN0PFNjb3JlPiB7XHJcbiAgICBpZiAoZGljdCA9PT0gdW5kZWZpbmVkKSBkaWN0ID0gbmV3IERpY3Q8U2NvcmU+KCk7XHJcblxyXG4gICAgZm9yIChsZXQgY2xhaW1JZCBpbiBjbGFpbXMpIHtcclxuICAgICAgICBpZiAoY2xhaW1zLmhhc093blByb3BlcnR5KGNsYWltSWQpKSB7XHJcbiAgICAgICAgICAgIGlmIChkaWN0W2NsYWltSWRdID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBuZXdTY29yZSA9IG5ldyBTY29yZSgpO1xyXG4gICAgICAgICAgICAgICAgbmV3U2NvcmUuY2xhaW1JZCA9IGNsYWltSWQ7XHJcbiAgICAgICAgICAgICAgICBkaWN0W2NsYWltSWRdID0gbmV3U2NvcmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICAvLyBmb3IgKGxldCBjbGFpbSBvZiBjbGFpbXMpIHtcclxuICAgIC8vICAgICBpZiAoZGljdFtjbGFpbS5pZF0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgLy8gICAgICAgICBsZXQgbmV3U2NvcmUgPSBuZXcgU2NvcmUoKTtcclxuICAgIC8vICAgICAgICAgbmV3dGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0gPSBjbGFpbTtcclxuICAgIC8vICAgICAgICAgZGljdFtjbGFpbS5pZF0gPSBuZXdTY29yZTtcclxuICAgIC8vICAgICB9XHJcbiAgICAvLyB9XHJcbiAgICByZXR1cm4gZGljdDtcclxufVxyXG5cclxuY2xhc3MgU2V0dGxlSXQge1xyXG5cclxuICAgIC8vVGhlIHZhcmlhYmxlIHMgYWx3YXlzIG1lYW5zIHNjb3JlIG9iamVjdCB3aGljaCBjb250YWlucyBhIGNsYWltXHJcbiAgICBwdWJsaWMgc2hvdWxkU29ydDogYm9vbGVhbjtcclxuICAgIHB1YmxpYyBzY29yZXM6IERpY3Q8U2NvcmU+O1xyXG4gICAgcHVibGljIG1haW5JZDogc3RyaW5nO1xyXG4gICAgcHVibGljIGNsYWltczogRGljdDxDbGFpbT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7IH1cclxuXHJcbiAgICBwdWJsaWMgY2FsY3VsYXRlKG1haW5JZD86IHN0cmluZywgY2xhaW1zPzogRGljdDxDbGFpbT4sIHNjb3Jlcz86IERpY3Q8U2NvcmU+LCBzaG91bGRTb3J0PzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmIChjbGFpbXMgIT09IHVuZGVmaW5lZCkgdGhpcy5jbGFpbXMgPSBjbGFpbXM7XHJcbiAgICAgICAgaWYgKG1haW5JZCAhPT0gdW5kZWZpbmVkKSB0aGlzLm1haW5JZCA9IG1haW5JZDtcclxuICAgICAgICBpZiAoc2NvcmVzICE9PSB1bmRlZmluZWQpIHRoaXMuc2NvcmVzID0gc2NvcmVzO1xyXG4gICAgICAgIGlmIChzaG91bGRTb3J0ICE9PSB1bmRlZmluZWQpIHRoaXMuc2hvdWxkU29ydCA9IHNob3VsZFNvcnQ7XHJcbiAgICAgICAgbGV0IHNjb3JlID0gdGhpcy5zY29yZXNbbWFpbklkXTtcclxuICAgICAgICBsZXQgY2xhaW0gPSB0aGlzLmNsYWltc1ttYWluSWRdO1xyXG4gICAgICAgIHRoaXMuc3RlcDFWYWxpZGF0ZUNsYWltcyhzY29yZSk7XHJcbiAgICAgICAgdGhpcy5zdGVwMkFzY2VuZENsYWltcyhzY29yZSk7XHJcbiAgICAgICAgdGhpcy5zdGVwM0Rlc2NlbmRDbGFpbXMoc2NvcmUpO1xyXG4gICAgICAgIHRoaXMuc3RlcDRBc2NlbmRDbGFpbXMoc2NvcmUpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBtYWluSWQ6IHRoaXMubWFpbklkLFxyXG4gICAgICAgICAgICBjbGFpbXM6IHRoaXMuY2xhaW1zLFxyXG4gICAgICAgICAgICBzY29yZXM6IHRoaXMuc2NvcmVzXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGVwMVZhbGlkYXRlQ2xhaW1zKHNjb3JlOiBTY29yZSwgcGFyZW50PzogU2NvcmUpIHtcclxuXHJcbiAgICAgICAgLy90b2RvIG1ha2UgdGhpcyBhIDYyYml0IEdVSUQgW2EteixBLVosMC05XVxyXG5cclxuICAgICAgICAvL2lmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5pZCA9PSB1bmRlZmluZWQpIHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmlkID0gKFwiMDAwMFwiICsgKE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygzNiwgNCkgPDwgMCkudG9TdHJpbmcoMzYpKS5zbGljZSgtNCk7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVQcm9NYWluUGFyZW50KHNjb3JlLCBwYXJlbnQpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUdlbmVyYXRpb24oc2NvcmUsIHBhcmVudCk7XHJcbiAgICAgICAgbGV0IGNsYWltID0gdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF1cclxuICAgICAgICBpZiAoY2xhaW0uY2hpbGRJZHMgPT0gdW5kZWZpbmVkKSBjbGFpbS5jaGlsZElkcyA9IG5ldyBBcnJheTxzdHJpbmc+KCk7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGRJZCBvZiBjbGFpbS5jaGlsZElkcykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jbGFpbXNbY2hpbGRJZF0uZGlzYWJsZWQpIGNvbnRpbnVlOyAvL3NraXAgaWYgZGlhYmxlZFxyXG4gICAgICAgICAgICB0aGlzLnN0ZXAxVmFsaWRhdGVDbGFpbXModGhpcy5zY29yZXNbY2hpbGRJZF0sIHNjb3JlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVHZW5lcmF0aW9uKHNjb3JlOiBTY29yZSwgcGFyZW50PzogU2NvcmUpIHtcclxuICAgICAgICBpZiAoc2NvcmUuZ2VuZXJhdGlvbiA9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHNjb3JlLmdlbmVyYXRpb24gPSAwO1xyXG5cclxuICAgICAgICBpZiAocGFyZW50KVxyXG4gICAgICAgICAgICBzY29yZS5nZW5lcmF0aW9uID0gcGFyZW50LmdlbmVyYXRpb24gKyAxO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlUHJvTWFpblBhcmVudChzY29yZTogU2NvcmUsIHBhcmVudD86IFNjb3JlKSB7XHJcbiAgICAgICAgdmFyIHBhcmVudElzUHJvTWFpbiA9IHRydWU7XHJcbiAgICAgICAgaWYgKHBhcmVudCAmJiB0aGlzLmNsYWltc1twYXJlbnQuY2xhaW1JZF0uaXNQcm9NYWluICE9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHBhcmVudElzUHJvTWFpbiA9IHRoaXMuY2xhaW1zW3BhcmVudC5jbGFpbUlkXS5pc1Byb01haW47XHJcblxyXG5cclxuXHJcbiAgICAgICAgLy9JZiBuZWl0aGVyIGV4aXN0IHRoZW4gZGVmYXVsdCB0byBwcm9NYWluXHJcbiAgICAgICAgaWYgKHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmlzUHJvTWFpbiA9PT0gdW5kZWZpbmVkICYmIHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmlzUHJvUGFyZW50ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uaXNQcm9NYWluID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uaXNQcm9QYXJlbnQgPSB0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5pc1Byb01haW4gPT0gcGFyZW50SXNQcm9NYWluO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9pZiBib3RoIGV4aXN0IHRoZW4gYXNzdW1lIGlzUHJvTWFpbiBpcyBjb3JyZWN0XHJcbiAgICAgICAgaWYgKHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmlzUHJvTWFpbiAhPT0gdW5kZWZpbmVkICYmIHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmlzUHJvUGFyZW50ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uaXNQcm9QYXJlbnQgPSB0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5pc1Byb01haW4gPT0gcGFyZW50SXNQcm9NYWluO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9pZiBvbmx5IGlzUHJvTWFpbiBleGlzdHMgdGhlbiBzZXQgaXNQcm9QYXJlbnRcclxuICAgICAgICBpZiAodGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uaXNQcm9NYWluICE9PSB1bmRlZmluZWQgJiYgdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uaXNQcm9QYXJlbnQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5pc1Byb1BhcmVudCA9IHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmlzUHJvTWFpbiA9PSBwYXJlbnRJc1Byb01haW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2lmIG9ubHkgaXNQcm9QYXJlbnQgZXhpc3RzIHRoZW4gc2V0IGlzUHJvTWFpblxyXG4gICAgICAgIGlmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5pc1Byb01haW4gPT09IHVuZGVmaW5lZCAmJiB0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5pc1Byb1BhcmVudCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5pc1Byb1BhcmVudClcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmlzUHJvTWFpbiA9IHBhcmVudElzUHJvTWFpbjtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uaXNQcm9NYWluID0gIXBhcmVudElzUHJvTWFpbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwcml2YXRlIHN0ZXAyQXNjZW5kQ2xhaW1zKHNjb3JlOiBTY29yZSwgcGFyZW50PzogU2NvcmUpIHtcclxuICAgICAgICBzY29yZS5zaWJsaW5nV2VpZ2h0ID0gMTsgLy8gVGhpcyBtYXkgYmUgd3JvbmcuIFdhcyBvbmx5IHNldCBpZiBpdCBoYXMgbm90IHBhcmVudCBidXQgbm93IHRoZXJlIGlzbid0IGEgcGFyZW50IGlkXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGRJZCBvZiB0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5jaGlsZElkcykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uZGlzYWJsZWQpIGNvbnRpbnVlOyAvL3NraXAgaWYgZGlhYmxlZFxyXG4gICAgICAgICAgICB0aGlzLnN0ZXAyQXNjZW5kQ2xhaW1zKHRoaXMuc2NvcmVzW2NoaWxkSWRdLCBzY29yZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5hZmZlY3RzID09IHVuZGVmaW5lZCkgdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uYWZmZWN0cyA9IFwiQXZlcmFnZVRoZUNvbmZpZGVuY2VcIjtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTaWJsaW5nV2VpZ2h0KHNjb3JlKTtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNvbmZpZGVuY2Uoc2NvcmUpO1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlSW1wb3J0YW5jZShzY29yZSk7XHJcbiAgICAgICAgdGhpcy5jb3VudE51bURlc2Moc2NvcmUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBGaW5kIHRoZSBzaWJsaW5nIHdpdGggdGhlIG1vc3Qgd2VpZ2h0IChzbyBsYXRlciB5b3UgY2FuIG1ha2UgdGhlbSBhbGwgbWF0Y2gpXHJcbiAgICAgKiBtYXggY2hpbGRyZW4gKCBwcm8gKyBjb24gKSAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVTaWJsaW5nV2VpZ2h0KHNjb3JlOiBTY29yZSkge1xyXG4gICAgICAgIHZhciBtYXhQb2ludHMgPSAwO1xyXG4gICAgICAgIC8vRmlndXJlIG91dCB3aGF0IGlzIHRoZSBoaWdoZXN0IG51bWJlciBvZiBwb2ludHMgYW1vbmcgYWxsIHRoZSBjaGlsZHJlblxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkSWQgb2YgdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uY2hpbGRJZHMpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmRpc2FibGVkKSBjb250aW51ZTsgLy9za2lwIGlmIGRpYWJsZWRcclxuICAgICAgICAgICAgbGV0IGNoaWxkID0gdGhpcy5zY29yZXNbY2hpbGRJZF07XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNsYWltc1tjaGlsZC5jbGFpbUlkXS5hZmZlY3RzICE9IFwiSW1wb3J0YW5jZVwiKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRzVG90YWwgPSBjaGlsZC5jb25maWRlbmNlUHJvICsgY2hpbGQuY29uZmlkZW5jZUNvbjtcclxuICAgICAgICAgICAgICAgIG1heFBvaW50cyA9IE1hdGgubWF4KGNoaWxkc1RvdGFsLCBtYXhQb2ludHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL0ZpZ3VyZSBvdXQgdGhlIG11bHRpcGxpZXIgc28gdGhhdCBhbGwgdGhlIGNoaWxkcmVuIGhhdmUgdGhlIHNhbWUgd2VpZ2h0XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGRJZCBvZiB0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5jaGlsZElkcykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uZGlzYWJsZWQpIGNvbnRpbnVlOyAvL3NraXAgaWYgZGlhYmxlZFxyXG4gICAgICAgICAgICBsZXQgY2hpbGQgPSB0aGlzLnNjb3Jlc1tjaGlsZElkXTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2xhaW1zW2NoaWxkLmNsYWltSWRdLmFmZmVjdHMgIT0gXCJJbXBvcnRhbmNlXCIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjaGlsZHNUb3RhbCA9IGNoaWxkLmNvbmZpZGVuY2VQcm8gKyBjaGlsZC5jb25maWRlbmNlQ29uO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkc1RvdGFsID09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc2libGluZ1dlaWdodCA9IDA7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc2libGluZ1dlaWdodCA9IG1heFBvaW50cyAvIGNoaWxkc1RvdGFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vSWYgaXQgbm90IGEgY29uZmlkZW5jZSAoaXMgYW4gaW1wb3J0YW5jZSkgdGhlbiBkZWZhdWx0IHRoZSB3ZWlnaHQgdG8gMVxyXG4gICAgICAgICAgICBpZiAoY2hpbGQuc2libGluZ1dlaWdodCA9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5zaWJsaW5nV2VpZ2h0ID0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVDb25maWRlbmNlKHNjb3JlOiBTY29yZSkge1xyXG4gICAgICAgIHZhciBhdmdDb25mUHJvOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHZhciBhdmdDb25mQ29uOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHZhciBtYXhDb25mUHJvOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHZhciBtYXhDb25mQ29uOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHZhciBmb3VuZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIC8vQWRkIHVwIGFsbCB0aGUgY2hpbGRyZW4gcG9pbnRzXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGRJZCBvZiB0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5jaGlsZElkcykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uZGlzYWJsZWQpIGNvbnRpbnVlOyAvL3NraXAgaWYgZGlhYmxlZFxyXG4gICAgICAgICAgICBsZXQgY2hpbGQgPSB0aGlzLnNjb3Jlc1tjaGlsZElkXTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2xhaW1zW2NoaWxkLmNsYWltSWRdLmFmZmVjdHMgPT0gXCJBdmVyYWdlVGhlQ29uZmlkZW5jZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgYXZnQ29uZlBybyArPSBjaGlsZC5jb25maWRlbmNlUHJvICogY2hpbGQuaW1wb3J0YW5jZVZhbHVlICogY2hpbGQuc2libGluZ1dlaWdodDtcclxuICAgICAgICAgICAgICAgIGF2Z0NvbmZDb24gKz0gY2hpbGQuY29uZmlkZW5jZUNvbiAqIGNoaWxkLmltcG9ydGFuY2VWYWx1ZSAqIGNoaWxkLnNpYmxpbmdXZWlnaHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuY2xhaW1zW2NoaWxkLmNsYWltSWRdLmFmZmVjdHMgPT0gXCJNYXhpbXVtT2ZDb25maWRlbmNlXCIpIHtcclxuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHZhciB0ZW1wUHJvID0gY2hpbGQuY29uZmlkZW5jZVBybyAqIGNoaWxkLmltcG9ydGFuY2VWYWx1ZSAqIGNoaWxkLnNpYmxpbmdXZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGVtcENvbiA9IGNoaWxkLmNvbmZpZGVuY2VDb24gKiBjaGlsZC5pbXBvcnRhbmNlVmFsdWUgKiBjaGlsZC5zaWJsaW5nV2VpZ2h0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHRlbXBQcm8gLSB0ZW1wQ29uID4gbWF4Q29uZlBybyAtIG1heENvbmZDb24pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4Q29uZlBybyA9IHRlbXBQcm87XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1heENvbmZDb24gPSB0ZW1wQ29uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL0NhbGN1bGF0ZSB0aGUgUHJvIGFuZCBDb25cclxuICAgICAgICBpZiAoZm91bmQpIHtcclxuICAgICAgICAgICAgc2NvcmUuY29uZmlkZW5jZVBybyA9IGF2Z0NvbmZQcm8gKyBtYXhDb25mUHJvO1xyXG4gICAgICAgICAgICBzY29yZS5jb25maWRlbmNlQ29uID0gYXZnQ29uZkNvbiArIG1heENvbmZDb247XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gU2V0IHRoZSBkZWZhdWx0cyBpZiBubyBjb25maWRlbmNlIGl0ZW1zIHdlcmUgZm91bmRcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmlzUHJvTWFpbikge1xyXG4gICAgICAgICAgICAgICAgc2NvcmUuY29uZmlkZW5jZVBybyA9IDE7XHJcbiAgICAgICAgICAgICAgICBzY29yZS5jb25maWRlbmNlQ29uID0gMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNjb3JlLmNvbmZpZGVuY2VQcm8gPSAwO1xyXG4gICAgICAgICAgICAgICAgc2NvcmUuY29uZmlkZW5jZUNvbiA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vU2V0IHRoZSBtYXggQ29uZmlkZW5jZVxyXG4gICAgICAgIGlmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5pc1Byb01haW4gJiYgdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0ubWF4Q29uZikge1xyXG4gICAgICAgICAgICBpZiAoc2NvcmUuY29uZmlkZW5jZVBybyAvIChzY29yZS5jb25maWRlbmNlUHJvICsgc2NvcmUuY29uZmlkZW5jZUNvbikgPiAodGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0ubWF4Q29uZiAvIDEwMCkpIHtcclxuICAgICAgICAgICAgICAgIHNjb3JlLmNvbmZpZGVuY2VDb24gPSAxMCAtICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5tYXhDb25mIC8gMTApO1xyXG4gICAgICAgICAgICAgICAgc2NvcmUuY29uZmlkZW5jZVBybyA9IHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLm1heENvbmYgLyAxMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmlzUHJvTWFpbiAmJiB0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5tYXhDb25mKSB7XHJcbiAgICAgICAgICAgIGlmIChzY29yZS5jb25maWRlbmNlQ29uIC8gKHNjb3JlLmNvbmZpZGVuY2VDb24gKyBzY29yZS5jb25maWRlbmNlUHJvKSA+ICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5tYXhDb25mIC8gMTAwKSkge1xyXG4gICAgICAgICAgICAgICAgc2NvcmUuY29uZmlkZW5jZVBybyA9IDEwIC0gKHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLm1heENvbmYgLyAxMClcclxuICAgICAgICAgICAgICAgIHNjb3JlLmNvbmZpZGVuY2VDb24gPSB0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5tYXhDb25mIC8gMTBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vcHJldmVudHMgc3RhdGFtZW50cyBmb3JtICBpZiBub3QgdGhlIHRvcCBzdGF0ZW1lbnRcclxuICAgICAgICBpZiAoc2NvcmUuZ2VuZXJhdGlvbiAhPSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5pc1Byb01haW4gJiYgc2NvcmUuY29uZmlkZW5jZUNvbiA+IHNjb3JlLmNvbmZpZGVuY2VQcm8pXHJcbiAgICAgICAgICAgICAgICBzY29yZS5jb25maWRlbmNlUHJvID0gc2NvcmUuY29uZmlkZW5jZUNvblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmlzUHJvTWFpbiAmJiBzY29yZS5jb25maWRlbmNlUHJvID4gc2NvcmUuY29uZmlkZW5jZUNvbilcclxuICAgICAgICAgICAgICAgIHNjb3JlLmNvbmZpZGVuY2VDb24gPSBzY29yZS5jb25maWRlbmNlUHJvXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBUaGlzIHBlcmZvcm1zIEltcG9ydGFuY2UgY2FsY3VsYXRpb25zIGZvciBib3RoIENsYWltcyB0aGF0IGFmZmVjdCBDb25maWRlbmNlIGFuZCBJbXBvcnRhbmNlLlxyXG4gICAgICogQ29uZmlkZW5jZTogc3VtIGNoaWxkcmVuKGltcG9ydGFuY2UpIFxyXG4gICAgICogSW1wb3J0YW5jZTogKHNjb3JlLmltcG9ydGFuY2VQcm8gKyAxKSAvIChzY29yZS5pbXBvcnRhbmNlQ29uICsgMSkgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlSW1wb3J0YW5jZShzY29yZTogU2NvcmUpIHtcclxuICAgICAgICBpZiAodGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uYWZmZWN0cyA9PSBcIkltcG9ydGFuY2VcIikge1xyXG4gICAgICAgICAgICBzY29yZS5pbXBvcnRhbmNlUHJvID0gc2NvcmUuY29uZmlkZW5jZVBybztcclxuICAgICAgICAgICAgc2NvcmUuaW1wb3J0YW5jZUNvbiA9IHNjb3JlLmNvbmZpZGVuY2VDb247XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHByb0ltcG9ydGFuY2U6IG51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIHZhciBjb25JbXBvcnRhbmNlOiBudW1iZXIgPSAwO1xyXG4gICAgICAgICAgICAvL0FkZCB1cCBhbGwgdGhlIGltcG9ydGFuY2UgY2hpbGRyZW4gcG9pbnRzXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkSWQgb2YgdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uY2hpbGRJZHMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5kaXNhYmxlZCkgY29udGludWU7IC8vc2tpcCBpZiBkaWFibGVkXHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQgPSB0aGlzLnNjb3Jlc1tjaGlsZElkXTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNsYWltc1tjaGlsZC5jbGFpbUlkXS5hZmZlY3RzID09IFwiSW1wb3J0YW5jZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvSW1wb3J0YW5jZSArPSBjaGlsZC5pbXBvcnRhbmNlUHJvO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbkltcG9ydGFuY2UgKz0gY2hpbGQuaW1wb3J0YW5jZUNvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzY29yZS5pbXBvcnRhbmNlUHJvID0gcHJvSW1wb3J0YW5jZTtcclxuICAgICAgICAgICAgc2NvcmUuaW1wb3J0YW5jZUNvbiA9IGNvbkltcG9ydGFuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjb3JlLmltcG9ydGFuY2VWYWx1ZSA9IHRoaXMuc2FmZURpdmlkZShzY29yZS5pbXBvcnRhbmNlUHJvICsgMSwgc2NvcmUuaW1wb3J0YW5jZUNvbiArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBDb3VudCB0aGUgbnVtYmVyIG9mIGRlc2NlbmRhbnRzICovXHJcbiAgICBwcml2YXRlIGNvdW50TnVtRGVzYyhzY29yZTogU2NvcmUpIHtcclxuICAgICAgICBzY29yZS5udW1EZXNjID0gMDtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZElkIG9mIHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmNoaWxkSWRzKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5kaXNhYmxlZCkgY29udGludWU7IC8vc2tpcCBpZiBkaWFibGVkXHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IHRoaXMuc2NvcmVzW2NoaWxkSWRdO1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQubnVtRGVzYylcclxuICAgICAgICAgICAgICAgIHNjb3JlLm51bURlc2MgKz0gY2hpbGQubnVtRGVzYyArIDE7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHNjb3JlLm51bURlc2MgKz0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGVwM0Rlc2NlbmRDbGFpbXMoc2NvcmU6IFNjb3JlLCBwYXJlbnQ/OiBTY29yZSkge1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlbWF4QW5jZXN0b3JXZWlnaHQoc2NvcmUsIHBhcmVudCk7XHJcbiAgICAgICAgc2NvcmUud2VpZ2h0UHJvID0gc2NvcmUuY29uZmlkZW5jZVBybyAqIHNjb3JlLmltcG9ydGFuY2VWYWx1ZSAqIHNjb3JlLm1heEFuY2VzdG9yV2VpZ2h0O1xyXG4gICAgICAgIHNjb3JlLndlaWdodENvbiA9IHNjb3JlLmNvbmZpZGVuY2VDb24gKiBzY29yZS5pbXBvcnRhbmNlVmFsdWUgKiBzY29yZS5tYXhBbmNlc3RvcldlaWdodDtcclxuICAgICAgICBzY29yZS53ZWlnaHREaWYgPSBzY29yZS53ZWlnaHRQcm8gLSBzY29yZS53ZWlnaHRDb247XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVNYWluUGVyY2VudChzY29yZSwgcGFyZW50KTtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZElkIG9mIHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmNoaWxkSWRzKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5kaXNhYmxlZCkgY29udGludWU7IC8vc2tpcCBpZiBkaWFibGVkXHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IHRoaXMuc2NvcmVzW2NoaWxkSWRdO1xyXG4gICAgICAgICAgICB0aGlzLnN0ZXAzRGVzY2VuZENsYWltcyhjaGlsZCwgc2NvcmUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0ZXA0QXNjZW5kQ2xhaW1zKHNjb3JlOiBTY29yZSwgcGFyZW50PzogU2NvcmUpIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZElkIG9mIHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmNoaWxkSWRzKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5kaXNhYmxlZCkgY29udGludWU7IC8vc2tpcCBpZiBkaWFibGVkXHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IHRoaXMuc2NvcmVzW2NoaWxkSWRdO1xyXG4gICAgICAgICAgICB0aGlzLnN0ZXA0QXNjZW5kQ2xhaW1zKGNoaWxkLCBzY29yZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlV2VpZ2h0ZWRQZXJjZW50YWdlKHNjb3JlLCBwYXJlbnQpO1xyXG4gICAgICAgIHRoaXMuc29ydChzY29yZSwgcGFyZW50KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEZpbmQgdGhlIG1heGltdW0gc2libGluZyB3ZWlnaHQgb2YgYWxsIG15IGFuY2VzdG9yc1xyXG4gICAgICogbWF4KHBhcmVudC5tYXhBbmNlc3RvcldlaWdodCwgcy5zaWJsaW5nV2VpZ2h0KSAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVtYXhBbmNlc3RvcldlaWdodChzY29yZTogU2NvcmUsIHBhcmVudDogU2NvcmUpIHtcclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgIHNjb3JlLm1heEFuY2VzdG9yV2VpZ2h0ID0gTWF0aC5tYXgocGFyZW50Lm1heEFuY2VzdG9yV2VpZ2h0LCBzY29yZS5zaWJsaW5nV2VpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNjb3JlLm1heEFuY2VzdG9yV2VpZ2h0ID0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVNYWluUGVyY2VudChzY29yZTogU2NvcmUsIHBhcmVudDogU2NvcmUpIHtcclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5hZmZlY3RzID09IFwiSW1wb3J0YW5jZVwiKVxyXG4gICAgICAgICAgICAgICAgc2NvcmUubWFpblBlcmNlbnQgPSBwYXJlbnQubWFpblBlcmNlbnQgKiAodGhpcy5zYWZlRGl2aWRlKHNjb3JlLmNvbmZpZGVuY2VQcm8gKyBzY29yZS5jb25maWRlbmNlQ29uLCBwYXJlbnQuY29uZmlkZW5jZVBybyArIHBhcmVudC5jb25maWRlbmNlQ29uKSlcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgc2NvcmUubWFpblBlcmNlbnQgPSBwYXJlbnQubWFpblBlcmNlbnQgKiAodGhpcy5zYWZlRGl2aWRlKHNjb3JlLndlaWdodFBybyArIHNjb3JlLndlaWdodENvbiwgcGFyZW50LndlaWdodFBybyArIHBhcmVudC53ZWlnaHRDb24pKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNjb3JlLm1haW5QZXJjZW50ID0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVXZWlnaHRlZFBlcmNlbnRhZ2Uoc2NvcmU6IFNjb3JlLCBwYXJlbnQ6IFNjb3JlKSB7XHJcbiAgICAgICAgdmFyIFdlaWdodGVkUGx1c2VzID0gMDtcclxuICAgICAgICB2YXIgV2VpZ2h0ZWRNaW51c2VzID0gMDtcclxuICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZElkIG9mIHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmNoaWxkSWRzKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5kaXNhYmxlZCkgY29udGludWU7IC8vc2tpcCBpZiBkaXNhYmxlZFxyXG4gICAgICAgICAgICBmb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZCA9IHRoaXMuc2NvcmVzW2NoaWxkSWRdO1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQud2VpZ2h0RGlmID4gMClcclxuICAgICAgICAgICAgICAgIFdlaWdodGVkUGx1c2VzICs9IGNoaWxkLndlaWdodERpZlxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBXZWlnaHRlZE1pbnVzZXMgKz0gY2hpbGQud2VpZ2h0RGlmXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzY29yZS5hbmltYXRlZFdlaWdodGVkUGVyY2VudGFnZSA9IHNjb3JlLndlaWdodGVkUGVyY2VudGFnZTtcclxuICAgICAgICBpZiAoZm91bmQpIHtcclxuICAgICAgICAgICAgaWYgKFdlaWdodGVkUGx1c2VzIC0gV2VpZ2h0ZWRNaW51c2VzID09PSAwKVxyXG4gICAgICAgICAgICAgICAgc2NvcmUud2VpZ2h0ZWRQZXJjZW50YWdlID0gMDtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgc2NvcmUud2VpZ2h0ZWRQZXJjZW50YWdlID0gV2VpZ2h0ZWRQbHVzZXMgLyAoV2VpZ2h0ZWRQbHVzZXMgLSBXZWlnaHRlZE1pbnVzZXMpO1xyXG4gICAgICAgIH0gZWxzZSBzY29yZS53ZWlnaHRlZFBlcmNlbnRhZ2UgPSAxO1xyXG5cclxuICAgICAgICAvL1ByZXZlbnQgTkFOIGZpcnN0IHRpbWUgdGhyb3VnaCBieSBzZXR0aW5nIGFuaW1hdGVkV2VpZ2h0ZWRQZXJjZW50YWdlIGlmIGl0IGlzIHRoZSBmaXJzdCB0aW1lIHRocm91Z2hcclxuICAgICAgICBpZiAoc2NvcmUuYW5pbWF0ZWRXZWlnaHRlZFBlcmNlbnRhZ2UgPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICBzY29yZS5hbmltYXRlZFdlaWdodGVkUGVyY2VudGFnZSA9IHNjb3JlLndlaWdodGVkUGVyY2VudGFnZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNvcnQoc2NvcmU6IFNjb3JlLCBwYXJlbnQ6IFNjb3JlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNob3VsZFNvcnQpIHJldHVybjtcclxuICAgICAgICB0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5jaGlsZElkcy5zb3J0KChhLCBiKSA9PlxyXG4gICAgICAgICAgICBNYXRoLmFicyh0aGlzLnNjb3Jlc1tiXS53ZWlnaHREaWYpIC0gTWF0aC5hYnModGhpcy5zY29yZXNbYV0ud2VpZ2h0RGlmKVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzYWZlRGl2aWRlKG51bWVyYXRvcjogbnVtYmVyLCBkZW5vbWVyYXRvcjogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAoZGVub21lcmF0b3IgPT0gMCkvLyBBdm9pZCBkaXZpc2lvbiBieSB6ZXJvXHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIG51bWVyYXRvciAvIGRlbm9tZXJhdG9yO1xyXG4gICAgfVxyXG5cclxufVxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvU2V0dGxlSXQudHMiLCJkZWNsYXJlIHZhciBmaXJlYmFzZTogYW55O1xyXG5cclxuZGVjbGFyZSBjbGFzcyBoeXBlckhUTUwge1xyXG4gICAgc3RhdGljIHdpcmUob3B0T2JqOiBhbnkpOiBhbnk7XHJcbn1cclxuXHJcblxyXG50eXBlIFdoaWNoQ29weSA9IFwib3JpZ2luYWxcIiB8IFwibG9jYWxcIiB8IFwic3VnZ2VzdGlvblwiO1xyXG5cclxuY2xhc3MgUlJEaXNwbGF5IHtcclxuICAgIHVzZXJOYW1lOiBzdHJpbmcgPSAnU2lnbiBJbic7XHJcbiAgICByclJlZjogYW55Oy8vVGhlIGN1cnJlbnQgZmlyZWJhc2UgcmVmZXJlbmNlIHRvIHRoZSBSZWFzb25Sb290IG9iamVjdFxyXG4gICAgc2NvcmVzOiBEaWN0PFNjb3JlPjtcclxuICAgIGNsYWltczogRGljdDxDbGFpbT47XHJcbiAgICBzZXR0bGVJdDogU2V0dGxlSXQ7XHJcbiAgICBtYWluU2NvcmU6IFNjb3JlO1xyXG4gICAgcmVuZGVyOiBhbnk7XHJcbiAgICBzZXR0aW5nczogYW55ID0ge307XHJcbiAgICBzZWxlY3RlZFNjb3JlOiBTY29yZTtcclxuICAgIHNhdmVQcmVmaXg6IHN0cmluZyA9IFwicnJfXCI7XHJcbiAgICAvL2RiUmVmOiBmaXJlYmFzZS5kYXRhYmFzZS5SZWZlcmVuY2U7XHJcbiAgICBkYjogYW55O1xyXG4gICAgcnI6IFJvb3QgPSBuZXcgUm9vdCgpO1xyXG4gICAgd2hpY2hDb3B5OiBXaGljaENvcHk7XHJcbiAgICBzZXR0aW5nc1Zpc2libGU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIGxpc3RlbmVyUmVmczogYW55W10gPSBuZXcgQXJyYXk8YW55PigpO1xyXG4gICAgY2FuV3JpdGU6IGJvb2xlYW47XHJcblxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNsYWltRWxlbWVudDogRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMucmVuZGVyID0gaHlwZXJIVE1MLmJpbmQoY2xhaW1FbGVtZW50KTtcclxuICAgICAgICB0aGlzLnNldHRsZUl0ID0gbmV3IFNldHRsZUl0KCk7XHJcbiAgICAgICAgdGhpcy5yciA9IEpTT04ucGFyc2UoY2xhaW1FbGVtZW50LmdldEF0dHJpYnV0ZSgncm9vdCcpKTtcclxuICAgICAgICB0aGlzLmZpcmViYXNlSW5pdCgpO1xyXG4gICAgICAgIHRoaXMuY2hhbmdlV2hpY2hDb3B5KFwib3JpZ2luYWxcIik7XHJcbiAgICAgICAgLy90aGlzLmF0dGFjaERCKCk7XHJcbiAgICAgICAgLy90aGlzLmluaXRScigpO1xyXG4gICAgICAgIC8vdGhpcy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0UnIoKSB7XHJcbiAgICAgICAgdGhpcy5jbGFpbXMgPSB0aGlzLnJyLmNsYWltcztcclxuICAgICAgICBpZiAodGhpcy5yci5zZXR0aW5ncykgdGhpcy5zZXR0aW5ncyA9IHRoaXMucnIuc2V0dGluZ3M7XHJcbiAgICAgICAgdGhpcy5zY29yZXMgPSBjcmVhdGVEaWN0KHRoaXMuY2xhaW1zKTtcclxuICAgICAgICB0aGlzLm1haW5TY29yZSA9IHRoaXMuc2NvcmVzW3RoaXMucnIubWFpbklkXTtcclxuICAgICAgICB0aGlzLm1haW5TY29yZS5pc01haW4gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuc2V0dGxlSXQuY2FsY3VsYXRlKHRoaXMucnIubWFpbklkLCB0aGlzLmNsYWltcywgdGhpcy5zY29yZXMpXHJcbiAgICAgICAgdGhpcy5zZXREaXNwbGF5U3RhdGUoKTtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNoYW5nZVdoaWNoQ29weSh3aGljaENvcHk/OiBXaGljaENvcHkpIHtcclxuICAgICAgICBpZiAodGhpcy53aGljaENvcHkgPT09IHdoaWNoQ29weSkgcmV0dXJuXHJcbiAgICAgICAgdGhpcy53aGljaENvcHkgPSB3aGljaENvcHlcclxuXHJcbiAgICAgICAgaWYgKHdoaWNoQ29weSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIC8vRGV0ZXJtaW5lIHdoaWNoIG9uZSB0byBwb2ludCB0byBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vQ2xlYXIgYW55IGV4aXN0aW5nIG9ic2VydmVyc1xyXG4gICAgICAgIGZvciAobGV0IHJlZiBvZiB0aGlzLmxpc3RlbmVyUmVmcykgcmVmLm9mZigpO1xyXG5cclxuICAgICAgICBpZiAod2hpY2hDb3B5ID09PSBcImxvY2FsXCIpIHtcclxuICAgICAgICAgICAgLy9wdWxsIGxvY2FsIGRhdGEgaWYgaXQgZXhpc3RzIGFuZCBzZXQgaXQgdG8gc2F2ZVxyXG5cclxuICAgICAgICAgICAgbGV0IHJyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5zYXZlUHJlZml4ICsgdGhpcy5yci5tYWluSWQpO1xyXG4gICAgICAgICAgICBpZiAocnIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucnIgPSBKU09OLnBhcnNlKHJyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5maXJlYmFzZUluaXQoKTtcclxuICAgICAgICAgICAgaWYgKHdoaWNoQ29weSA9PT0gXCJvcmlnaW5hbFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJyUmVmID0gdGhpcy5kYi5yZWYoJ3Jvb3RzLycgKyB0aGlzLnJyLm1haW5JZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAod2hpY2hDb3B5ID09PSBcInN1Z2dlc3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgLy90byBkbyBGaW5kIHRoZSBJRCBvZiBteSBzdWdnZXN0aW9uXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJyUmVmID0gdGhpcy5kYi5yZWYoJ3Jvb3RzLycgKyB0aGlzLnJyLm1haW5JZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hdHRhY2hEQigpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdFJyKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2hEQigpIHtcclxuICAgICAgICBsZXQgY2xhaW1zUmVmID0gdGhpcy5yclJlZi5jaGlsZCgnY2xhaW1zJyk7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lclJlZnMucHVzaChjbGFpbXNSZWYpO1xyXG4gICAgICAgIGNsYWltc1JlZi5vbmNlKCd2YWx1ZScsIHRoaXMuY2xhaW1zRnJvbURCLmJpbmQodGhpcykpO1xyXG4gICAgICAgIGNsYWltc1JlZi5vbignY2hpbGRfY2hhbmdlZCcsIHRoaXMuY2xhaW1Gcm9tREIuYmluZCh0aGlzKSk7XHJcblxyXG4gICAgICAgIC8vQ2hlY2sgZm9yIHdyaXRlIHBlcm1pc3Npb25zXHJcbiAgICAgICAgaWYgKGZpcmViYXNlLmF1dGgoKS5jdXJyZW50VXNlcikge1xyXG4gICAgICAgICAgICBsZXQgcGVybWlzc2lvblJlZiA9IHRoaXMuZGIucmVmKCdwZXJtaXNzaW9ucy91c2VyLycgKyBmaXJlYmFzZS5hdXRoKCkuY3VycmVudFVzZXIudWlkICsgXCIvXCIgKyB0aGlzLnJyLm1haW5JZClcclxuICAgICAgICAgICAgdGhpcy5saXN0ZW5lclJlZnMucHVzaChwZXJtaXNzaW9uUmVmKTtcclxuXHJcbiAgICAgICAgICAgIC8vVG8gZG8gdGhlIGNhbiB3cml0ZSBiZWxvdyBpcyBvbiB0aGUgd3JvbmcgXCJ0aGlzXCJcclxuICAgICAgICAgICAgcGVybWlzc2lvblJlZi5vbigndmFsdWUnLCBmdW5jdGlvbiAoc25hcHNob3QpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FuV3JpdGUgPSBzbmFwc2hvdC52YWwoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNhbldyaXRlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZpcmViYXNlSW5pdCgpIHtcclxuICAgICAgICBpZiAoIWZpcmViYXNlLmFwcHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGZpcmViYXNlLmluaXRpYWxpemVBcHAoe1xyXG4gICAgICAgICAgICAgICAgYXBpS2V5OiBcIkFJemFTeUFIX1VPX2YyRjNPdVZMZlp2QXFlekV1am5NZXNteDZoQVwiLFxyXG4gICAgICAgICAgICAgICAgYXV0aERvbWFpbjogXCJzZXR0bGVpdG9yZy5maXJlYmFzZWFwcC5jb21cIixcclxuICAgICAgICAgICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vc2V0dGxlaXRvcmcuZmlyZWJhc2Vpby5jb21cIixcclxuICAgICAgICAgICAgICAgIHByb2plY3RJZDogXCJzZXR0bGVpdG9yZ1wiLFxyXG4gICAgICAgICAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJzZXR0bGVpdG9yZy5hcHBzcG90LmNvbVwiLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnaW5nU2VuZGVySWQ6IFwiODM1NTc0MDc5ODQ5XCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGIgPSBmaXJlYmFzZS5kYXRhYmFzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNsYWltc0Zyb21EQihkYXRhOiBhbnkpIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSBkYXRhLnZhbCgpO1xyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnJyLmNsYWltcyA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLmNsYWltcyA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbGFpbUZyb21EQihkYXRhOiBhbnkpIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSBkYXRhLnZhbCgpO1xyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICBsZXQgY2xhaW06IENsYWltID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuY2xhaW1zW2NsYWltLmNsYWltSWRdID0gY2xhaW07XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyRGlzcGxheVN0YXRlKCk6IHZvaWQge1xyXG4gICAgICAgIGZvciAobGV0IHNjb3JlSWQgaW4gdGhpcy5zY29yZXMpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2NvcmVzLmhhc093blByb3BlcnR5KHNjb3JlSWQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3Jlc1tzY29yZUlkXS5kaXNwbGF5U3RhdGUgPSBcIm5vdFNlbGVjdGVkXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RGlzcGxheVN0YXRlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY2xlYXJEaXNwbGF5U3RhdGUoKTtcclxuICAgICAgICB0aGlzLnNldERpc3BsYXlTdGF0ZUxvb3AodGhpcy5tYWluU2NvcmUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldERpc3BsYXlTdGF0ZUxvb3Aoc2NvcmU6IFNjb3JlKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHNjb3JlID09IHRoaXMuc2VsZWN0ZWRTY29yZSlcclxuICAgICAgICAgICAgc2NvcmUuZGlzcGxheVN0YXRlID0gXCJzZWxlY3RlZFwiO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBjaGlsZElkIG9mIHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmNoaWxkSWRzKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGlsZFNjb3JlID0gdGhpcy5zY29yZXNbY2hpbGRJZF07XHJcbiAgICAgICAgICAgIC8vcHJvY2VzcyB0aGUgY2hpbGRyZW4gZmlyc3QvXHJcbiAgICAgICAgICAgIHRoaXMuc2V0RGlzcGxheVN0YXRlTG9vcChjaGlsZFNjb3JlKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChjaGlsZFNjb3JlID09IHRoaXMuc2VsZWN0ZWRTY29yZSkge1xyXG4gICAgICAgICAgICAgICAgc2NvcmUuZGlzcGxheVN0YXRlID0gXCJwYXJlbnRcIjtcclxuICAgICAgICAgICAgICAgIC8vU2V0IFNpYmxpbmdzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBzaWJsaW5nSWQgb2YgdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF0uY2hpbGRJZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2libGluZ1Njb3JlID0gdGhpcy5zY29yZXNbc2libGluZ0lkXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2libGluZ1Njb3JlLmRpc3BsYXlTdGF0ZSAhPSBcInNlbGVjdGVkXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpYmxpbmdTY29yZS5kaXNwbGF5U3RhdGUgPSBcInNpYmxpbmdcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNoaWxkU2NvcmUuZGlzcGxheVN0YXRlID09IFwiYW5jZXN0b3JcIiB8fCBjaGlsZFNjb3JlLmRpc3BsYXlTdGF0ZSA9PSBcInBhcmVudFwiKVxyXG4gICAgICAgICAgICAgICAgc2NvcmUuZGlzcGxheVN0YXRlID0gXCJhbmNlc3RvclwiO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNjb3JlID09IHRoaXMuc2VsZWN0ZWRTY29yZSlcclxuICAgICAgICAgICAgICAgIGNoaWxkU2NvcmUuZGlzcGxheVN0YXRlID0gXCJjaGlsZFwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgLy8gaWYgKCF0aGlzLnNldHRpbmdzLm5vQXV0b1NhdmUpXHJcbiAgICAgICAgLy8gICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuc2F2ZVByZWZpeCArIHRoaXMucm9vdC5tYWluSWQsIEpTT04uc3RyaW5naWZ5KHRoaXMuc2NvcmVzKSk7XHJcblxyXG4gICAgICAgIHRoaXMucmVuZGVyYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCIkeydycicgK1xyXG4gICAgICAgICAgICAodGhpcy5zZXR0aW5ncy5oaWRlU2NvcmUgPyAnIGhpZGVTY29yZScgOiAnJykgK1xyXG4gICAgICAgICAgICAodGhpcy5zZXR0aW5ncy5oaWRlUG9pbnRzID8gJyBoaWRlUG9pbnRzJyA6ICcnKSArXHJcbiAgICAgICAgICAgICh0aGlzLnNldHRpbmdzLmhpZGVDbGFpbU1lbnUgPyAnIGhpZGVDbGFpbU1lbnUnIDogJycpICtcclxuICAgICAgICAgICAgKHRoaXMuc2V0dGluZ3MuaGlkZUNoaWxkSW5kaWNhdG9yID8gJyBoaWRlQ2hpbGRJbmRpY2F0b3InIDogJycpICtcclxuICAgICAgICAgICAgKHRoaXMuc2V0dGluZ3Muc2hvd1NpYmxpbmdzID8gJyBzaG93U2libGluZ3MnIDogJycpICtcclxuICAgICAgICAgICAgKHRoaXMuc2V0dGluZ3Muc2hvd0NvbXBldGl0aW9uID8gJyBzaG93Q29tcGV0aXRpb24nIDogJycpXHJcblxyXG4gICAgICAgICAgICB9XCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3MgPSBcIiR7J3NldHRpbmdzSGlkZXIgJyArICh0aGlzLnNldHRpbmdzVmlzaWJsZSA/ICdvcGVuJyA6ICcnKX1cIj4gXHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgaWQ9XCJoaWRlU2NvcmVcIiBiaW5kPVwiaGlkZVNjb3JlXCIgdmFsdWU9XCJoaWRlU2NvcmVcIiBvbmNsaWNrPVwiJHt0aGlzLnVwZGF0ZVNldHRpbmdzLmJpbmQodGhpcywgdGhpcy5zZXR0aW5ncyl9XCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiaGlkZVNjb3JlXCI+SGlkZSBTY29yZTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgaWQ9XCJoaWRlUG9pbnRzXCIgYmluZD1cImhpZGVQb2ludHNcIiB2YWx1ZT1cImhpZGVQb2ludHNcIiBvbmNsaWNrPVwiJHt0aGlzLnVwZGF0ZVNldHRpbmdzLmJpbmQodGhpcywgdGhpcy5zZXR0aW5ncyl9XCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiaGlkZVBvaW50c1wiPkhpZGUgUG9pbnRzPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cIm5vQXV0b1NhdmVcIiBiaW5kPVwibm9BdXRvU2F2ZVwiIHZhbHVlPVwibm9BdXRvU2F2ZVwiIG9uY2xpY2s9XCIke3RoaXMudXBkYXRlU2V0dGluZ3MuYmluZCh0aGlzLCB0aGlzLnNldHRpbmdzKX1cIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJub0F1dG9TYXZlXCI+Tm8gQXV0byBTYXZlPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cInNob3dTaWJsaW5nc1wiIGJpbmQ9XCJzaG93U2libGluZ3NcIiB2YWx1ZT1cInNob3dTaWJsaW5nc1wiIG9uY2xpY2s9XCIke3RoaXMudXBkYXRlU2V0dGluZ3MuYmluZCh0aGlzLCB0aGlzLnNldHRpbmdzKX1cIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJzaG93U2libGluZ3NcIj5TaG93IFNpYmxsaW5nczwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgaWQ9XCJoaWRlQ2xhaW1NZW51XCIgYmluZD1cImhpZGVDbGFpbU1lbnVcIiB2YWx1ZT1cImhpZGVDbGFpbU1lbnVcIiBvbmNsaWNrPVwiJHt0aGlzLnVwZGF0ZVNldHRpbmdzLmJpbmQodGhpcywgdGhpcy5zZXR0aW5ncyl9XCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiaGlkZUNsYWltTWVudVwiPkhpZGUgQ2xhaW0gTWVudTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgaWQ9XCJoaWRlQ2hpbGRJbmRpY2F0b3JcIiBiaW5kPVwiaGlkZUNoaWxkSW5kaWNhdG9yXCIgdmFsdWU9XCJoaWRlQ2hpbGRJbmRpY2F0b3JcIiBvbmNsaWNrPVwiJHt0aGlzLnVwZGF0ZVNldHRpbmdzLmJpbmQodGhpcywgdGhpcy5zZXR0aW5ncyl9XCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiaGlkZUNoaWxkSW5kaWNhdG9yXCI+SGlkZSBDaGlsZCBJbmRpY2F0b3I8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGlkPVwic2hvd0NvbXBldGl0aW9uXCIgYmluZD1cInNob3dDb21wZXRpdGlvblwiIHZhbHVlPVwic2hvd0NvbXBldGl0aW9uXCIgb25jbGljaz1cIiR7dGhpcy51cGRhdGVTZXR0aW5ncy5iaW5kKHRoaXMsIHRoaXMuc2V0dGluZ3MpfVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cInNob3dDb21wZXRpdGlvblwiPlNob3cgQ29tcGV0aXRpb248L2xhYmVsPlxyXG5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCB2YWx1ZT1cIiR7dGhpcy5yZXBsYWNlQWxsKEpTT04uc3RyaW5naWZ5KHRoaXMucnIpLCAnXFwnJywgJyYjMzk7Jyl9XCI+PC9pbnB1dD5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgPGRpdiAgb25jbGljaz1cIiR7dGhpcy5zaWduSW4uYmluZCh0aGlzKX1cIj4gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFske3RoaXMudXNlck5hbWV9IF1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2PiR7dGhpcy5yZW5kZXJOb2RlKHRoaXMuc2NvcmVzW3RoaXMucnIubWFpbklkXSl9PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nc0J1dHRvblwiIG9uY2xpY2s9XCIke3RoaXMudG9nZ2xlU2V0dGluZ3MuYmluZCh0aGlzKX1cIj4gXHJcbiAgICAgICAgICAgICAgICDimplcclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+YDtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVTZXR0aW5ncyhzZXR0aW5nczogYW55LCBldmVudDogYW55KTogdm9pZCB7XHJcbiAgICAgICAgc2V0dGluZ3NbZXZlbnQuc3JjRWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJiaW5kXCIpXSA9IGV2ZW50LnNyY0VsZW1lbnQuY2hlY2tlZDtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgIGlmIChldmVudCkgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdG9nZ2xlU2V0dGluZ3MoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc1Zpc2libGUgPSAhdGhpcy5zZXR0aW5nc1Zpc2libGU7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXBsYWNlQWxsKHRhcmdldDogc3RyaW5nLCBzZWFyY2g6IHN0cmluZywgcmVwbGFjZW1lbnQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldC5zcGxpdChzZWFyY2gpLmpvaW4ocmVwbGFjZW1lbnQpO1xyXG4gICAgfTtcclxuXHJcbiAgICByZW5kZXJOb2RlKHNjb3JlOiBTY29yZSwgcGFyZW50PzogU2NvcmUpOiB2b2lkIHtcclxuICAgICAgICB2YXIgY2xhaW06IENsYWltID0gdGhpcy5jbGFpbXNbc2NvcmUuY2xhaW1JZF07XHJcbiAgICAgICAgdmFyIHdpcmUgPSBoeXBlckhUTUwud2lyZShzY29yZSk7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0ZW51bWJlcnMoKVxyXG5cclxuICAgICAgICB2YXIgcmVzdWx0ID0gd2lyZWBcclxuICAgICAgICAgICAgICAgIDxsaSBpZD1cIiR7Y2xhaW0uY2xhaW1JZH1cIiBjbGFzcz1cIiR7XHJcbiAgICAgICAgICAgIHNjb3JlLmRpc3BsYXlTdGF0ZSArXHJcbiAgICAgICAgICAgIChzY29yZS5pc01haW4gPyAnIG1haW5DbGFpbScgOiAnJykgK1xyXG4gICAgICAgICAgICAodGhpcy5zZXR0aW5ncy5pc0VkaXRpbmcgJiYgdGhpcy5zZWxlY3RlZFNjb3JlID09IHNjb3JlID8gJyBlZGl0aW5nJyA6ICcnKX1cIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2xhaW1QYWRcIiBvbmNsaWNrPVwiJHt0aGlzLnNlbGVjdFNjb3JlLmJpbmQodGhpcywgc2NvcmUpfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtcImNsYWltIFwiICsgKGNsYWltLmlzUHJvTWFpbiA/ICdwcm8nIDogJ2NvbicpICsgKGNsYWltLmRpc2FibGVkID8gJyBkaXNhYmxlZCAnIDogJycpICsgKGNsYWltLmNoaWxkSWRzLmxlbmd0aCA+IDAgJiYgIXNjb3JlLm9wZW4gPyAnIHNoYWRvdycgOiAnJyl9XCIgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImlubmVyQ2xhaW1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIiR7c2NvcmUuZ2VuZXJhdGlvbiA9PSAwID8gJ3Njb3JlJyA6ICdwb2ludHMnfVwiID4ke1xyXG4gICAgICAgICAgICAoc2NvcmUuZ2VuZXJhdGlvbiA9PSAwID9cclxuICAgICAgICAgICAgICAgIE1hdGgucm91bmQoc2NvcmUuYW5pbWF0ZWRXZWlnaHRlZFBlcmNlbnRhZ2UgKiAxMDApICsgJyUnIDpcclxuICAgICAgICAgICAgICAgIChzY29yZS53ZWlnaHREaWYgIT0gdW5kZWZpbmVkID8gTWF0aC5mbG9vcihNYXRoLmFicyhzY29yZS53ZWlnaHREaWYpKSA6ICcnKSlcclxuICAgICAgICAgICAgfTwvc3Bhbj5cclxuXHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHJvUG9pbnRzXCIgPiR7TWF0aC5yb3VuZChzY29yZS53ZWlnaHRQcm8pfTwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjb25Qb2ludHNcIiA+JHtNYXRoLnJvdW5kKHNjb3JlLndlaWdodENvbil9PC9zcGFuPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2NsYWltLmNvbnRlbnR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtjbGFpbS5tYXhDb25mICYmIGNsYWltLm1heENvbmYgPCAxMDAgPyBcIiAobWF4aW11bSBjb25maWRlbmNlIHNldCB0byBcIiArIGNsYWltLm1heENvbmYgKyBcIiUpIFwiIDogXCJcIn1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJHtjbGFpbS5jaXRhdGlvblVybH1cIiBvbmNsaWNrPVwiJHt0aGlzLm5vQnViYmxlQ2xpY2t9XCI+IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNpdGF0aW9uXCI+JHtjbGFpbS5jaXRhdGlvbn08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtcImNoaWxkSW5kaWNhdG9yU3BhY2VcIiArIChjbGFpbS5jaGlsZElkcy5sZW5ndGggPT0gMCA/ICcnIDogJyBoYXNDaGlsZHJlbicpfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7XCJjaGlsZEluZGljYXRvciBcIiArIChjbGFpbS5pc1Byb01haW4gPyAncHJvJyA6ICdjb24nKX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjaGlsZEluZGljYXRvcklubmVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3Njb3JlLm51bURlc2N9IG1vcmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNsYWltRWRpdEhpZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2xhaW1FZGl0U2VjdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBiaW5kPVwiY29udGVudFwiICBvbmlucHV0PVwiJHt0aGlzLnVwZGF0ZUNsYWltLmJpbmQodGhpcywgY2xhaW0pfVwiID48YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGJpbmQ9XCJjaXRhdGlvblwiIG9uaW5wdXQ9XCIke3RoaXMudXBkYXRlQ2xhaW0uYmluZCh0aGlzLCBjbGFpbSl9XCIgPjxicj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgYmluZD1cImNpdGF0aW9uVXJsXCIgb25pbnB1dD1cIiR7dGhpcy51cGRhdGVDbGFpbS5iaW5kKHRoaXMsIGNsYWltKX1cIiA+PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJtYXhDb25mXCIgPk1heGltdW0gQ29uZmlkZW5jZSA8L2xhYmVsPjxici8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGJpbmQ9XCJtYXhDb25mXCIgbmFtZT1cIm1heENvbmZcIiB0eXBlPVwibnVtYmVyXCIgb25pbnB1dD1cIiR7dGhpcy51cGRhdGVDbGFpbS5iaW5kKHRoaXMsIGNsYWltKX1cIiA+PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBiaW5kPVwiaXNQcm9NYWluXCIgb25jbGljaz1cIiR7dGhpcy51cGRhdGVDbGFpbS5iaW5kKHRoaXMsIGNsYWltKX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiaXNQcm9NYWluXCI+RG9lcyB0aGlzIGNsYWltIHN1cHBvcnRzIHRoZSBtYWluIGNsYWltPzwvbGFiZWw+PGJyLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgYmluZD1cImRpc2FibGVkXCIgb25jbGljaz1cIiR7dGhpcy51cGRhdGVDbGFpbS5iaW5kKHRoaXMsIGNsYWltKX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiZGlzYWJsZWRcIj5EaXNhYmxlZD88L2xhYmVsPjxici8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbmNsaWNrPVwiJHt0aGlzLnJlbW92ZUNsYWltLmJpbmQodGhpcywgY2xhaW0sIHBhcmVudCl9XCIgbmFtZT1cImJ1dHRvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZW1vdmUgdGhpcyBjbGFpbSBmcm9tIGl0J3MgcGFyZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+PGJyLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJRDoke2NsYWltLmNsYWltSWR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2xhaW1NZW51SGlkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjbGFpbU1lbnVTZWN0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFkZENsYWltIHByb1wiIG9uY2xpY2s9XCIke3RoaXMuYWRkQ2xhaW0uYmluZCh0aGlzLCBzY29yZSwgdHJ1ZSl9XCI+YWRkPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFkZENsYWltIGNvblwiIG9uY2xpY2s9XCIke3RoaXMuYWRkQ2xhaW0uYmluZCh0aGlzLCBzY29yZSwgZmFsc2UpfVwiPmFkZDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJlZGl0Q2xhaW1CdXR0b25cIiBvbmNsaWNrPVwiJHt0aGlzLmVkaXRDbGFpbS5iaW5kKHRoaXMsIHNjb3JlKX1cIj5lZGl0PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiAgXHJcbiAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICA8dWw+JHtcclxuICAgICAgICAgICAgY2xhaW0uY2hpbGRJZHMubWFwKChjaGlsZElkLCBpKSA9PiB0aGlzLnJlbmRlck5vZGUodGhpcy5zY29yZXNbY2hpbGRJZF0sIHNjb3JlKSlcclxuICAgICAgICAgICAgfTwvdWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+YFxyXG5cclxuICAgICAgICBpZiAoIXdpcmUuZGVmYXVsdCkge1xyXG4gICAgICAgICAgICB3aXJlLmRlZmF1bHQgPSBjbGFpbS5jb250ZW50O1xyXG4gICAgICAgICAgICBsZXQgaW5wdXRzID0gcmVzdWx0LnF1ZXJ5U2VsZWN0b3IoJy5jbGFpbVBhZCcpLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlucHV0IG9mIGlucHV0cykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGJpbmROYW1lID0gaW5wdXQuZ2V0QXR0cmlidXRlKFwiYmluZFwiKVxyXG4gICAgICAgICAgICAgICAgaWYgKGJpbmROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlucHV0LnR5cGUgPT0gXCJjaGVja2JveFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC5jaGVja2VkID0gY2xhaW1bYmluZE5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSBjbGFpbVtiaW5kTmFtZV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy9DaGVjayBmb3IgYW5pbWF0aW5nIG51bWJlcnNcclxuICAgIGFuaW1hdGVudW1iZXJzKCkge1xyXG4gICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAodmFyIHNjb3JlSWQgaW4gdGhpcy5zY29yZXMpIHtcclxuICAgICAgICAgICAgdmFyIHMgPSB0aGlzLnNjb3Jlc1tzY29yZUlkXTtcclxuICAgICAgICAgICAgaWYgKHMud2VpZ2h0ZWRQZXJjZW50YWdlICE9IHMuYW5pbWF0ZWRXZWlnaHRlZFBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHZhciBkaWZmZXJlbmNlID0gcy53ZWlnaHRlZFBlcmNlbnRhZ2UgLSBzLmFuaW1hdGVkV2VpZ2h0ZWRQZXJjZW50YWdlXHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZmVyZW5jZSkgPCAuMDEpXHJcbiAgICAgICAgICAgICAgICAgICAgcy5hbmltYXRlZFdlaWdodGVkUGVyY2VudGFnZSA9IHMud2VpZ2h0ZWRQZXJjZW50YWdlXHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgcy5hbmltYXRlZFdlaWdodGVkUGVyY2VudGFnZSArPSBkaWZmZXJlbmNlIC8gMTAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChmb3VuZCkgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZSgpLCAxMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdFNjb3JlKHNjb3JlOiBTY29yZSwgZTogRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICBpZiAoc2NvcmUgIT0gdGhpcy5zZWxlY3RlZFNjb3JlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRTY29yZSA9IHNjb3JlO1xyXG4gICAgICAgICAgICB0aGlzLnNldERpc3BsYXlTdGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBub0J1YmJsZUNsaWNrKGV2ZW50OiBFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIGlmIChldmVudCkgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlQ2xhaW0oY2xhaW06IENsYWltLCBldmVudDogRXZlbnQpIHtcclxuICAgICAgICBsZXQgaW5wdXRzOiBhbnkgPSBldmVudC5zcmNFbGVtZW50LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQnKTtcclxuICAgICAgICBmb3IgKGxldCBpbnB1dCBvZiBpbnB1dHMpIHtcclxuICAgICAgICAgICAgdmFyIGJpbmROYW1lID0gaW5wdXQuZ2V0QXR0cmlidXRlKFwiYmluZFwiKVxyXG4gICAgICAgICAgICBpZiAoYmluZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnB1dC50eXBlID09IFwiY2hlY2tib3hcIilcclxuICAgICAgICAgICAgICAgICAgICBjbGFpbVtiaW5kTmFtZV0gPSBpbnB1dC5jaGVja2VkO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGNsYWltW2JpbmROYW1lXSA9IGlucHV0LnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RvIGRvIFVwZGF0ZSB0aGUgc3RvcmFnZVxyXG4gICAgICAgIGlmICh0aGlzLndoaWNoQ29weSA9PSBcIm9yaWdpbmFsXCIpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNhbldyaXRlKVxyXG4gICAgICAgICAgICAgICAgZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoJ3Jvb3RzLycgKyB0aGlzLnJyLm1haW5JZCArICcvY2xhaW1zLycgKyBjbGFpbS5jbGFpbUlkKS5zZXQoY2xhaW0pO1xyXG4gICAgICAgICAgICBlbHNlIHsgXHJcbiAgICAgICAgICAgICAgICAvL0NoYW5nZSBvdmVyIHRvIGEgY29weSBhbmQgc2V0IGl0IHVwXHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vdXBkYXRlIHRoZSBVSVxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBjYWxjdWxhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zZXR0bGVJdC5jYWxjdWxhdGUodGhpcy5yci5tYWluSWQsIHRoaXMuY2xhaW1zLCB0aGlzLnNjb3JlcylcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVDbGFpbShjbGFpbTogQ2xhaW0sIHBhcmVudFNjb3JlOiBTY29yZSwgZXZlbnQ6IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jbGFpbXNbcGFyZW50U2NvcmUuY2xhaW1JZF0uY2hpbGRJZHMuaW5kZXhPZihjbGFpbS5jbGFpbUlkKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkgdGhpcy5jbGFpbXNbcGFyZW50U2NvcmUuY2xhaW1JZF0uY2hpbGRJZHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkU2NvcmUgPSBwYXJlbnRTY29yZTtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xyXG4gICAgICAgIHRoaXMuc2V0RGlzcGxheVN0YXRlKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBlZGl0Q2xhaW0oc2NvcmU6IFNjb3JlLCBldmVudD86IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5pc0VkaXRpbmcgPSAhdGhpcy5zZXR0aW5ncy5pc0VkaXRpbmc7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICBpZiAoZXZlbnQpIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZENsYWltKHBhcmVudFNjb3JlOiBTY29yZSwgaXNQcm9NYWluOiBib29sZWFuLCBldmVudD86IEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IG5ld0NsYWltOiBDbGFpbSA9IG5ldyBDbGFpbSgpO1xyXG4gICAgICAgIG5ld0NsYWltLmlzUHJvTWFpbiA9IGlzUHJvTWFpbjtcclxuICAgICAgICBsZXQgbmV3U2NvcmU6IFNjb3JlID0gbmV3IFNjb3JlKG5ld0NsYWltKVxyXG4gICAgICAgIHRoaXMuc2NvcmVzW25ld0NsYWltLmNsYWltSWRdID0gbmV3U2NvcmU7XHJcbiAgICAgICAgdGhpcy5jbGFpbXNbcGFyZW50U2NvcmUuY2xhaW1JZF0uY2hpbGRJZHMudW5zaGlmdChuZXdDbGFpbS5jbGFpbUlkKTtcclxuICAgICAgICB0aGlzLmNsYWltc1tuZXdDbGFpbS5jbGFpbUlkXSA9IG5ld0NsYWltO1xyXG4gICAgICAgIG5ld1Njb3JlLmRpc3BsYXlTdGF0ZSA9IFwibm90U2VsZWN0ZWRcIjtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFNjb3JlID0gbmV3U2NvcmU7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MuaXNFZGl0aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5zZXREaXNwbGF5U3RhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICB9LCAxMClcclxuXHJcbiAgICAgICAgaWYgKGV2ZW50KSBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBzaWduSW4oKSB7XHJcbiAgICAgICAgdGhpcy5maXJlYmFzZUluaXQoKTtcclxuICAgICAgICB2YXIgcHJvdmlkZXIgPSBuZXcgZmlyZWJhc2UuYXV0aC5Hb29nbGVBdXRoUHJvdmlkZXIoKTtcclxuICAgICAgICBmaXJlYmFzZS5hdXRoKCkuc2lnbkluV2l0aFBvcHVwKHByb3ZpZGVyKS50aGVuKChmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgIC8vIFRoaXMgZ2l2ZXMgeW91IGEgR29vZ2xlIEFjY2VzcyBUb2tlbi4gWW91IGNhbiB1c2UgaXQgdG8gYWNjZXNzIHRoZSBHb29nbGUgQVBJLlxyXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSByZXN1bHQuY3JlZGVudGlhbC5hY2Nlc3NUb2tlbjtcclxuICAgICAgICAgICAgLy8gVGhlIHNpZ25lZC1pbiB1c2VyIGluZm8uXHJcbiAgICAgICAgICAgIHZhciB1c2VyID0gcmVzdWx0LnVzZXI7XHJcbiAgICAgICAgICAgIHRoaXMudXNlck5hbWUgPSBmaXJlYmFzZS5hdXRoKCkuY3VycmVudFVzZXIgPyBmaXJlYmFzZS5hdXRoKCkuY3VycmVudFVzZXIuZW1haWwgKyAnIC0gJyArIGZpcmViYXNlLmF1dGgoKS5jdXJyZW50VXNlci51aWQgOiAnU2lnbiBJbidcclxuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0KTtcclxuICAgICAgICAgICAgLy8gLi4uXHJcbiAgICAgICAgfSkuYmluZCh0aGlzKSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgIC8vIEhhbmRsZSBFcnJvcnMgaGVyZS5cclxuICAgICAgICAgICAgdmFyIGVycm9yQ29kZSA9IGVycm9yLmNvZGU7XHJcbiAgICAgICAgICAgIHZhciBlcnJvck1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xyXG4gICAgICAgICAgICAvLyBUaGUgZW1haWwgb2YgdGhlIHVzZXIncyBhY2NvdW50IHVzZWQuXHJcbiAgICAgICAgICAgIHZhciBlbWFpbCA9IGVycm9yLmVtYWlsO1xyXG4gICAgICAgICAgICAvLyBUaGUgZmlyZWJhc2UuYXV0aC5BdXRoQ3JlZGVudGlhbCB0eXBlIHRoYXQgd2FzIHVzZWQuXHJcbiAgICAgICAgICAgIHZhciBjcmVkZW50aWFsID0gZXJyb3IuY3JlZGVudGlhbDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuXHJcblxyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcnJEaXNwbGF5LnRzIiwiY2xhc3MgU2NvcmUge1xyXG4gICAgY2xhaW1JZDogc3RyaW5nO1xyXG5cclxuICAgIC8qKiAgKi9cclxuICAgIGNvbmZpZGVuY2VQcm86IG51bWJlcjtcclxuICAgIGNvbmZpZGVuY2VDb246IG51bWJlcjtcclxuXHJcbiAgICAvKiogICovXHJcbiAgICBpbXBvcnRhbmNlUHJvOiBudW1iZXI7XHJcbiAgICBpbXBvcnRhbmNlQ29uOiBudW1iZXI7XHJcbiAgICBpbXBvcnRhbmNlVmFsdWU6IG51bWJlcjtcclxuXHJcbiAgICAvKiogICovXHJcbiAgICBzaWJsaW5nV2VpZ2h0OiBudW1iZXI7XHJcblxyXG4gICAgLyoqICAqL1xyXG4gICAgd2VpZ2h0UHJvOiBudW1iZXI7XHJcbiAgICB3ZWlnaHRDb246IG51bWJlcjtcclxuICAgIHdlaWdodERpZjogbnVtYmVyO1xyXG5cclxuICAgIC8qKiAgKi9cclxuICAgIG1heEFuY2VzdG9yV2VpZ2h0OiBudW1iZXI7XHJcblxyXG4gICAgLyoqICAqL1xyXG4gICAgbWFpblBlcmNlbnQ6IG51bWJlcjtcclxuXHJcbiAgICAvKiogKi9cclxuICAgIHdlaWdodGVkUGVyY2VudGFnZTogbnVtYmVyO1xyXG5cclxuICAgIC8qKiAqL1xyXG4gICAgZ2VuZXJhdGlvbjogbnVtYmVyO1xyXG5cclxuICAgIC8qKiAqL1xyXG4gICAgb3BlbjogYm9vbGVhbjtcclxuXHJcbiAgICAvKiogKi9cclxuICAgIG51bURlc2M6IG51bWJlcjtcclxuXHJcbiAgICAvKiogKi9cclxuICAgIGFuaW1hdGVkV2VpZ2h0ZWRQZXJjZW50YWdlXHJcblxyXG4gICAgLyoqICovXHJcbiAgICBkaXNwbGF5U3RhdGU6IERpc3BsYXlTdGF0ZTtcclxuXHJcbiAgICAvKiogKi9cclxuICAgIGNvbnN0cnVjdG9yKGNsYWltPzogQ2xhaW0pIHtcclxuICAgICAgICBpZiAoY2xhaW0pIHRoaXMuY2xhaW1JZCA9IGNsYWltLmNsYWltSWQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlzTWFpbjogYm9vbGVhbjtcclxuICAgIGlzRWRpdGluZzogYm9vbGVhbjtcclxufVxyXG5cclxudHlwZSBEaXNwbGF5U3RhdGUgPSBcIm5ld0NsYWltXCIgfCBcIm5vdFNlbGVjdGVkXCIgfCBcInBhcmVudFwiIHwgXCJhbmNlc3RvclwiIHwgXCJzZWxlY3RlZFwifCBcInNlbGVjdGVkIGVkaXRpbmdcIiB8IFwiY2hpbGRcIiB8IFwic2libGluZ1wiO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvc2NvcmUudHMiLCJyZXF1aXJlKCcuL3NyYy9yckRpc3BsYXknKTtcclxucmVxdWlyZSgnLi9zcmMvQ2xhaW0nKTtcclxucmVxdWlyZSgnLi9zcmMvUm9vdCcpO1xyXG5yZXF1aXJlKCcuL3NyYy9zY29yZScpO1xyXG5yZXF1aXJlKCcuL3NyYy9TZXR0bGVJdCcpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==