import { firestore } from '../config/firebase';

import AccountsService from './AccountsService';

const moviesService = {

    UpdateYears(updatedYears) {
        return firestore.doc(`mymovies/${AccountsService.GetLoggedInUser().uid}`).set({ years: [...updatedYears] }, { merge: true });
    },

    UpdateCounter(counter, properties, type) {
        const updatedCounter = { ...counter };
        switch (type) {
            case "Add Movie": properties.forEach(name => { updatedCounter[name]++; }); break;
            case "Delete Movie": properties.forEach(name => { updatedCounter[name]--; }); break;
            case "Mark as watched": updatedCounter.unwatched--; break;
            case "Mark as unwatched": updatedCounter.unwatched++; break;
            default: break;
        }

        return firestore.doc(`mymovies/${AccountsService.GetLoggedInUser().uid}`).set({ counter: updatedCounter }, { merge: true })
    },

    AddMovie(movieToBeAdded) {
        return firestore.collection(`mymovies/${AccountsService.GetLoggedInUser().uid}/movies`).add({ ...movieToBeAdded })
    },

    DeleteMovie(movieID) {
        return firestore.doc(`mymovies/${AccountsService.GetLoggedInUser().uid}/movies/${movieID}`).delete()
    },

    IsMovieAlreadyExists(imdbID) {
        return new Promise((resolve, reject) => {
            firestore.collection(`mymovies/${AccountsService.GetLoggedInUser().uid}/movies`).where("imdbID", "==", imdbID).get()
                .then(querySnapshot => {
                    if (!querySnapshot.empty || querySnapshot.size > 0)
                        resolve(true); // movie exists
                    else
                        resolve(false); // movie doesn't exists
                })
                .catch(error => { reject("error"); });
        })
    },

    ShouldDeleteYear(imdbID, year) {
        return new Promise((resolve, reject) => {
            firestore.collection(`mymovies/${AccountsService.GetLoggedInUser().uid}/movies`).where("Year", "==", year).where("imdbID", ">", imdbID).get()
                .then(querySnapshot => {
                    if (!querySnapshot.empty || querySnapshot.size > 0) {
                        resolve(false);
                    } else {
                        firestore.collection(`mymovies/${AccountsService.GetLoggedInUser().uid}/movies`).where("Year", "==", year).where("imdbID", "<", imdbID).get()
                            .then(querySnapshot => {
                                if (!querySnapshot.empty || querySnapshot.size > 0)
                                    resolve(false);
                                else
                                    resolve(true);
                            })
                            .catch(error => { reject("error"); });
                    }
                })
                .catch(error => { reject("error"); });
        })
    },

    UpdateComments(dbMovieID, comments) {
        return firestore.doc(`mymovies/${AccountsService.GetLoggedInUser().uid}/movies/${dbMovieID}`).update({ Comments: comments })
    },

    ToggleMovieWatched(dbMovieID, checked) {
        return firestore.doc(`mymovies/${AccountsService.GetLoggedInUser().uid}/movies/${dbMovieID}`).update({ Watched: checked })
    }

}

export default moviesService;
