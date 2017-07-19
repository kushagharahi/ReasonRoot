declare var require: any;

//Import JS
import ReasonRoot from './app/ReasonRoot';
import Firebase from './app/Firebase';

//Import SCSS
require ('../src/assets/styles/ReasonRoot.scss');

//The code block that inflates the claims nodes
//that was on index.html now are appended through this .js file

let mainClaimsDict = {}

window.onload = async function () {

  const firebase = new Firebase();
  console.log(firebase);
  firebase.firebaseInit();
  console.log(firebase);

  function createReasonRoot() {
    console.log(firebase);
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
  let claimElements = document.getElementsByTagName('claim');

  for (let claimElement of claimElements) {
    let rr = new ReasonRoot(firebase,claimElement);
    mainClaimsDict[rr.mainId] = rr;
  }
}

uptade();

};

//Here ends this code block
