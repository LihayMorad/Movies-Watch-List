import AccountsService from './AccountsService';

const moviesService = {
    GetMoviesMetadata() {
        return new Promise((resolve, reject) => {
            AccountsService.GetDBRef('user')
                .get()
                .then((querySnapshot) => {
                    if (!querySnapshot.empty || querySnapshot.size > 0) {
                        const { years, counter } = querySnapshot.data();
                        resolve({ years, counter });
                    }
                })
                .catch(reject);
        });
    },

    UpdateYears(year, type) {
        return new Promise((resolve, reject) => {
            this.GetMoviesMetadata()
                .then(({ years }) => {
                    if (years) {
                        let updatedYears = years;
                        switch (type) {
                            case 'add':
                                updatedYears = new Set([...years, year]);
                                break;
                            case 'remove':
                                updatedYears = years.filter((y) => y !== year);
                                break;
                            default:
                                break;
                        }
                        AccountsService.GetDBRef('user')
                            .set({ years: [...updatedYears] }, { merge: true })
                            .then(resolve)
                            .catch(reject);
                    }
                })
                .catch(reject);
        });
    },

    UpdateCounter(properties, type) {
        return new Promise((resolve, reject) => {
            this.GetMoviesMetadata()
                .then(({ counter }) => {
                    if (counter) {
                        const updatedCounter = { ...counter };
                        switch (type) {
                            case 'Add Movie':
                                properties.forEach((name) => updatedCounter[name]++);
                                break;
                            case 'Delete Movie':
                                properties.forEach((name) => updatedCounter[name]--);
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
                        AccountsService.GetDBRef('user')
                            .set({ counter: updatedCounter }, { merge: true })
                            .then(resolve)
                            .catch(reject);
                    }
                })
                .catch(reject);
        });
    },

    AddMovie(movieToBeAdded) {
        return AccountsService.GetDBRef('userMovies').add({ ...movieToBeAdded });
    },

    DeleteMovie(movieID) {
        return AccountsService.GetDBRef('userMovies').doc(movieID).delete();
    },

    isMovieExists(imdbID) {
        return new Promise((resolve, reject) => {
            AccountsService.GetDBRef('userMovies')
                .where('imdbID', '==', imdbID)
                .get()
                .then((querySnapshot) => {
                    if (!querySnapshot.empty || querySnapshot.size > 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch(() => {
                    reject('error');
                });
        });
    },

    ShouldRemoveYear(imdbID, year) {
        // there is no '!=' clause in Firestore so we should split the query into a greater-than query and a less-than query.
        return new Promise((resolve) => {
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
                                if (!querySnapshot.empty || querySnapshot.size > 0) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            })
                            .catch(() => resolve(false));
                    }
                })
                .catch(() => resolve(false));
        });
    },

    UpdateMovie(dbMovieID, movieData) {
        return AccountsService.GetDBRef('userMovies').doc(dbMovieID).update(movieData);
    },
};

export default moviesService;
