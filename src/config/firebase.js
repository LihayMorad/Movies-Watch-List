import firebase from 'firebase/app';
import 'firebase/database';

  let config = {
    apiKey: "AIzaSyAtq44pGpHzdrfBImF_ZDP8wiPW38RkE6w",
    authDomain: "movies-to-watch-26077.firebaseapp.com",
    databaseURL: "https://movies-to-watch-26077.firebaseio.com",
    projectId: "movies-to-watch-26077",
    storageBucket: "movies-to-watch-26077.appspot.com",
    messagingSenderId: "932668361467"
  };
  firebase.initializeApp(config);

  export default firebase;

  export const database = firebase.database();
