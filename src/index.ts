declare var require: any;

//Import JS
import ReasonRoot from './app/ReasonRoot';
import Auth from './app/Auth';

//Import SCSS
require ('../src/assets/styles/ReasonRoot.scss');

//The code block that inflates the claims nodes
//that was on index.html now are appended through this .js file

let mainClaimsDict = {}

window.onload = async function () {

  const txtEmail = <HTMLInputElement>document.getElementById('txtEmail');
  const txtPassword = <HTMLInputElement>document.getElementById('txtPassword');
  const btnSignIn = document.getElementById('btnSignIn');
  const btnSignUp = document.getElementById('btnSignUp');
  const btnSignOut = document.getElementById('btnSignOut');

  const txtContent = <HTMLInputElement>document.getElementById('txtContent');
  const txtCitation = <HTMLInputElement>document.getElementById('txtCitation');
  const btnCreateReasonRoot = document.getElementById('btnCreateReasonRoot');

  let auth = new Auth();

  // Add event listeners
  btnSignUp.addEventListener('click', e => {
    // Get email and password values
    const email = txtEmail.value;
    const pass = txtPassword.value;
    auth.signUp(email, pass);
  });

  btnSignIn.addEventListener('click', e => {
    // Get email and password values
    const email = txtEmail.value;
    const pass = txtPassword.value;
    auth.signIn(email, pass);
  });

  // Logout
  btnSignOut.addEventListener('click', e => {
    auth.signOut();
  });

  btnCreateReasonRoot.addEventListener('click', e => {
    let rr = new ReasonRoot();
    const content = txtContent.value;
    const citation = txtCitation.value;
    rr.createReasonRoot(content, citation);
  });

  var claimElements = document.getElementsByTagName('claim');

  for (let claimElement of claimElements) {
    let rr = new ReasonRoot(claimElement);
    mainClaimsDict[rr.mainId] = rr;
  }
};

//Here ends this code block
