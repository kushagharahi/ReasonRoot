declare const require: any;

const firebase = require('firebase');

import Root from './Root';

export default class Auth{
  listenerRefs: any[] = new Array<any>();
  db: any;
  rr: Root = new Root();

  signIn() {
      this.firebaseInit(this.rr, true);
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

  firebaseInit(rr: Root, canWrite: Boolean) {
    if (!firebase.apps.length) {
        firebase.initializeApp({
            apiKey: "AIzaSyAH_UO_f2F3OuVLfZvAqezEujnMesmx6hA",
            authDomain: "settleitorg.firebaseapp.com",
            databaseURL: "https://settleitorg.firebaseio.com",
            projectId: "settleitorg",
            storageBucket: "settleitorg.appspot.com",
            messagingSenderId: "835574079849"
        });
    }
    this.db = firebase.database();
    var that = this;
    firebase.auth().onAuthStateChanged(function (user) {
        //Check for write permissions
        if (firebase.auth().currentUser) {
            let permissionRef = that.db.ref('permissions/user/' + firebase.auth().currentUser.uid + "/" + rr.mainId)
            that.listenerRefs.push(permissionRef);

            //To do the can write below is on the wrong "this"
            permissionRef.on('value', function (snapshot) {
                canWrite = snapshot.val();
            })
        } else {
            canWrite = false;
        }
    });
  }

}
