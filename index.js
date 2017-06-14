//TODO Change js libs to their ts versions

//Import JS
RRDisplay = require('./js/src/rrDisplay.js');
Score = require('./js/src/score.js');
SettleIt = require('./js/src/SettleIt.js');
Claim = require('./js/src/Claim.js');
Dict = require('./js/src/Dict.js');
Root = require('./js/src/Root.js');
//require('./HyperHTML.js');

//Import SCSS
require('./ReasonRoot.scss');

//The code block that inflates the claims nodes
//that was on index.html now are appended through this .js file

let mainClaimsDict = {}

window.onload = async function () {

  var claimElements = document.getElementsByTagName('claim');

  for (let claimElement of claimElements) {
    let rr = new RRDisplay(claimElement);
    mainClaimsDict[rr.mainId] = rr;
  }
};

//Here ends this code block
