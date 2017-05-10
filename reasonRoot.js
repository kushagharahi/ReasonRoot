
this.onload = function () {


    function update(render, dict, mainId, events) {
            //<input oninput="${events.updated.bind(claim)}" >

        function renderNode(claim, parent) {
            var s = claim.statement;
            var wire = hyperHTML.wire(claim, parent);
            var li = wire`
<li class="${claim.open ? 'open' : 'closed'}">
            <div class="statementPad  notSelected">
                <div class="${"statement " + (s.isProMain ? 'pro' : 'con')}" >

                <span class="score" > ${
                    (claim.generation == 0 ?
                        Math.round(claim.weightedPercentage * 100) + '%' :
                        Math.floor(Math.abs(claim.weightDif))) 
                }</span>
                  
                ${s.content}
                  
                  <span onclick="noClickBubble()"><a targer="_blank" href="${s.citationUrl}"> 
                    <span class="citation">${s.citation}</a></span>
                  
            </div>
              
            <span 
                onclick="${events.open.bind(claim)}" 
                class="${"toggleButton " + (claim.open ? 'toggleButtonOpen' : 'toggleButtonClosed')}">${
                s.childIds.length > 0 ? '➤' : ''
            }</span>
            
        </div>    
                <ul>${
                s.childIds.map((nodeId, i) => renderNode(dict[nodeId], claim))
                }</ul>
      </li>`


                /*<li>
                <div class="${parent && parent.open ? 'open' : 'closed'}">
                    <div class="claimBox">
                        <span 
                            onclick="${events.open.bind(claim)}" 
                            class="${"toggleButton " + (claim.open ? 'toggleButtonOpen' : 'toggleButtonClosed')}">${
                            s.childIds.length > 0 ? '➤' : ''
                        }</span>


                        <div class="${'claim ' + (claim.statement.isProParent ? 'pro' : 'con')}">
                        ${s.content}
                        </div>
                    </div>
                </div>

                <ul>${
                s.childIds.map((nodeId, i) => renderNode(dict[nodeId], claim))
                }</ul>
                </li>`;*/



            // if (!wire.default) {
            //     wire.default = s.content;
            //     li.querySelector('input').value = s.content;
            // }
            return li;
        }

        render`<div class="rr">${renderNode(dict[mainId], { open: true })}</div>`;
    }

    //Render the statements
    function renderStatements(s) {
        var dict = {};
        var mainId = s.getAttribute('stmtId');

        if (s.getAttribute('dict').charAt(0) == '{') {
            dict = JSON.parse(s.getAttribute('dict'));
        } else {
            var claims = JSON.parse(s.getAttribute('dict'));
            //add the claims to the dictionairy
            var dict = createDict(claims);
            var settleIt = new SettleIt();
            var scores = settleIt.calculate(dict[mainId],dict)
        }

        var events = {
            updated(e) {
                this.statement.content = e.target.value;
                update(render, dict, mainId, events);
            },

            open(e) {
                //debugger;
                this.open = !this.open;
                update(render, dict, mainId, events);
            }
        };
        var root={};


        var render = hyperHTML.bind(s);
        update(render, dict, mainId, events);

    }

    var statements = document.getElementsByTagName('statement');
    for (let s of statements) {
        renderStatements(s)
    }

};
