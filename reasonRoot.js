
this.onload = function () {


    function update(render, dict, mainId, events) {
        //<input oninput="${events.updated.bind(claim)}" >

        function renderNode(claim, parent) {
            var s = claim.claim;
            var wire = hyperHTML.wire(claim);
            return wire`
                <li class="${claim.class}">
                    <div class="claimPad" onclick="${events.selected.bind(claim)}">
                        <div class="${"claim " + (s.isProMain ? 'pro' : 'con') + (s.childIds.length > 0 & !claim.open ? ' shadow' : '')}" >
                            <div class="innerClaim">
                                <span class="score" > ${
                (claim.generation == 0 ?
                    Math.round(claim.weightedPercentage * 100) + '%' :
                    Math.floor(Math.abs(claim.weightDif)))
                }</span>

                                ${s.content}
                                
                                <a target="_blank" href="${s.citationUrl}" onclick="${events.noBubbleClick}"> 
                                    <span class="citation">${s.citation}</span>
                                </a>
                            </div>
                        </div>
                        
                        <div class="${"childIndicatorSpace" + (s.childIds.length == 0 ? '' : ' hasChildren')}">
                            <div class="${"childIndicator " + (s.isProMain ? 'pro' : 'con')}">
                            <div class="childIndicatorInner">
                            more
                            </div>
                            </div>
                        </div>

                        <div class="addClaimSpacer">
                            <div class="addClaim pro">add pro</div>
                            <div class="addClaim con">add con</div>
                        </div>
                    </div>  
                      
                    <ul>${
                s.childIds.map((nodeId, i) => renderNode(dict[nodeId], claim))
                }</ul>
                </li>`
        }

        render`<div class="rr">${renderNode(dict[mainId], { open: true })}</div>`;
    }

    //Render the claims
    function renderClaims(s) {
        var mainId = s.getAttribute('stmtId');

        if (s.getAttribute('dict').charAt(0) == '{') {
            dict = JSON.parse(s.getAttribute('dict'));
        } else {
            var claims = JSON.parse(s.getAttribute('dict'));
            //add the claims to the dictionairy
            var dict = createDict(claims);
            var settleIt = new SettleIt();
            var mainScore = dict[mainId];
            var scores = settleIt.calculate(mainScore, dict)
            clearClasses(dict);
            mainScore.class = "selected";
            ascendClaims(mainScore, dict)
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
                    //find Ancestors
                    ascendClaims(dict[mainId], dict);
                    dict[mainId].class = "mainClaim"

                }

                update(render, dict, mainId, events);
            },

            noBubbleClick(event) {
                var event = arguments[0] || window.event;
                event.stopPropagation();
            }
        };
        var root = {};

        ascendClaims = function (score, dict, parent) {
            for (let childId of score.claim.childIds) {
                var childScore = dict[childId];
                //process the children first
                ascendClaims(childScore, dict, score);

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
