
this.onload = function () {

    var settings = {};

    function update(render, dict, mainId, events, claims) {
        save(dict[mainId], dict);

        function renderNode(score, parent) {
            var claim = score.claim;
            var wire = hyperHTML.wire(score);
            var result = wire`
                <li id="${claim.id}" class="${score.class}">
                    <div class="claimPad" onclick="${events.selected.bind(score)}">
                        <div class="${"claim " + (claim.isProMain ? 'pro' : 'con')+ (claim.disabled ? ' disabled ' : '') + (claim.childIds.length > 0 & !score.open ? ' shadow' : '')}" >
                            <div class="innerClaim">
                                <span class="score" > ${(score.generation == 0 ?
                    Math.round(score.weightedPercentage * 100) + '%' :
                    Math.floor(Math.abs(score.weightDif)))
                }</span>

                                ${claim.content}

                                <a target="_blank" href="${claim.citationUrl}" onclick="${events.noBubbleClick}"> 
                                    <span class="citation">${claim.citation}</span>
                                </a>

                             </div>
                        </div>
                        
                        <div class="${"childIndicatorSpace" + (claim.childIds.length == 0 ? '' : ' hasChildren')}">
                            <div class="${"childIndicator " + (claim.isProMain ? 'pro' : 'con')}">
                            <div class="childIndicatorInner">
                            ${score.numDesc} more
                            </div>
                            </div>
                        </div>

                        <div class="claimEditHider">
                            <div class="claimEditSection">
                                <input bind="content"  oninput="${events.updated.bind(claim)}" ><br>
                                <input bind="citation" oninput="${events.updated.bind(claim)}" ><br>
                                <input bind="citationUrl" oninput="${events.updated.bind(claim)}" ><br>
                                <input type="checkbox" bind="isProMain" onclick="${events.updated.bind(claim)}">
                                <label for="isProMain">Does this claim supports the main claim?</label><br/>
                                <input type="checkbox" bind="disabled" onclick="${events.updated.bind(claim)}">
                                <label for="disabled">Disabled?</label><br/>
                                <button onclick="${events.remove.bind(claim, parent)}" name="button">
                                    Remove this claim from it's parent
                                </button><br/>
                                <button onclick="${events.addExisting.bind(claim)}" name="addChildBtn">
                                    Add an existing claim
                                </button>
                                <input name="addChild" style="width: initial;"><br>
                                ID:${claim.id}
                            </div>
                        </div>

                        <div class="claimMenuHider">
                            <div class="claimMenuSection">
                                <div class="addClaim pro" onclick="${events.add.bind(score, true)}">add</div>
                                <div class="addClaim con" onclick="${events.add.bind(score, false)}">add</div>
                                <div class="editClaimButton" onclick="${events.edit.bind(score)}">edit</div>
                            </div>
                        </div>

                    </div>  
                      
                    <ul>${
                claim.childIds.map((childId, i) => renderNode(dict[childId], score))
                }</ul>
                </li>`

            if (!wire.default) {
                wire.default = claim.content;
                var inputs = result.querySelector('.claimPad').querySelectorAll('input');
                for (let input of inputs) {
                    var bindName = input.getAttribute("bind")
                    if (bindName) {
                        if (input.type == "checkbox")
                        input.checked = claim[bindName];
                        else
                        input.value = claim[bindName];
                    }
                }
            }

            return result;
        }

        function toggleSettings(event) {
            settings.visible = !settings.visible;
            update(render, dict, mainId, events, claims);
        }

        replaceAll = function (target, search, replacement) {
            return target.split(search).join(replacement);
        };

        render`
        <div class="${'rr ' +
            (settings.hideScore ? 'hideScore ' : '')
            }">
            <div class = "${'settingsHider ' + (settings.visible ? 'open' : '')}"> 
                <input type="checkbox" id="hideScore" bind="hideScore" value="hideScore" onclick="${events.updateSettings.bind(this, settings)}">
                <label for="hideScore">Hide Score</label>
                <input value="${replaceAll(JSON.stringify(claims), '\'', '&#39;')}"></input>
           </div>
            <div>${renderNode(dict[mainId], { open: true })}</div>
            <div class="settingsButton" onclick="${toggleSettings}"> 
                ⚙
            </div>
        </div>`;
    }

    //Render the claims
    function start(s) {
        var mainId = s.getAttribute('stmtId');
        var settleIt = new SettleIt();

        clearClasses = function (dict) {
            for (var scoreId in dict) {
                dict[scoreId].class = "hide";
            }
        }

        setClassesLoop = function (score, dict, parent) {
            for (let childId of score.claim.childIds) {
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
        }

        setClasses = function (mainScore, dict, parent) {
            setClassesLoop(mainScore, dict, parent);
            if (mainScore.class.indexOf("selected") == -1) mainScore.class = "mainClaim";
        }

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

            return result
        }

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
        } else {
            var mainScore = dict[mainId];
            settleIt.calculate(mainScore, dict)
            clearClasses(dict);
            setClasses(mainScore, dict)
        }

        save = function (mainScore, dict) {
            localStorage.setItem("rr_" + mainScore.claim.id, JSON.stringify(dict));
        }

        var events = {
            updated(e) {
                //this.content = e.target.value;
                var inputs = e.srcElement.parentElement.querySelectorAll('input');
                for (let input of inputs) {
                    var bindName = input.getAttribute("bind")
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

            selected(e) {
                if (this.class.indexOf("selected") == -1) {
                    clearClasses(dict);
                    this.class = "selected";
                    setClasses(dict[mainId], dict);
                    update(render, dict, mainId, events, claims);
                }
            },

            remove(parent, event) {
                var index = parent.claim.childIds.indexOf(this.id);
                if (index > -1) {
                    parent.claim.childIds.splice(index, 1);
                }
                clearClasses(dict);
                parent.class = "selected";
                setClasses(dict[mainId], dict);
                update(render, dict, mainId, events, claims);
            },

            addExisting(event) {
                var childId = event.srcElement.parentElement.querySelector('input[name="addChild"]').value;
                this.childIds.push(childId);
                settleIt.calculate(dict[mainId], dict);
                update(render, dict, mainId, events, claims);
                event.stopPropagation();
            },

            add(isProMain, event) {
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

            edit(event) {
                if (this.class == "selected editing") {
                    clearClasses(dict);
                    this.class = "selected";
                } else {
                    clearClasses(dict);
                    this.class = "selected editing";
                }
                setClasses(dict[mainId], dict);
                update(render, dict, mainId, events, claims);
                event.stopPropagation();
            },

            updateSettings(settings, event) {
                settings[event.srcElement.getAttribute("bind")] = event.srcElement.checked
                update(render, dict, mainId, events, claims);
                event.stopPropagation();
            },

            noBubbleClick(event) {
                var event = arguments[0] || window.event;
                event.stopPropagation();
            }
        };

        var root = {};
        var render = hyperHTML.bind(s);
        update(render, dict, mainId, events, claims);

    }

    var claims = document.getElementsByTagName('claim');
    for (let s of claims) {
        start(s)
    }

};
