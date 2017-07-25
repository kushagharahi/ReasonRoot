declare var require: any;

//Import JS
import ReasonRoot from './app/ReasonRoot';
import Firebase from './app/Firebase';

//Import SCSS
require ('../src/assets/styles/ReasonRoot.scss');

//The code block that inflates the claims nodes
//that was on index.html now are appended through this .js file

let mainClaimsDict = {};
//var prev_handler2 = window.onload;

window.onload = async function () {

  const firebase = new Firebase();
  firebase.firebaseInit();

  function createReasonRoot() {
    firebase.createReasonRoot();
    //this.appendReasonRoot(claimId);
  };

  const btnCreateReasonRoot = document.getElementById('btnCreateReasonRoot');

  btnCreateReasonRoot.addEventListener('click', e => {
    let rr = new ReasonRoot(firebase);
    createReasonRoot();
    uptade();
  });

function uptade(){
  //if (prev_handler2) prev_handler2();
  var claimElements = document.getElementsByTagName('claim');
  let settings = {
      hideScore: true,
      hidePoints: true,
      hideClaimMenu: true,
      noAutoSave: true,
      showSiblings: true,
      hideChildIndicator: true
  }

  for (let claimElement of claimElements) {
    let rr = new ReasonRoot(firebase,claimElement);
    mainClaimsDict[rr.mainId] = rr;
  }
  mainClaimsDict['ql2heRoABQ0y'].settings = settings;
  mainClaimsDict['ql2heRoABQ0y'].selectedScore = mainClaimsDict['ql2heRoABQ0y'].mainScore;
  mainClaimsDict['ql2heRoABQ0y'].setDisplayState();
  mainClaimsDict['ql2heRoABQ0y'].update();
  mainClaimsDict['ql2fPeGzkKQS'].settings = settings;
  mainClaimsDict['ql2fPeGzkKQS'].claims[mainClaimsDict['ql2fPeGzkKQS'].rr.mainId].isProMain = false;
  mainClaimsDict['ql2fPeGzkKQS'].update();
}

uptade();

};

//Here ends this code block
