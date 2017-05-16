
this.onload = function () {

    var settings = {};

    function update(render, dict, mainId, events) {

        function renderNode(score, parent) {
            var claim = score.claim;
            var wire = hyperHTML.wire(score);
            var result = wire`
                <li class="${score.class}">
                    <div class="claimPad" onclick="${events.selected.bind(score)}">
                        <div class="${"claim " + (claim.isProMain ? 'pro' : 'con') + (claim.childIds.length > 0 & !score.open ? ' shadow' : '')}" >
                            <div class="innerClaim">
                                <span class="score" > ${
                (score.generation == 0 ?
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
                                <input name="content" oninput="${events.updated.bind(claim)}" ><br>
                                <input name="citation" oninput="${events.updated.bind(claim)}" ><br>
                                <input name="citationUrl" oninput="${events.updated.bind(claim)}" ><br>
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
                    input.value = claim[input.getAttribute("name")];
                }
            }

            return result;
        }

        function toggleSettings(event) {
            settings.visible = !settings.visible;
            update(render, dict, mainId, events);
        }

        render`
        <div class="rr">
            <div class = "${'settingsHider ' + (settings.visible ? 'open' : '')}"> 
                <input type="checkbox" id="setting1" name="setting1" value="setting1">
                <label for="setting1">Setting 1</label>
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


        if (s.getAttribute('dict').charAt(0) == '{') {
            dict = JSON.parse(s.getAttribute('dict'));
        } else {
            var claims = JSON.parse(s.getAttribute('dict'));
            //add the claims to the dictionairy
            var dict = createDict(claims);
            var mainScore = dict[mainId];
            settleIt.calculate(mainScore, dict)
            clearClasses(dict);
            setClasses(mainScore, dict)
        }

        var events = {
            updated(e) {
                //this.content = e.target.value;
                var inputs = e.srcElement.parentElement.querySelectorAll('input');
                for (let input of inputs) {
                    this[input.getAttribute("name")] = input.value;
                }

                update(render, dict, mainId, events);
            },

            selected(e) {
                if (this.class.indexOf("selected") == -1) {
                    clearClasses(dict);
                    this.class = "selected";
                    setClasses(dict[mainId], dict);
                    update(render, dict, mainId, events);
                }
            },

            add(isProMain, event) {
                //debugger;
                var newScore = {
                    claim: {
                        id: ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4),
                        content: "new Claim",
                        isProMain: isProMain,
                        childIds: [],
                        citation: "",
                        citationUrl: ""
                    }
                };
                dict[newScore.claim.id] = newScore;
                this.claim.childIds.unshift(newScore.claim.id);
                clearClasses(dict);
                newScore.class = "selected editing";
                setClasses(dict[mainId], dict);
                settleIt.calculate(dict[mainId], dict);
                update(render, dict, mainId, events);
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
                update(render, dict, mainId, events);
                event.stopPropagation();
            },

            noBubbleClick(event) {
                var event = arguments[0] || window.event;
                event.stopPropagation();
            }
        };

        var root = {};
        var render = hyperHTML.bind(s);
        update(render, dict, mainId, events);

    }

    var claims = document.getElementsByTagName('claim');
    for (let s of claims) {
        start(s)
    }

};
