import { auth, firestore } from '../config/firebase';

const accountsService = {

    googleAuthProvider: null,

    InitAccountService() {
        this.googleAuthProvider = new auth.GoogleAuthProvider().setCustomParameters({ prompt: 'select_account' });
        return auth();
    },

    SignIn() { return auth().signInWithPopup(this.googleAuthProvider); },

    SignInAnonymously() { return auth().signInAnonymously(); },

    LinkAccount() { return auth().currentUser.linkWithPopup(this.googleAuthProvider); },

    SignOut() { return auth().signOut(); },

    GetLoggedInUser() { return auth().currentUser; },

    GetDBRef(target) {
        switch (target) {
            case "userMovies": return firestore.collection(`mymovies/${auth().currentUser.uid}/movies`);
            case "user": return firestore.doc(`mymovies/${auth().currentUser.uid}`);
            default: return null;
        }
    }

}

export default accountsService;