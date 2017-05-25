this.onload = function () {
    var settings = {};
    function update(render, dict, mainId, events, claims) {
        save(dict[mainId], dict);
        //Check for animating numbers
        function animatenumbers() {
            var found = false;
            for (var scoreId in dict) {
                var s = dict[scoreId];
                if (s.weightedPercentage != s.animatedWeightedPercentage) {
                    found = true;
                    var difference = s.weightedPercentage - s.animatedWeightedPercentage;
                    if (Math.abs(difference) < .01)
                        s.animatedWeightedPercentage = s.weightedPercentage;
                    else
                        s.animatedWeightedPercentage += difference / 10;
                }
            }
            if (found)
                setTimeout(function () { update(render, dict, mainId, events, claims); }, 100);
        }
        animatenumbers();
        function renderNode(score, parent) {
            var claim = score.claim;
            var wire = hyperHTML.wire(score);
            var result = (_a = ["\n                <li id=\"", "\" class=\"", "\">\n                    <div class=\"claimPad\" onclick=\"", "\">\n                        <div class=\"", "\" >\n                            <div class=\"innerClaim\">\n                                <span class=\"score\" > ", "</span>\n\n                                ", "\n                                ", "\n                                <a target=\"_blank\" href=\"", "\" onclick=\"", "\"> \n                                    <span class=\"citation\">", "</span>\n                                </a>\n\n                             </div>\n                        </div>\n                        \n                        <div class=\"", "\">\n                            <div class=\"", "\">\n                            <div class=\"childIndicatorInner\">\n                            ", " more\n                            </div>\n                            </div>\n                        </div>\n\n                        <div class=\"claimEditHider\">\n                            <div class=\"claimEditSection\">\n                                <input bind=\"content\"  oninput=\"", "\" ><br>\n                                <input bind=\"citation\" oninput=\"", "\" ><br>\n                                <input bind=\"citationUrl\" oninput=\"", "\" ><br>\n                                <label for=\"maxConf\" >Maximum Confidence </label><br/>\n                                <input bind=\"maxConf\" name=\"maxConf\" type=\"number\" oninput=\"", "\" ><br>\n                                <input type=\"checkbox\" bind=\"isProMain\" onclick=\"", "\">\n                                <label for=\"isProMain\">Does this claim supports the main claim?</label><br/>\n                                <input type=\"checkbox\" bind=\"disabled\" onclick=\"", "\">\n                                <label for=\"disabled\">Disabled?</label><br/>\n                                <button onclick=\"", "\" name=\"button\">\n                                    Remove this claim from it's parent\n                                </button><br/>\n                                <button onclick=\"", "\" name=\"addChildBtn\">\n                                    Add an existing claim\n                                </button>\n                                <input name=\"addChild\" style=\"width: initial;\"><br>\n                                ID:", "\n                            </div>\n                        </div>\n\n                        <div class=\"claimMenuHider\">\n                            <div class=\"claimMenuSection\">\n                                <div class=\"addClaim pro\" onclick=\"", "\">add</div>\n                                <div class=\"addClaim con\" onclick=\"", "\">add</div>\n                                <div class=\"editClaimButton\" onclick=\"", "\">edit</div>\n                            </div>\n                        </div>\n\n                    </div>  \n                      \n                    <ul>", "</ul>\n                </li>"], _a.raw = ["\n                <li id=\"", "\" class=\"", "\">\n                    <div class=\"claimPad\" onclick=\"", "\">\n                        <div class=\"", "\" >\n                            <div class=\"innerClaim\">\n                                <span class=\"score\" > ",
                "</span>\n\n                                ", "\n                                ", "\n                                <a target=\"_blank\" href=\"", "\" onclick=\"", "\"> \n                                    <span class=\"citation\">", "</span>\n                                </a>\n\n                             </div>\n                        </div>\n                        \n                        <div class=\"", "\">\n                            <div class=\"", "\">\n                            <div class=\"childIndicatorInner\">\n                            ", " more\n                            </div>\n                            </div>\n                        </div>\n\n                        <div class=\"claimEditHider\">\n                            <div class=\"claimEditSection\">\n                                <input bind=\"content\"  oninput=\"", "\" ><br>\n                                <input bind=\"citation\" oninput=\"", "\" ><br>\n                                <input bind=\"citationUrl\" oninput=\"", "\" ><br>\n                                <label for=\"maxConf\" >Maximum Confidence </label><br/>\n                                <input bind=\"maxConf\" name=\"maxConf\" type=\"number\" oninput=\"", "\" ><br>\n                                <input type=\"checkbox\" bind=\"isProMain\" onclick=\"", "\">\n                                <label for=\"isProMain\">Does this claim supports the main claim?</label><br/>\n                                <input type=\"checkbox\" bind=\"disabled\" onclick=\"", "\">\n                                <label for=\"disabled\">Disabled?</label><br/>\n                                <button onclick=\"", "\" name=\"button\">\n                                    Remove this claim from it's parent\n                                </button><br/>\n                                <button onclick=\"", "\" name=\"addChildBtn\">\n                                    Add an existing claim\n                                </button>\n                                <input name=\"addChild\" style=\"width: initial;\"><br>\n                                ID:", "\n                            </div>\n                        </div>\n\n                        <div class=\"claimMenuHider\">\n                            <div class=\"claimMenuSection\">\n                                <div class=\"addClaim pro\" onclick=\"", "\">add</div>\n                                <div class=\"addClaim con\" onclick=\"", "\">add</div>\n                                <div class=\"editClaimButton\" onclick=\"", "\">edit</div>\n                            </div>\n                        </div>\n\n                    </div>  \n                      \n                    <ul>",
                "</ul>\n                </li>"], wire(_a, claim.id, score.class, events.selected.bind(score), "claim " + (claim.isProMain ? 'pro' : 'con') + (claim.disabled ? ' disabled ' : '') + (claim.childIds.length > 0 & !score.open ? ' shadow' : ''), (score.generation == 0 ?
                Math.round(score.animatedWeightedPercentage * 100) + '%' :
                Math.floor(Math.abs(score.weightDif))), claim.content, claim.maxConf ? " (maximum confidence set to " + claim.maxConf + "%) " : "", claim.citationUrl, events.noBubbleClick, claim.citation, "childIndicatorSpace" + (claim.childIds.length == 0 ? '' : ' hasChildren'), "childIndicator " + (claim.isProMain ? 'pro' : 'con'), score.numDesc, events.updated.bind(claim), events.updated.bind(claim), events.updated.bind(claim), events.updated.bind(claim), events.updated.bind(claim), events.updated.bind(claim), events.remove.bind(claim, parent), events.addExisting.bind(claim), claim.id, events.add.bind(score, true), events.add.bind(score, false), events.edit.bind(score), claim.childIds.map(function (childId, i) { return renderNode(dict[childId], score); })));
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
        }
        function toggleSettings(event) {
            settings.visible = !settings.visible;
            update(render, dict, mainId, events, claims);
        }
        replaceAll = function (target, search, replacement) {
            return target.split(search).join(replacement);
        };
        (_a = ["\n        <div class=\"", "\">\n            <div class = \"", "\"> \n                <input type=\"checkbox\" id=\"hideScore\" bind=\"hideScore\" value=\"hideScore\" onclick=\"", "\">\n                <label for=\"hideScore\">Hide Score</label>\n                <input value=\"", "\"></input>\n           </div>\n            <div>", "</div>\n            <div class=\"settingsButton\" onclick=\"", "\"> \n                \u2699\n            </div>\n        </div>"], _a.raw = ["\n        <div class=\"",
            "\">\n            <div class = \"", "\"> \n                <input type=\"checkbox\" id=\"hideScore\" bind=\"hideScore\" value=\"hideScore\" onclick=\"", "\">\n                <label for=\"hideScore\">Hide Score</label>\n                <input value=\"", "\"></input>\n           </div>\n            <div>", "</div>\n            <div class=\"settingsButton\" onclick=\"", "\"> \n                \u2699\n            </div>\n        </div>"], render(_a, 'rr ' +
            (settings.hideScore ? 'hideScore ' : ''), 'settingsHider ' + (settings.visible ? 'open' : ''), events.updateSettings.bind(this, settings), replaceAll(JSON.stringify(claims), '\'', '&#39;'), renderNode(dict[mainId], { open: true }), toggleSettings));
        var _a;
    }
    //Render the claims
    function start(s) {
        var mainId = s.getAttribute('stmtId');
        var settleIt = new SettleIt();
        clearClasses = function (dict) {
            for (var scoreId in dict) {
                dict[scoreId].class = "hide";
            }
        };
        setClassesLoop = function (score, dict, parent) {
            for (var _i = 0, _a = score.claim.childIds; _i < _a.length; _i++) {
                var childId = _a[_i];
                var childScore = dict[childId];
                //process the children first
                setClassesLoop(childScore, dict, score);
                if (childScore.class.indexOf("selected") !== -1)
                    score.class = "parent";
                if (childScore.class == "ancestor" || childScore.class == "parent")
                    score.class = "ancestor";
                if (score.class.indexOf("selected") !== -1)
                    childScore.class = "child";
            }
        };
        setClasses = function (mainScore, dict, parent) {
            setClassesLoop(mainScore, dict, parent);
            if (mainScore.class.indexOf("selected") == -1)
                mainScore.class = "mainClaim";
        };
        newId = function () {
            //take the current date and convert to bas 62
            var decimal = new Date();
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
        };
        var claims = JSON.parse(s.getAttribute('dict'));
        //add the claims to the dictionairy
        var dict = createDict(claims);
        //restore saved dictionairy
        var potentialDict = localStorage.getItem("rr_" + mainId);
        if (potentialDict) {
            dict = JSON.parse(potentialDict);
            var mainScore = dict[mainId];
            //create claims from saves dict
            claims = [];
            for (var scoreId in dict) {
                claims.push(dict[scoreId].claim);
            }
            settleIt.calculate(dict[mainId], dict);
        }
        else {
            var mainScore = dict[mainId];
            settleIt.calculate(mainScore, dict);
            clearClasses(dict);
            setClasses(mainScore, dict);
        }
        save = function (mainScore, dict) {
            localStorage.setItem("rr_" + mainScore.claim.id, JSON.stringify(dict));
        };
        var events = {
            updated: function (e) {
                //this.content = e.target.value;
                var inputs = e.srcElement.parentElement.querySelectorAll('input');
                for (var _i = 0, inputs_2 = inputs; _i < inputs_2.length; _i++) {
                    var input = inputs_2[_i];
                    var bindName = input.getAttribute("bind");
                    if (bindName) {
                        if (input.type == "checkbox")
                            this[bindName] = input.checked;
                        else
                            this[bindName] = input.value;
                    }
                }
                settleIt.calculate(dict[mainId], dict);
                update(render, dict, mainId, events, claims);
            },
            selected: function (e) {
                if (this.class.indexOf("selected") == -1) {
                    clearClasses(dict);
                    this.class = "selected";
                    setClasses(dict[mainId], dict);
                    update(render, dict, mainId, events, claims);
                }
            },
            remove: function (parent, event) {
                var index = parent.claim.childIds.indexOf(this.id);
                if (index > -1) {
                    parent.claim.childIds.splice(index, 1);
                }
                clearClasses(dict);
                parent.class = "selected";
                setClasses(dict[mainId], dict);
                update(render, dict, mainId, events, claims);
            },
            addExisting: function (event) {
                var childId = event.srcElement.parentElement.querySelector('input[name="addChild"]').value;
                this.childIds.push(childId);
                settleIt.calculate(dict[mainId], dict);
                update(render, dict, mainId, events, claims);
                event.stopPropagation();
            },
            add: function (isProMain, event) {
                //debugger;
                var newScore = {
                    claim: {
                        id: newId(),
                        content: "new Claim",
                        isProMain: isProMain,
                        childIds: [],
                        citation: "",
                        citationUrl: ""
                    }
                };
                dict[newScore.claim.id] = newScore;
                this.claim.childIds.unshift(newScore.claim.id);
                claims.push(newScore.claim);
                clearClasses(dict);
                newScore.class = "selected editing";
                setClasses(dict[mainId], dict);
                settleIt.calculate(dict[mainId], dict);
                update(render, dict, mainId, events, claims);
                event.stopPropagation();
            },
            edit: function (event) {
                if (this.class == "selected editing") {
                    clearClasses(dict);
                    this.class = "selected";
                }
                else {
                    clearClasses(dict);
                    this.class = "selected editing";
                }
                setClasses(dict[mainId], dict);
                update(render, dict, mainId, events, claims);
                event.stopPropagation();
            },
            updateSettings: function (settings, event) {
                settings[event.srcElement.getAttribute("bind")] = event.srcElement.checked;
                update(render, dict, mainId, events, claims);
                event.stopPropagation();
            },
            noBubbleClick: function (event) {
                var event = arguments[0] || window.event;
                event.stopPropagation();
            }
        };
        var root = {};
        var render = hyperHTML.bind(s);
        update(render, dict, mainId, events, claims);
    }
    var claims = document.getElementsByTagName('claim');
    for (var _i = 0, claims_1 = claims; _i < claims_1.length; _i++) {
        var s = claims_1[_i];
        start(s);
    }
};
//# sourceMappingURL=reasonRoot.js.map