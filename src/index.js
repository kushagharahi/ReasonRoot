//Import JS
import RRDisplay from './app/rrDisplay.ts';

//Import SCSS
require ('./assets/styles/ReasonRoot.scss');

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
