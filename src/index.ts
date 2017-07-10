declare var require: any;

//Import JS
import ReasonRoot from './app/ReasonRoot';

//Import SCSS
require ('../src/assets/styles/ReasonRoot.scss');

//The code block that inflates the claims nodes
//that was on index.html now are appended through this .js file

let mainClaimsDict = {}

window.onload = async function () {

  const txtContent = <HTMLInputElement>document.getElementById('txtContent');
  const txtCitation = <HTMLInputElement>document.getElementById('txtCitation');
  const btnCreateReasonRoot = document.getElementById('btnCreateReasonRoot');

  btnCreateReasonRoot.addEventListener('click', e => {
    let rr = new ReasonRoot();
    const content = txtContent.value;
    const citation = txtCitation.value;
    rr.createReasonRoot(content, citation);
    uptade();
  });

function uptade(){
  console.log("update");
  let claimElements = document.getElementsByTagName('claim');

  for (let claimElement of claimElements) {
    console.log(claimElement);
    let rr = new ReasonRoot(claimElement);
    mainClaimsDict[rr.mainId] = rr;
  }
}

uptade();

};

//Here ends this code block
