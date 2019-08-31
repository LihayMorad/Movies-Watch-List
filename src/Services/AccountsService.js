import firebase, { database } from '../config/firebase';

const accountsService = {

    googleAuthProvider: null,

    InitAccountService() {
        this.googleAuthProvider = new firebase.auth.GoogleAuthProvider().setCustomParameters({ prompt: 'select_account' });
        return firebase.auth();
    },

    SignIn() { return firebase.auth().signInWithPopup(this.googleAuthProvider) },

    SignInAnonymously() { return firebase.auth().signInAnonymously() },

    SignOut() { this.ClearListeners(["movies", "years", "counter"]); return firebase.auth().signOut() },

    LinkAccount() { return firebase.auth().currentUser.linkWithPopup(this.googleAuthProvider) },

    GetDBRef(target) { return database.ref(`/mymovies/${firebase.auth().currentUser.uid}/${target}`); },

    GetLoggedInUser() { return firebase.auth().currentUser; },

    ClearListeners(targets) { targets.forEach(target => { database.ref(`/mymovies/${firebase.auth().currentUser.uid}/${target}`).off(); }) }

}

export default accountsService;