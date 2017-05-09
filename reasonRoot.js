
this.onload = function () {


    function update(render, dict, mainId, events) {

        function renderNode(claim, parent) {
            var s = claim.statement;
            var wire = hyperHTML.wire(claim, parent);
            var li = wire`
                <li class="${"rr_li " + (parent && parent.open ? 'open' : 'closed')}">
                <div class="claimBox">
                    <span 
                        onclick="${events.open.bind(claim)}" 
                        class="${"toggleButton " + (claim.open ? 'toggleButtonOpen' : 'toggleButtonClosed')}">${
                s.childIds.length > 0 ? '➤' : ''
                }</span>
                    <input oninput="${events.updated.bind(claim)}" >
                    ${s.content}
                </div>

                <ul class="rr_ul">${
                s.childIds.map((nodeId, i) => renderNode(dict[nodeId], claim))
                }</ul>
                </li>`;

            if (!wire.default) {
                wire.default = s.content;
                li.querySelector('input').value = s.content;
            }
            return li;
        }

        render`<ul class="rr_ul">${renderNode(dict[mainId], { open: true })}</ul>`;
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


        var render = hyperHTML.bind(s);
        update(render, dict, mainId, events);

    }

    var statements = document.getElementsByTagName('statement');
    for (let s of statements) {
        renderStatements(s)
    }

};
