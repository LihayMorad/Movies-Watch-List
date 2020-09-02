import AccountsService from './AccountsService';

const moviesService = {
    UpdateYears(updatedYears) {
        return AccountsService.GetDBRef('user').set({ years: [...updatedYears] }, { merge: true });
    },

    UpdateCounter(counter, properties, type) {
        const updatedCounter = { ...counter };
        switch (type) {
            case 'Add Movie':
                properties.forEach((name) => {
                    updatedCounter[name]++;
                });
                break;
            case 'Delete Movie':
                properties.forEach((name) => {
                    updatedCounter[name]--;
                });
                break;
            case 'Mark as watched':
                updatedCounter.unwatched--;
                break;
            case 'Mark as unwatched':
                updatedCounter.unwatched++;
                break;
            default:
                break;
        }

        return AccountsService.GetDBRef('user').set({ counter: updatedCounter }, { merge: true });
    },

    AddMovie(movieToBeAdded) {
        return AccountsService.GetDBRef('userMovies').add({ ...movieToBeAdded });
    },

    DeleteMovie(movieID) {
        return AccountsService.GetDBRef('userMovies').doc(movieID).delete();
    },

    IsMovieAlreadyExists(imdbID) {
        return new Promise((resolve, reject) => {
            AccountsService.GetDBRef('userMovies')
                .where('imdbID', '==', imdbID)
                .get()
                .then((querySnapshot) => {
                    if (!querySnapshot.empty || querySnapshot.size > 0) {
                        // movie exists
                        resolve(true);
                    } else {
                        // movie doesn't exists
                        resolve(false);
                    }
                })
                .catch(() => {
                    reject('error');
                });
        });
    },

    ShouldDeleteYear(imdbID, year) {
        // there is no '!=' clause in Firestore so we should split the query into a greater-than query and a less-than query.
        return new Promise((resolve, reject) => {
            AccountsService.GetDBRef('userMovies')
                .where('Year', '==', year)
                .where('imdbID', '>', imdbID)
                .get()
                .then((querySnapshot) => {
                    if (!querySnapshot.empty || querySnapshot.size > 0) {
                        resolve(false);
                    } else {
                        AccountsService.GetDBRef('userMovies')
                            .where('Year', '==', year)
                            .where('imdbID', '<', imdbID)
                            .get()
                            .then((querySnapshot) => {
                                if (!querySnapshot.empty || querySnapshot.size > 0) resolve(false);
                                else resolve(true);
                            })
                            .catch(() => {
                                reject('error');
                            });
                    }
                })
                .catch(() => {
                    reject('error');
                });
        });
    },

    UpdateMovie(dbMovieID, movieData) {
        return AccountsService.GetDBRef('userMovies').doc(dbMovieID).update(movieData);
    },
};

export default moviesService;
