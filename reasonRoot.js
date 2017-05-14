
this.onload = function () {


    function update(render, dict, mainId, events) {
        //<input oninput="${events.updated.bind(claim)}" >

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

                        <div class="editClaimSpacer">
                            <div class="addClaim pro" onclick="${events.add.bind(score, true)}">add pro</div>
                            <div class="addClaim con" onclick="${events.add.bind(score, false)}">add con</div>
                        </div>
                    </div>  
                      
                    <ul>${
                claim.childIds.map((nodeId, i) => renderNode(dict[nodeId], score))
                }</ul>
                </li>`

            return result;
        }

        render`<div class="rr">${renderNode(dict[mainId], { open: true })}</div>`;
    }

    //Render the claims
    function renderClaims(s) {
        var mainId = s.getAttribute('stmtId');
        var settleIt = new SettleIt();

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

        clearClasses = function (dict) {
            for (var scoreId in dict) {
                dict[scoreId].class = "hide";
            }
        }

        var events = {
            updated(e) {
                this.claim.content = e.target.value;
                update(render, dict, mainId, events);
            },

            selected(e) {
                //debugger;
                if (this.class != "selected") {
                    clearClasses(dict);
                    this.class = "selected";
                    setClasses(dict[mainId], dict);
                }

                update(render, dict, mainId, events);
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
                this.claim.childIds.push(newScore.claim.id);
                settleIt.calculate(dict[mainId], dict);
                update(render, dict, mainId, events);
                event.stopPropagation();
            },

            noBubbleClick(event) {
                var event = arguments[0] || window.event;
                event.stopPropagation();
            }
        };
        var root = {};

        setClasses = function (mainScore, dict, parent) {
            setClassesLoop(mainScore, dict, parent);
            if (mainScore.class != "selected") mainScore.class = "mainClaim";

        }

        setClassesLoop = function (score, dict, parent) {
            for (let childId of score.claim.childIds) {
                var childScore = dict[childId];
                //process the children first
                setClassesLoop(childScore, dict, score);

                if (childScore.class == "selected")
                    score.class = "parent";
                if (childScore.class == "ancestor" || childScore.class == "parent")
                    score.class = "ancestor";
                if (score.class == "selected")
                    childScore.class = "child";
            }
        }

        var render = hyperHTML.bind(s);
        update(render, dict, mainId, events);

    }

    var claims = document.getElementsByTagName('claim');
    for (let s of claims) {
        renderClaims(s)
    }

};
