
  this.onload = function () {

    function renderNode(info, parent) {
       var wire = hyperHTML.wire(info,parent);
      var li = wire`
      <li class="${parent && parent.open ? 'open' : 'closed'}"><span onclick="${events.open.bind(info)}" class="${"toggleButton " + (info.open ? 'toggleButtonOpen' : 'toggleButtonClosed')}">${events.showToggle(info, parent)}</span>
      <input oninput="${events.updated.bind(info)}" >
      ${info.description}
      <ul >${
        info.children.map((nodeId, i) => renderNode(dict[nodeId], info))
        }</ul>
     </li>`;

     if (!wire.default) {
       wire.default = info.description;
       li.querySelector('input').value = info.description;
     }
     return li;
    }

    function update(render) {
      render`${renderNode(dict[mainId], { open: true })}`;
    }

    var
      render = hyperHTML.bind(document.body),
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
        },
        showToggle(info, parent) {
          if (info.children.length > 0)
               return '▷'
          else
            return ''
        }
      };

    update(render, dict, mainId, events);

  };
