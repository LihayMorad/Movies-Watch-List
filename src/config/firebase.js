import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import ReactGA from 'react-ga';

const firestoreConfig = {
    apiKey: process.env.REACT_APP_FIRESTORE_API_KEY,
    authDomain: process.env.REACT_APP_FIRESTORE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIRESTORE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIRESTORE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIRESTORE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIRESTORE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIRESTORE_APP_ID,
};

firebase.initializeApp(firestoreConfig);
ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS);

export default firebase;
export const firestore = firebase.firestore();
export const auth = firebase.auth;
