import { database } from '../config/firebase';

import AccountsService from './AccountsService';

const moviesService = {

    UpdateCounter(counter, properties, type) {
        const updatedCounter = { ...counter };
        switch (type) {
            case "Add Movie": properties.forEach(name => { updatedCounter[name]++; }); break;
            case "Delete Movie": properties.forEach(name => { updatedCounter[name]--; }); break;
            case "Mark as watched": updatedCounter.unwatched--; break;
            case "Mark as unwatched": updatedCounter.unwatched++; break;
            default: break;
        }

        return new Promise((resolve, reject) => {
            database.ref(`/mymovies/${AccountsService.GetLoggedInUser().uid}/counter`).set(updatedCounter, (error) => {
                if (!error) { resolve(); }
                else { reject(error); }
            });
        })
    },

    AddMovie(movieToBeAdded) {
        return new Promise((resolve, reject) => {
            database.ref(`/mymovies/${AccountsService.GetLoggedInUser().uid}/movies`).push(movieToBeAdded, (error) => {
                if (!error) { resolve(); }
                else { reject(error); }
            });
        })
    },

    DeleteMovie(movieID) { return database.ref(`/mymovies/${AccountsService.GetLoggedInUser().uid}/movies/${movieID}`).remove(); },

    UpdateYears(updatedYears) {
        return new Promise((resolve, reject) => {
            database.ref(`/mymovies/${AccountsService.GetLoggedInUser().uid}/years`).set([...updatedYears], (error) => {
                if (!error) { resolve(); }
                else { reject(error); }
            });
        })
    },

    IsMovieAlreadyExists(imdbID) {
        return new Promise((resolve, reject) => {
            database.ref(`/mymovies/${AccountsService.GetLoggedInUser().uid}/movies`).orderByChild("imdbID").equalTo(imdbID).once('value',
                response => { resolve(!!response.val()); },
                error => { resolve("error"); })
        })
    },

    UpdateComments(dbMovieID, comments) {
        return new Promise((resolve, reject) => {
            database.ref(`/mymovies/${AccountsService.GetLoggedInUser().uid}/movies/${dbMovieID}`).update({ Comments: comments }, (error) => {
                if (!error) { resolve(); }
                else { reject(error); }
            });
        });
    },

    ToggleMovieWatched(dbMovieID, checked) {
        return new Promise((resolve, reject) => {
            database.ref(`/mymovies/${AccountsService.GetLoggedInUser().uid}/movies/${dbMovieID}`).update({ Watched: checked }, (error) => {
                if (!error) { resolve(); }
                else { reject(error); }
            })
        });
    }

}

export default moviesService;
