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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var firebase;
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
            firebase.database().ref('roots/' + this.rr.mainId + '/claims/' + claim.claimId).set(claim);
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


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNTNkMGNiOGY3ZmI4NDk3Y2NkNzYiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JyRGlzcGxheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUEyQyxjQUFjOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7QUNoRUEsSUFBSSxRQUFZLENBQUM7QUFTakI7SUFvQkksbUJBQVksWUFBcUI7UUFuQmpDLGFBQVEsR0FBVyxTQUFTLENBQUM7UUFPN0IsYUFBUSxHQUFRLEVBQUUsQ0FBQztRQUVuQixlQUFVLEdBQVcsS0FBSyxDQUFDO1FBRzNCLE9BQUUsR0FBUyxJQUFJLElBQUksRUFBRSxDQUFDO1FBRXRCLG9CQUFlLEdBQVksS0FBSyxDQUFDO1FBQ2pDLGlCQUFZLEdBQVUsSUFBSSxLQUFLLEVBQU8sQ0FBQztRQUtuQyxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFB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LENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxTQUFTO1lBQ3JJLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEIsTUFBTTtRQUNWLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQUs7WUFDaEMsc0JBQXNCO1lBQ3RCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDM0IsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztZQUNqQyx3Q0FBd0M7WUFDeEMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUN4Qix1REFBdUQ7WUFDdkQsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVMLGdCQUFDO0FBQUQsQ0FBQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDUzZDBjYjhmN2ZiODQ5N2NjZDc2IiwibGV0IGZpcmViYXNlOmFueTtcclxuXHJcbmRlY2xhcmUgY2xhc3MgaHlwZXJIVE1MIHtcclxuICAgIHN0YXRpYyB3aXJlKG9wdE9iajogYW55KTogYW55O1xyXG59XHJcblxyXG5cclxudHlwZSBXaGljaENvcHkgPSBcIm9yaWdpbmFsXCIgfCBcImxvY2FsXCIgfCBcInN1Z2dlc3Rpb25cIjtcclxuXHJcbmNsYXNzIFJSRGlzcGxheSB7XHJcbiAgICB1c2VyTmFtZTogc3RyaW5nID0gJ1NpZ24gSW4nO1xyXG4gICAgcnJSZWY6IGFueTsvL1RoZSBjdXJyZW50IGZpcmViYXNlIHJlZmVyZW5jZSB0byB0aGUgUmVhc29uUm9vdCBvYmplY3RcclxuICAgIHNjb3JlczogRGljdDxTY29yZT47XHJcbiAgICBjbGFpbXM6IERpY3Q8Q2xhaW0+O1xyXG4gICAgc2V0dGxlSXQ6IFNldHRsZUl0O1xyXG4gICAgbWFpblNjb3JlOiBTY29yZTtcclxuICAgIHJlbmRlcjogYW55O1xyXG4gICAgc2V0dGluZ3M6IGFueSA9IHt9O1xyXG4gICAgc2VsZWN0ZWRTY29yZTogU2NvcmU7XHJcbiAgICBzYXZlUHJlZml4OiBzdHJpbmcgPSBcInJyX1wiO1xyXG4gICAgLy9kYlJlZjogZmlyZWJhc2UuZGF0YWJhc2UuUmVmZXJlbmNlO1xyXG4gICAgZGI6IGFueTtcclxuICAgIHJyOiBSb290ID0gbmV3IFJvb3QoKTtcclxuICAgIHdoaWNoQ29weTogV2hpY2hDb3B5O1xyXG4gICAgc2V0dGluZ3NWaXNpYmxlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBsaXN0ZW5lclJlZnM6IGFueVtdID0gbmV3IEFycmF5PGFueT4oKTtcclxuICAgIGNhbldyaXRlOiBib29sZWFuO1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihjbGFpbUVsZW1lbnQ6IEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLnJlbmRlciA9IGh5cGVySFRNTC5iaW5kKGNsYWltRWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5zZXR0bGVJdCA9IG5ldyBTZXR0bGVJdCgpO1xyXG4gICAgICAgIHRoaXMucnIgPSBKU09OLnBhcnNlKGNsYWltRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3Jvb3QnKSk7XHJcbiAgICAgICAgdGhpcy5maXJlYmFzZUluaXQoKTtcclxuICAgICAgICB0aGlzLmNoYW5nZVdoaWNoQ29weShcIm9yaWdpbmFsXCIpO1xyXG4gICAgICAgIC8vdGhpcy5hdHRhY2hEQigpO1xyXG4gICAgICAgIC8vdGhpcy5pbml0UnIoKTtcclxuICAgICAgICAvL3RoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdFJyKCkge1xyXG4gICAgICAgIHRoaXMuY2xhaW1zID0gdGhpcy5yci5jbGFpbXM7XHJcbiAgICAgICAgaWYgKHRoaXMucnIuc2V0dGluZ3MpIHRoaXMuc2V0dGluZ3MgPSB0aGlzLnJyLnNldHRpbmdzO1xyXG4gICAgICAgIHRoaXMuc2NvcmVzID0gY3JlYXRlRGljdCh0aGlzLmNsYWltcyk7XHJcbiAgICAgICAgdGhpcy5tYWluU2NvcmUgPSB0aGlzLnNjb3Jlc1t0aGlzLnJyLm1haW5JZF07XHJcbiAgICAgICAgdGhpcy5tYWluU2NvcmUuaXNNYWluID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNldHRsZUl0LmNhbGN1bGF0ZSh0aGlzLnJyLm1haW5JZCwgdGhpcy5jbGFpbXMsIHRoaXMuc2NvcmVzKVxyXG4gICAgICAgIHRoaXMuc2V0RGlzcGxheVN0YXRlKCk7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBjaGFuZ2VXaGljaENvcHkod2hpY2hDb3B5PzogV2hpY2hDb3B5KSB7XHJcbiAgICAgICAgaWYgKHRoaXMud2hpY2hDb3B5ID09PSB3aGljaENvcHkpIHJldHVyblxyXG4gICAgICAgIHRoaXMud2hpY2hDb3B5ID0gd2hpY2hDb3B5XHJcblxyXG4gICAgICAgIGlmICh3aGljaENvcHkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAvL0RldGVybWluZSB3aGljaCBvbmUgdG8gcG9pbnQgdG8gXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL0NsZWFyIGFueSBleGlzdGluZyBvYnNlcnZlcnNcclxuICAgICAgICBmb3IgKGxldCByZWYgb2YgdGhpcy5saXN0ZW5lclJlZnMpIHJlZi5vZmYoKTtcclxuXHJcbiAgICAgICAgaWYgKHdoaWNoQ29weSA9PT0gXCJsb2NhbFwiKSB7XHJcbiAgICAgICAgICAgIC8vcHVsbCBsb2NhbCBkYXRhIGlmIGl0IGV4aXN0cyBhbmQgc2V0IGl0IHRvIHNhdmVcclxuXHJcbiAgICAgICAgICAgIGxldCByciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuc2F2ZVByZWZpeCArIHRoaXMucnIubWFpbklkKTtcclxuICAgICAgICAgICAgaWYgKHJyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJyID0gSlNPTi5wYXJzZShycik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlyZWJhc2VJbml0KCk7XHJcbiAgICAgICAgICAgIGlmICh3aGljaENvcHkgPT09IFwib3JpZ2luYWxcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yclJlZiA9IHRoaXMuZGIucmVmKCdyb290cy8nICsgdGhpcy5yci5tYWluSWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHdoaWNoQ29weSA9PT0gXCJzdWdnZXN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIC8vdG8gZG8gRmluZCB0aGUgSUQgb2YgbXkgc3VnZ2VzdGlvblxyXG4gICAgICAgICAgICAgICAgdGhpcy5yclJlZiA9IHRoaXMuZGIucmVmKCdyb290cy8nICsgdGhpcy5yci5tYWluSWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoREIoKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluaXRScigpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXR0YWNoREIoKSB7XHJcbiAgICAgICAgbGV0IGNsYWltc1JlZiA9IHRoaXMucnJSZWYuY2hpbGQoJ2NsYWltcycpO1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJSZWZzLnB1c2goY2xhaW1zUmVmKTtcclxuICAgICAgICBjbGFpbXNSZWYub25jZSgndmFsdWUnLCB0aGlzLmNsYWltc0Zyb21EQi5iaW5kKHRoaXMpKTtcclxuICAgICAgICBjbGFpbXNSZWYub24oJ2NoaWxkX2NoYW5nZWQnLCB0aGlzLmNsYWltRnJvbURCLmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgICAvL0NoZWNrIGZvciB3cml0ZSBwZXJtaXNzaW9uc1xyXG4gICAgICAgIGlmIChmaXJlYmFzZS5hdXRoKCkuY3VycmVudFVzZXIpIHtcclxuICAgICAgICAgICAgbGV0IHBlcm1pc3Npb25SZWYgPSB0aGlzLmRiLnJlZigncGVybWlzc2lvbnMvdXNlci8nICsgZmlyZWJhc2UuYXV0aCgpLmN1cnJlbnRVc2VyLnVpZCArIFwiL1wiICsgdGhpcy5yci5tYWluSWQpXHJcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJSZWZzLnB1c2gocGVybWlzc2lvblJlZik7XHJcblxyXG4gICAgICAgICAgICAvL1RvIGRvIHRoZSBjYW4gd3JpdGUgYmVsb3cgaXMgb24gdGhlIHdyb25nIFwidGhpc1wiXHJcbiAgICAgICAgICAgIHBlcm1pc3Npb25SZWYub24oJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXBzaG90KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbldyaXRlID0gc25hcHNob3QudmFsKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jYW5Xcml0ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmaXJlYmFzZUluaXQoKSB7XHJcbiAgICAgICAgaWYgKCFmaXJlYmFzZS5hcHBzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKHtcclxuICAgICAgICAgICAgICAgIGFwaUtleTogXCJBSXphU3lBSF9VT19mMkYzT3VWTGZadkFxZXpFdWpuTWVzbXg2aEFcIixcclxuICAgICAgICAgICAgICAgIGF1dGhEb21haW46IFwic2V0dGxlaXRvcmcuZmlyZWJhc2VhcHAuY29tXCIsXHJcbiAgICAgICAgICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3NldHRsZWl0b3JnLmZpcmViYXNlaW8uY29tXCIsXHJcbiAgICAgICAgICAgICAgICBwcm9qZWN0SWQ6IFwic2V0dGxlaXRvcmdcIixcclxuICAgICAgICAgICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwic2V0dGxlaXRvcmcuYXBwc3BvdC5jb21cIixcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2luZ1NlbmRlcklkOiBcIjgzNTU3NDA3OTg0OVwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRiID0gZmlyZWJhc2UuZGF0YWJhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGFpbXNGcm9tREIoZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gZGF0YS52YWwoKTtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5yci5jbGFpbXMgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5jbGFpbXMgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xhaW1Gcm9tREIoZGF0YTogYW55KSB7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gZGF0YS52YWwoKTtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgbGV0IGNsYWltOiBDbGFpbSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLmNsYWltc1tjbGFpbS5jbGFpbUlkXSA9IGNsYWltO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbGVhckRpc3BsYXlTdGF0ZSgpOiB2b2lkIHtcclxuICAgICAgICBmb3IgKGxldCBzY29yZUlkIGluIHRoaXMuc2NvcmVzKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNjb3Jlcy5oYXNPd25Qcm9wZXJ0eShzY29yZUlkKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY29yZXNbc2NvcmVJZF0uZGlzcGxheVN0YXRlID0gXCJub3RTZWxlY3RlZFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldERpc3BsYXlTdGF0ZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNsZWFyRGlzcGxheVN0YXRlKCk7XHJcbiAgICAgICAgdGhpcy5zZXREaXNwbGF5U3RhdGVMb29wKHRoaXMubWFpblNjb3JlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXREaXNwbGF5U3RhdGVMb29wKHNjb3JlOiBTY29yZSk6IHZvaWQge1xyXG4gICAgICAgIGlmIChzY29yZSA9PSB0aGlzLnNlbGVjdGVkU2NvcmUpXHJcbiAgICAgICAgICAgIHNjb3JlLmRpc3BsYXlTdGF0ZSA9IFwic2VsZWN0ZWRcIjtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGRJZCBvZiB0aGlzLmNsYWltc1tzY29yZS5jbGFpbUlkXS5jaGlsZElkcykge1xyXG4gICAgICAgICAgICBsZXQgY2hpbGRTY29yZSA9IHRoaXMuc2NvcmVzW2NoaWxkSWRdO1xyXG4gICAgICAgICAgICAvL3Byb2Nlc3MgdGhlIGNoaWxkcmVuIGZpcnN0L1xyXG4gICAgICAgICAgICB0aGlzLnNldERpc3BsYXlTdGF0ZUxvb3AoY2hpbGRTY29yZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoY2hpbGRTY29yZSA9PSB0aGlzLnNlbGVjdGVkU2NvcmUpIHtcclxuICAgICAgICAgICAgICAgIHNjb3JlLmRpc3BsYXlTdGF0ZSA9IFwicGFyZW50XCI7XHJcbiAgICAgICAgICAgICAgICAvL1NldCBTaWJsaW5nc1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc2libGluZ0lkIG9mIHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdLmNoaWxkSWRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNpYmxpbmdTY29yZSA9IHRoaXMuc2NvcmVzW3NpYmxpbmdJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpYmxpbmdTY29yZS5kaXNwbGF5U3RhdGUgIT0gXCJzZWxlY3RlZFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWJsaW5nU2NvcmUuZGlzcGxheVN0YXRlID0gXCJzaWJsaW5nXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjaGlsZFNjb3JlLmRpc3BsYXlTdGF0ZSA9PSBcImFuY2VzdG9yXCIgfHwgY2hpbGRTY29yZS5kaXNwbGF5U3RhdGUgPT0gXCJwYXJlbnRcIilcclxuICAgICAgICAgICAgICAgIHNjb3JlLmRpc3BsYXlTdGF0ZSA9IFwiYW5jZXN0b3JcIjtcclxuXHJcbiAgICAgICAgICAgIGlmIChzY29yZSA9PSB0aGlzLnNlbGVjdGVkU2NvcmUpXHJcbiAgICAgICAgICAgICAgICBjaGlsZFNjb3JlLmRpc3BsYXlTdGF0ZSA9IFwiY2hpbGRcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIGlmICghdGhpcy5zZXR0aW5ncy5ub0F1dG9TYXZlKVxyXG4gICAgICAgIC8vICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnNhdmVQcmVmaXggKyB0aGlzLnJvb3QubWFpbklkLCBKU09OLnN0cmluZ2lmeSh0aGlzLnNjb3JlcykpO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlcmBcclxuICAgICAgICA8ZGl2IGNsYXNzPVwiJHsncnInICtcclxuICAgICAgICAgICAgKHRoaXMuc2V0dGluZ3MuaGlkZVNjb3JlID8gJyBoaWRlU2NvcmUnIDogJycpICtcclxuICAgICAgICAgICAgKHRoaXMuc2V0dGluZ3MuaGlkZVBvaW50cyA/ICcgaGlkZVBvaW50cycgOiAnJykgK1xyXG4gICAgICAgICAgICAodGhpcy5zZXR0aW5ncy5oaWRlQ2xhaW1NZW51ID8gJyBoaWRlQ2xhaW1NZW51JyA6ICcnKSArXHJcbiAgICAgICAgICAgICh0aGlzLnNldHRpbmdzLmhpZGVDaGlsZEluZGljYXRvciA/ICcgaGlkZUNoaWxkSW5kaWNhdG9yJyA6ICcnKSArXHJcbiAgICAgICAgICAgICh0aGlzLnNldHRpbmdzLnNob3dTaWJsaW5ncyA/ICcgc2hvd1NpYmxpbmdzJyA6ICcnKSArXHJcbiAgICAgICAgICAgICh0aGlzLnNldHRpbmdzLnNob3dDb21wZXRpdGlvbiA/ICcgc2hvd0NvbXBldGl0aW9uJyA6ICcnKVxyXG5cclxuICAgICAgICAgICAgfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzID0gXCIkeydzZXR0aW5nc0hpZGVyICcgKyAodGhpcy5zZXR0aW5nc1Zpc2libGUgPyAnb3BlbicgOiAnJyl9XCI+IFxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGlkPVwiaGlkZVNjb3JlXCIgYmluZD1cImhpZGVTY29yZVwiIHZhbHVlPVwiaGlkZVNjb3JlXCIgb25jbGljaz1cIiR7dGhpcy51cGRhdGVTZXR0aW5ncy5iaW5kKHRoaXMsIHRoaXMuc2V0dGluZ3MpfVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImhpZGVTY29yZVwiPkhpZGUgU2NvcmU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGlkPVwiaGlkZVBvaW50c1wiIGJpbmQ9XCJoaWRlUG9pbnRzXCIgdmFsdWU9XCJoaWRlUG9pbnRzXCIgb25jbGljaz1cIiR7dGhpcy51cGRhdGVTZXR0aW5ncy5iaW5kKHRoaXMsIHRoaXMuc2V0dGluZ3MpfVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImhpZGVQb2ludHNcIj5IaWRlIFBvaW50czwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgaWQ9XCJub0F1dG9TYXZlXCIgYmluZD1cIm5vQXV0b1NhdmVcIiB2YWx1ZT1cIm5vQXV0b1NhdmVcIiBvbmNsaWNrPVwiJHt0aGlzLnVwZGF0ZVNldHRpbmdzLmJpbmQodGhpcywgdGhpcy5zZXR0aW5ncyl9XCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwibm9BdXRvU2F2ZVwiPk5vIEF1dG8gU2F2ZTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgaWQ9XCJzaG93U2libGluZ3NcIiBiaW5kPVwic2hvd1NpYmxpbmdzXCIgdmFsdWU9XCJzaG93U2libGluZ3NcIiBvbmNsaWNrPVwiJHt0aGlzLnVwZGF0ZVNldHRpbmdzLmJpbmQodGhpcywgdGhpcy5zZXR0aW5ncyl9XCI+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwic2hvd1NpYmxpbmdzXCI+U2hvdyBTaWJsbGluZ3M8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGlkPVwiaGlkZUNsYWltTWVudVwiIGJpbmQ9XCJoaWRlQ2xhaW1NZW51XCIgdmFsdWU9XCJoaWRlQ2xhaW1NZW51XCIgb25jbGljaz1cIiR7dGhpcy51cGRhdGVTZXR0aW5ncy5iaW5kKHRoaXMsIHRoaXMuc2V0dGluZ3MpfVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImhpZGVDbGFpbU1lbnVcIj5IaWRlIENsYWltIE1lbnU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGlkPVwiaGlkZUNoaWxkSW5kaWNhdG9yXCIgYmluZD1cImhpZGVDaGlsZEluZGljYXRvclwiIHZhbHVlPVwiaGlkZUNoaWxkSW5kaWNhdG9yXCIgb25jbGljaz1cIiR7dGhpcy51cGRhdGVTZXR0aW5ncy5iaW5kKHRoaXMsIHRoaXMuc2V0dGluZ3MpfVwiPlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImhpZGVDaGlsZEluZGljYXRvclwiPkhpZGUgQ2hpbGQgSW5kaWNhdG9yPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBpZD1cInNob3dDb21wZXRpdGlvblwiIGJpbmQ9XCJzaG93Q29tcGV0aXRpb25cIiB2YWx1ZT1cInNob3dDb21wZXRpdGlvblwiIG9uY2xpY2s9XCIke3RoaXMudXBkYXRlU2V0dGluZ3MuYmluZCh0aGlzLCB0aGlzLnNldHRpbmdzKX1cIj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJzaG93Q29tcGV0aXRpb25cIj5TaG93IENvbXBldGl0aW9uPC9sYWJlbD5cclxuXHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdmFsdWU9XCIke3RoaXMucmVwbGFjZUFsbChKU09OLnN0cmluZ2lmeSh0aGlzLnJyKSwgJ1xcJycsICcmIzM5OycpfVwiPjwvaW5wdXQ+XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIDxkaXYgIG9uY2xpY2s9XCIke3RoaXMuc2lnbkluLmJpbmQodGhpcyl9XCI+IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbJHt0aGlzLnVzZXJOYW1lfSBdXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdj4ke3RoaXMucmVuZGVyTm9kZSh0aGlzLnNjb3Jlc1t0aGlzLnJyLm1haW5JZF0pfTwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZ3NCdXR0b25cIiBvbmNsaWNrPVwiJHt0aGlzLnRvZ2dsZVNldHRpbmdzLmJpbmQodGhpcyl9XCI+IFxyXG4gICAgICAgICAgICAgICAg4pqZXHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PmA7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlU2V0dGluZ3Moc2V0dGluZ3M6IGFueSwgZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgICAgIHNldHRpbmdzW2V2ZW50LnNyY0VsZW1lbnQuZ2V0QXR0cmlidXRlKFwiYmluZFwiKV0gPSBldmVudC5zcmNFbGVtZW50LmNoZWNrZWQ7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICBpZiAoZXZlbnQpIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZVNldHRpbmdzKGV2ZW50OiBFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NWaXNpYmxlID0gIXRoaXMuc2V0dGluZ3NWaXNpYmxlO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVwbGFjZUFsbCh0YXJnZXQ6IHN0cmluZywgc2VhcmNoOiBzdHJpbmcsIHJlcGxhY2VtZW50OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0YXJnZXQuc3BsaXQoc2VhcmNoKS5qb2luKHJlcGxhY2VtZW50KTtcclxuICAgIH07XHJcblxyXG4gICAgcmVuZGVyTm9kZShzY29yZTogU2NvcmUsIHBhcmVudD86IFNjb3JlKTogdm9pZCB7XHJcbiAgICAgICAgdmFyIGNsYWltOiBDbGFpbSA9IHRoaXMuY2xhaW1zW3Njb3JlLmNsYWltSWRdO1xyXG4gICAgICAgIHZhciB3aXJlID0gaHlwZXJIVE1MLndpcmUoc2NvcmUpO1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGVudW1iZXJzKClcclxuXHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHdpcmVgXHJcbiAgICAgICAgICAgICAgICA8bGkgaWQ9XCIke2NsYWltLmNsYWltSWR9XCIgY2xhc3M9XCIke1xyXG4gICAgICAgICAgICBzY29yZS5kaXNwbGF5U3RhdGUgK1xyXG4gICAgICAgICAgICAoc2NvcmUuaXNNYWluID8gJyBtYWluQ2xhaW0nIDogJycpICtcclxuICAgICAgICAgICAgKHRoaXMuc2V0dGluZ3MuaXNFZGl0aW5nICYmIHRoaXMuc2VsZWN0ZWRTY29yZSA9PSBzY29yZSA/ICcgZWRpdGluZycgOiAnJyl9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNsYWltUGFkXCIgb25jbGljaz1cIiR7dGhpcy5zZWxlY3RTY29yZS5iaW5kKHRoaXMsIHNjb3JlKX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7XCJjbGFpbSBcIiArIChjbGFpbS5pc1Byb01haW4gPyAncHJvJyA6ICdjb24nKSArIChjbGFpbS5kaXNhYmxlZCA/ICcgZGlzYWJsZWQgJyA6ICcnKSArIChjbGFpbS5jaGlsZElkcy5sZW5ndGggPiAwICYmICFzY29yZS5vcGVuID8gJyBzaGFkb3cnIDogJycpfVwiID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbm5lckNsYWltXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCIke3Njb3JlLmdlbmVyYXRpb24gPT0gMCA/ICdzY29yZScgOiAncG9pbnRzJ31cIiA+JHtcclxuICAgICAgICAgICAgKHNjb3JlLmdlbmVyYXRpb24gPT0gMCA/XHJcbiAgICAgICAgICAgICAgICBNYXRoLnJvdW5kKHNjb3JlLmFuaW1hdGVkV2VpZ2h0ZWRQZXJjZW50YWdlICogMTAwKSArICclJyA6XHJcbiAgICAgICAgICAgICAgICAoc2NvcmUud2VpZ2h0RGlmICE9IHVuZGVmaW5lZCA/IE1hdGguZmxvb3IoTWF0aC5hYnMoc2NvcmUud2VpZ2h0RGlmKSkgOiAnJykpXHJcbiAgICAgICAgICAgIH08L3NwYW4+XHJcblxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInByb1BvaW50c1wiID4ke01hdGgucm91bmQoc2NvcmUud2VpZ2h0UHJvKX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY29uUG9pbnRzXCIgPiR7TWF0aC5yb3VuZChzY29yZS53ZWlnaHRDb24pfTwvc3Bhbj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtjbGFpbS5jb250ZW50fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7Y2xhaW0ubWF4Q29uZiAmJiBjbGFpbS5tYXhDb25mIDwgMTAwID8gXCIgKG1heGltdW0gY29uZmlkZW5jZSBzZXQgdG8gXCIgKyBjbGFpbS5tYXhDb25mICsgXCIlKSBcIiA6IFwiXCJ9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiR7Y2xhaW0uY2l0YXRpb25Vcmx9XCIgb25jbGljaz1cIiR7dGhpcy5ub0J1YmJsZUNsaWNrfVwiPiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjaXRhdGlvblwiPiR7Y2xhaW0uY2l0YXRpb259PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIiR7XCJjaGlsZEluZGljYXRvclNwYWNlXCIgKyAoY2xhaW0uY2hpbGRJZHMubGVuZ3RoID09IDAgPyAnJyA6ICcgaGFzQ2hpbGRyZW4nKX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCIke1wiY2hpbGRJbmRpY2F0b3IgXCIgKyAoY2xhaW0uaXNQcm9NYWluID8gJ3BybycgOiAnY29uJyl9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2hpbGRJbmRpY2F0b3JJbm5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtzY29yZS5udW1EZXNjfSBtb3JlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjbGFpbUVkaXRIaWRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNsYWltRWRpdFNlY3Rpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgYmluZD1cImNvbnRlbnRcIiAgb25pbnB1dD1cIiR7dGhpcy51cGRhdGVDbGFpbS5iaW5kKHRoaXMsIGNsYWltKX1cIiA+PGJyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBiaW5kPVwiY2l0YXRpb25cIiBvbmlucHV0PVwiJHt0aGlzLnVwZGF0ZUNsYWltLmJpbmQodGhpcywgY2xhaW0pfVwiID48YnI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGJpbmQ9XCJjaXRhdGlvblVybFwiIG9uaW5wdXQ9XCIke3RoaXMudXBkYXRlQ2xhaW0uYmluZCh0aGlzLCBjbGFpbSl9XCIgPjxicj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwibWF4Q29uZlwiID5NYXhpbXVtIENvbmZpZGVuY2UgPC9sYWJlbD48YnIvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBiaW5kPVwibWF4Q29uZlwiIG5hbWU9XCJtYXhDb25mXCIgdHlwZT1cIm51bWJlclwiIG9uaW5wdXQ9XCIke3RoaXMudXBkYXRlQ2xhaW0uYmluZCh0aGlzLCBjbGFpbSl9XCIgPjxicj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgYmluZD1cImlzUHJvTWFpblwiIG9uY2xpY2s9XCIke3RoaXMudXBkYXRlQ2xhaW0uYmluZCh0aGlzLCBjbGFpbSl9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImlzUHJvTWFpblwiPkRvZXMgdGhpcyBjbGFpbSBzdXBwb3J0cyB0aGUgbWFpbiBjbGFpbT88L2xhYmVsPjxici8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGJpbmQ9XCJkaXNhYmxlZFwiIG9uY2xpY2s9XCIke3RoaXMudXBkYXRlQ2xhaW0uYmluZCh0aGlzLCBjbGFpbSl9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImRpc2FibGVkXCI+RGlzYWJsZWQ/PC9sYWJlbD48YnIvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25jbGljaz1cIiR7dGhpcy5yZW1vdmVDbGFpbS5iaW5kKHRoaXMsIGNsYWltLCBwYXJlbnQpfVwiIG5hbWU9XCJidXR0b25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVtb3ZlIHRoaXMgY2xhaW0gZnJvbSBpdCdzIHBhcmVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPjxici8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSUQ6JHtjbGFpbS5jbGFpbUlkfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNsYWltTWVudUhpZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2xhaW1NZW51U2VjdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZGRDbGFpbSBwcm9cIiBvbmNsaWNrPVwiJHt0aGlzLmFkZENsYWltLmJpbmQodGhpcywgc2NvcmUsIHRydWUpfVwiPmFkZDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZGRDbGFpbSBjb25cIiBvbmNsaWNrPVwiJHt0aGlzLmFkZENsYWltLmJpbmQodGhpcywgc2NvcmUsIGZhbHNlKX1cIj5hZGQ8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZWRpdENsYWltQnV0dG9uXCIgb25jbGljaz1cIiR7dGhpcy5lZGl0Q2xhaW0uYmluZCh0aGlzLCBzY29yZSl9XCI+ZWRpdDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gIFxyXG4gICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgPHVsPiR7XHJcbiAgICAgICAgICAgIGNsYWltLmNoaWxkSWRzLm1hcCgoY2hpbGRJZCwgaSkgPT4gdGhpcy5yZW5kZXJOb2RlKHRoaXMuc2NvcmVzW2NoaWxkSWRdLCBzY29yZSkpXHJcbiAgICAgICAgICAgIH08L3VsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPmBcclxuXHJcbiAgICAgICAgaWYgKCF3aXJlLmRlZmF1bHQpIHtcclxuICAgICAgICAgICAgd2lyZS5kZWZhdWx0ID0gY2xhaW0uY29udGVudDtcclxuICAgICAgICAgICAgbGV0IGlucHV0cyA9IHJlc3VsdC5xdWVyeVNlbGVjdG9yKCcuY2xhaW1QYWQnKS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dCcpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpbnB1dCBvZiBpbnB1dHMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBiaW5kTmFtZSA9IGlucHV0LmdldEF0dHJpYnV0ZShcImJpbmRcIilcclxuICAgICAgICAgICAgICAgIGlmIChiaW5kTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dC50eXBlID09IFwiY2hlY2tib3hcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQuY2hlY2tlZCA9IGNsYWltW2JpbmROYW1lXTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gY2xhaW1bYmluZE5hbWVdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vQ2hlY2sgZm9yIGFuaW1hdGluZyBudW1iZXJzXHJcbiAgICBhbmltYXRlbnVtYmVycygpIHtcclxuICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKHZhciBzY29yZUlkIGluIHRoaXMuc2NvcmVzKSB7XHJcbiAgICAgICAgICAgIHZhciBzID0gdGhpcy5zY29yZXNbc2NvcmVJZF07XHJcbiAgICAgICAgICAgIGlmIChzLndlaWdodGVkUGVyY2VudGFnZSAhPSBzLmFuaW1hdGVkV2VpZ2h0ZWRQZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGlmZmVyZW5jZSA9IHMud2VpZ2h0ZWRQZXJjZW50YWdlIC0gcy5hbmltYXRlZFdlaWdodGVkUGVyY2VudGFnZVxyXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKGRpZmZlcmVuY2UpIDwgLjAxKVxyXG4gICAgICAgICAgICAgICAgICAgIHMuYW5pbWF0ZWRXZWlnaHRlZFBlcmNlbnRhZ2UgPSBzLndlaWdodGVkUGVyY2VudGFnZVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHMuYW5pbWF0ZWRXZWlnaHRlZFBlcmNlbnRhZ2UgKz0gZGlmZmVyZW5jZSAvIDEwMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZm91bmQpIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGUoKSwgMTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RTY29yZShzY29yZTogU2NvcmUsIGU6IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHNjb3JlICE9IHRoaXMuc2VsZWN0ZWRTY29yZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkU2NvcmUgPSBzY29yZTtcclxuICAgICAgICAgICAgdGhpcy5zZXREaXNwbGF5U3RhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbm9CdWJibGVDbGljayhldmVudDogRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICBpZiAoZXZlbnQpIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUNsYWltKGNsYWltOiBDbGFpbSwgZXZlbnQ6IEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGlucHV0czphbnkgPSBldmVudC5zcmNFbGVtZW50LnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQnKTtcclxuICAgICAgICBmb3IgKGxldCBpbnB1dCBvZiBpbnB1dHMpIHtcclxuICAgICAgICAgICAgdmFyIGJpbmROYW1lID0gaW5wdXQuZ2V0QXR0cmlidXRlKFwiYmluZFwiKVxyXG4gICAgICAgICAgICBpZiAoYmluZE5hbWUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChpbnB1dC50eXBlID09IFwiY2hlY2tib3hcIilcclxuICAgICAgICAgICAgICAgICAgICBjbGFpbVtiaW5kTmFtZV0gPSBpbnB1dC5jaGVja2VkO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGNsYWltW2JpbmROYW1lXSA9IGlucHV0LnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3RvIGRvIFVwZGF0ZSB0aGUgc3RvcmFnZVxyXG4gICAgICAgIGlmICh0aGlzLndoaWNoQ29weSA9PSBcIm9yaWdpbmFsXCIpXHJcbiAgICAgICAgICAgIGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCdyb290cy8nICsgdGhpcy5yci5tYWluSWQgKyAnL2NsYWltcy8nICsgY2xhaW0uY2xhaW1JZCkuc2V0KGNsYWltKTtcclxuXHJcblxyXG4gICAgICAgIC8vdXBkYXRlIHRoZSBVSVxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBjYWxjdWxhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5zZXR0bGVJdC5jYWxjdWxhdGUodGhpcy5yci5tYWluSWQsIHRoaXMuY2xhaW1zLCB0aGlzLnNjb3JlcylcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVDbGFpbShjbGFpbTogQ2xhaW0sIHBhcmVudFNjb3JlOiBTY29yZSwgZXZlbnQ6IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5jbGFpbXNbcGFyZW50U2NvcmUuY2xhaW1JZF0uY2hpbGRJZHMuaW5kZXhPZihjbGFpbS5jbGFpbUlkKTtcclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkgdGhpcy5jbGFpbXNbcGFyZW50U2NvcmUuY2xhaW1JZF0uY2hpbGRJZHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkU2NvcmUgPSBwYXJlbnRTY29yZTtcclxuICAgICAgICB0aGlzLnNldERpc3BsYXlTdGF0ZSgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZWRpdENsYWltKHNjb3JlOiBTY29yZSwgZXZlbnQ/OiBFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MuaXNFZGl0aW5nID0gIXRoaXMuc2V0dGluZ3MuaXNFZGl0aW5nO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgaWYgKGV2ZW50KSBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRDbGFpbShwYXJlbnRTY29yZTogU2NvcmUsIGlzUHJvTWFpbjogYm9vbGVhbiwgZXZlbnQ/OiBFdmVudCkge1xyXG4gICAgICAgIGxldCBuZXdDbGFpbTogQ2xhaW0gPSBuZXcgQ2xhaW0oKTtcclxuICAgICAgICBuZXdDbGFpbS5pc1Byb01haW4gPSBpc1Byb01haW47XHJcbiAgICAgICAgbGV0IG5ld1Njb3JlOiBTY29yZSA9IG5ldyBTY29yZShuZXdDbGFpbSlcclxuICAgICAgICB0aGlzLnNjb3Jlc1tuZXdDbGFpbS5jbGFpbUlkXSA9IG5ld1Njb3JlO1xyXG4gICAgICAgIHRoaXMuY2xhaW1zW3BhcmVudFNjb3JlLmNsYWltSWRdLmNoaWxkSWRzLnVuc2hpZnQobmV3Q2xhaW0uY2xhaW1JZCk7XHJcbiAgICAgICAgdGhpcy5jbGFpbXNbbmV3Q2xhaW0uY2xhaW1JZF0gPSBuZXdDbGFpbTtcclxuICAgICAgICBuZXdTY29yZS5kaXNwbGF5U3RhdGUgPSBcIm5vdFNlbGVjdGVkXCI7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRTY29yZSA9IG5ld1Njb3JlO1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLmlzRWRpdGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RGlzcGxheVN0YXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgfSwgMTApXHJcblxyXG4gICAgICAgIGlmIChldmVudCkgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2lnbkluKCkge1xyXG4gICAgICAgIHRoaXMuZmlyZWJhc2VJbml0KCk7XHJcbiAgICAgICAgdmFyIHByb3ZpZGVyID0gbmV3IGZpcmViYXNlLmF1dGguR29vZ2xlQXV0aFByb3ZpZGVyKCk7XHJcbiAgICAgICAgZmlyZWJhc2UuYXV0aCgpLnNpZ25JbldpdGhQb3B1cChwcm92aWRlcikudGhlbigoZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAvLyBUaGlzIGdpdmVzIHlvdSBhIEdvb2dsZSBBY2Nlc3MgVG9rZW4uIFlvdSBjYW4gdXNlIGl0IHRvIGFjY2VzcyB0aGUgR29vZ2xlIEFQSS5cclxuICAgICAgICAgICAgdmFyIHRva2VuID0gcmVzdWx0LmNyZWRlbnRpYWwuYWNjZXNzVG9rZW47XHJcbiAgICAgICAgICAgIC8vIFRoZSBzaWduZWQtaW4gdXNlciBpbmZvLlxyXG4gICAgICAgICAgICB2YXIgdXNlciA9IHJlc3VsdC51c2VyO1xyXG4gICAgICAgICAgICB0aGlzLnVzZXJOYW1lID0gZmlyZWJhc2UuYXV0aCgpLmN1cnJlbnRVc2VyID8gZmlyZWJhc2UuYXV0aCgpLmN1cnJlbnRVc2VyLmVtYWlsICsgJyAtICcgKyBmaXJlYmFzZS5hdXRoKCkuY3VycmVudFVzZXIudWlkIDogJ1NpZ24gSW4nXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XHJcbiAgICAgICAgICAgIC8vIC4uLlxyXG4gICAgICAgIH0pLmJpbmQodGhpcykpLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAvLyBIYW5kbGUgRXJyb3JzIGhlcmUuXHJcbiAgICAgICAgICAgIHZhciBlcnJvckNvZGUgPSBlcnJvci5jb2RlO1xyXG4gICAgICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcclxuICAgICAgICAgICAgLy8gVGhlIGVtYWlsIG9mIHRoZSB1c2VyJ3MgYWNjb3VudCB1c2VkLlxyXG4gICAgICAgICAgICB2YXIgZW1haWwgPSBlcnJvci5lbWFpbDtcclxuICAgICAgICAgICAgLy8gVGhlIGZpcmViYXNlLmF1dGguQXV0aENyZWRlbnRpYWwgdHlwZSB0aGF0IHdhcyB1c2VkLlxyXG4gICAgICAgICAgICB2YXIgY3JlZGVudGlhbCA9IGVycm9yLmNyZWRlbnRpYWw7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcblxyXG5cclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JyRGlzcGxheS50cyJdLCJzb3VyY2VSb290IjoiIn0=