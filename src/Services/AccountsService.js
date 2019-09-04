import { auth, firestore } from '../config/firebase';

const accountsService = {

    googleAuthProvider: null,

    InitAccountService() {
        this.googleAuthProvider = new auth.GoogleAuthProvider().setCustomParameters({ prompt: 'select_account' });
        return auth();
    },

    SignIn() { return auth().signInWithPopup(this.googleAuthProvider) },

    SignInAnonymously() { return auth().signInAnonymously() },

    SignOut() { return auth().signOut() },

    LinkAccount() { return auth().currentUser.linkWithPopup(this.googleAuthProvider) },

    GetDBRef(target) {
        if (target === "movies")
            return firestore.collection(`mymovies/${auth().currentUser.uid}/${target}`)
        else { }
    },

    GetDBListener() { return firestore.doc(`mymovies/${auth().currentUser.uid}`) },

    GetLoggedInUser() { return auth().currentUser; }

}

export default accountsService;