
this.onload = function () {



    function renderNode(claim, parent) {
        var wire = hyperHTML.wire(claim, parent);
        var li = wire`
      <li class="${"rr_li " + (parent && parent.open ? 'open' : 'closed')}">
      <div class="claimBox">
        <span 
            onclick="${events.open.bind(claim)}" 
            class="${"toggleButton " + (claim.open ? 'toggleButtonOpen' : 'toggleButtonClosed')}">${
            claim.children.length > 0 ? '➤' : ''
            }</span>
        <input oninput="${events.updated.bind(claim)}" >
        ${claim.description}
      </div>

      <ul class="rr_ul">${
            claim.children.map((nodeId, i) => renderNode(dict[nodeId], claim))
            }</ul>
     </li>`;

        if (!wire.default) {
            wire.default = claim.description;
            li.querySelector('input').value = claim.description;
        }
        return li;
    }

    function update(render) {
        render`<ul class="rr_ul">${renderNode(dict[mainId], { open: true })}</ul>`;
    }

    var
        //render = hyperHTML.bind(document.body),
        mainId = 0,
        dict = {
            0: {
                description: "item 0",
                children: [1, 2],
                open: true
            },
            1: {
                description: "item 1",
                children: [3]
            },
            2: {
                description: "item 2",
                children: []
            },
            3: {
                description: "item 3",
                children: []
            },
        },
        events = {
            updated(e) {
                this.description = e.target.value;
                update(render, dict, mainId, events);
            },

            open(e) {
                //debugger;
                this.open = !this.open;
                update(render, dict, mainId, events);
            }
        };

    //Find all the statements in the document
    var statements = document.getElementsByTagName('statement');

    //Render the statements
    for (let s of statements) {
        var render = hyperHTML.bind(s);
        update(render, dict, mainId, events);
    }
    //update(render, dict, mainId, events);

};
