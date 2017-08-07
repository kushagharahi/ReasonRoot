import firebase = require('firebase');

import Root from './Root';
import Claim from './Claim';
// import ReasonRoot from './ReasonRoot';

export default class Firebase{
  listenerRefs: any[] = new Array<any>();
  db: any;
  rr: Root = new Root();

  SignIn() {
      //this.firebaseInit(this.rr, true);
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
          // // Handle Errors here.
          // var errorCode = error.code;
          // var errorMessage = error.message;
          // // The email of the user's account used.
          // var email = error.email;
          // // The firebase.auth.AuthCredential type that was used.
          // var credential = error.credential;
          console.log(error);
      });
  }

  firebaseInit(/*rr: Root, canWrite: Boolean*/) {
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
     this.db = firebase.database();
    // // // There have to change firebase rules
    // // var fbRef = firebase.database().ref().child('test');
    // // fbRef.on('value', snap => console.log(snap.val()) );
    // var that = this;
    // // onAuthStateChanged listen when a user do login or logout
    // // and onAuthStateChanged returns currentUser
    // firebase.auth().onAuthStateChanged(function (currentUser) {
    //     // Check if the user is loged
    //   if (currentUser) {
    //     //console.log(currentUser);
    //     //Query user permissions
    //     let permissionRef = that.db.ref('permissions/user/' + currentUser.uid + "/" + rr.mainId)
    //     that.listenerRefs.push(permissionRef);
    //
    //     //To do the can write below is on the wrong "this"
    //     permissionRef.on('value', function (snapshot) {
    //       canWrite = snapshot.val();
    //     })
    //     let ref = firebase.database().ref('permissions/user/' + currentUser.uid);
    //     ref.once('value')
    //       .then(snapshot => {
    //         let ReasonRoots = snapshot.val();
    //         for(let ReasonRoot in ReasonRoots){
    //           that.appendReasonRoot(ReasonRoot);
    //         }
    //     });
    //   } else {
    //     // If user is not loged set write permissions false.
    //     canWrite = false;
    //   }
    // });
  }

  //old params rr: Root, canWrite: Boolean
  onAuthStateChanged(){
    this.db = firebase.database();
    // // There have to change firebase rules
    // var fbRef = firebase.database().ref().child('test');
    // fbRef.on('value', snap => console.log(snap.val()) );
    var that = this;
    // onAuthStateChanged listen when a user do login or logout
    // and onAuthStateChanged returns currentUser
    firebase.auth().onAuthStateChanged(function (currentUser) {
        // Check if the user is loged
      if (currentUser) {
        //Query user permissions
        // let permissionRef = that.db.ref('permissions/user/' + currentUser.uid + "/" + rr.mainId);
        // that.listenerRefs.push(permissionRef);
        //
        // //To do the can write below is on the wrong "this"
        // permissionRef.on('value', function (snapshot) {
        //   canWrite = snapshot.val();
        // })

        let ref = firebase.database().ref('permissions/user/' + currentUser.uid);
        ref.once('value')
          .then(snapshot => {
            let reasonRoots = snapshot.val();
            for(let reasonRoot in reasonRoots){
              that.appendReasonRoot(reasonRoot);
            }
        });

      }
      // else {
      //   // If user is not loged set write permissions false.
      //   console.log("User not logged");
      //   canWrite = false;
      // }
    });
  }

  getCurrentUser(): any {
    return firebase.auth().currentUser;
  }

  getDatabase(): any {
    return firebase.database();
  }

  getDataById(id: string): any{
    let ref = firebase.database().ref('roots/' + id);
    return ref.once('value')
      .then(snapshot => {
        return JSON.stringify(snapshot.val());
      });
    // Re send query if response is undefined
  }


  addData(mainClaim: any, parentClaim: any, childClaim: any): void{
    let mainId = mainClaim.mainId;
    let parentId = parentClaim.claimId;
    let childId = childClaim.claimId;
    let ref = firebase.database().ref('roots/' + mainId + '/claims');

    let claim = {};
    claim[childId] = Object.assign({}, childClaim);

    ref.update(claim);

    this.updateChilds(mainClaim, parentClaim);
  }

  updateData(mainClaim: any, childClaim: any){
    let mainId = mainClaim.mainId;
    let childId = childClaim.claimId;

    let ref = firebase.database().ref('roots/' + mainId + '/claims/' + childId);
    ref.update(childClaim);
  };

  deleteData(mainClaim: any, parentClaim: any, childClaim: any){
    let mainId = mainClaim.mainId;
    let parentId = parentClaim.claimId;
    let childId = childClaim.claimId;
    let childIds = [];
    childIds = childClaim.childIds;

    let route = 'roots/' + mainId + '/claims/' + childId;
    let ref = firebase.database().ref(route);
    ref.remove();

    // Check if node has child
    if(childIds !== undefined){
      for( let childId of childIds){
        let childClaim = {};
        let route = 'roots/' + mainId + '/claims/' + childId;
        let ref = firebase.database().ref(route);
        ref.on('value', snapshot => {
          childClaim = snapshot.val();
          this.deleteData(mainClaim, parentId, childClaim);
        });
      }
    }
      this.updateChilds(mainClaim, parentClaim);
};

updateChilds(mainClaim: any, parentClaim: any){
  let mainId = mainClaim.mainId;
  let parentId = parentClaim.claimId;
  let childIds = parentClaim.childIds;
  let route = 'roots/' + mainId + '/claims/' + parentId + '/childIds';
  let ref = firebase.database().ref(route);
  ref.set(childIds);
}

  createReasonRoot(): void {
    let database = firebase.database();
    let currentUserId = firebase.auth().currentUser.uid;
    let newClaim = new Claim();
    let claimId = newClaim.claimId;

    let permission = {};
    permission[claimId] = newClaim.isProMain;
    database.ref('permissions/user/' + currentUserId).update(permission);

    let claim = {};
    claim[claimId] = Object.assign({}, newClaim);

    database.ref('roots/' + claimId).set({
      claims: claim,
      mainId: claimId
    });
    //this.appendReasonRoot(claimId);
  };

  appendReasonRoot(claimId){
    let element = document.createElement("claim");
    this.getDataById(claimId)
      .then(data => {
        element.setAttribute("root", data);
      })
     .then(() => {
       document.body.appendChild(element);
     }
   );
  };
}
