declare var require: any;

const firebase = require('firebase');

export default class Auth{
  db: any;

  firebaseInit(): any {
      if (!firebase.apps.length) {
          firebase.initializeApp({
              apiKey: "AIzaSyCMwI2cAkenTaxBAkVjUUlw0hwVs7jj7Bk",
              authDomain: "reasonrootdev.firebaseapp.com",
              databaseURL: "https://reasonrootdev.firebaseio.com",
              projectId: "reasonrootdev",
              storageBucket: "reasonrootdev.appspot.com",
              messagingSenderId: "680169719491"
          });
      }
      return this.db = firebase.database();
  }

  signIn() {
      this.firebaseInit();
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then((function (result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          this.userName = firebase.auth().currentUser ? firebase.auth().currentUser.email + ' - ' + firebase.auth().currentUser.uid : 'Sign In'
          console.log(result);
          // ...
      }).bind(this)).catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          console.log(error);
      });
  }

}
