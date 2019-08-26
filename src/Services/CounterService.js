import firebase, { database } from '../config/firebase';

export default (counter, properties, type) => {
    const updatedCounter = { ...counter };
    switch (type) {
        case "Add Movie": properties.forEach(name => { updatedCounter[name]++; }); break;
        case "Delete Movie": properties.forEach(name => { updatedCounter[name]--; }); break;
        case "Mark as watched": updatedCounter.unwatched--; break;
        case "Mark as unwatched": updatedCounter.unwatched++; break;
        default: break;
    }
    database.ref(`/mymovies/${firebase.auth().currentUser.uid}/counter`).set(updatedCounter, (error) => {
        if (!error) { }
        else { console.log('error: ', error); }
    });
}