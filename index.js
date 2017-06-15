//TODO Change js libs to their ts versions

//Import JS
import RRDisplay from './src/rrDisplay.ts';

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
