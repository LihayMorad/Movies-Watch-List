import React, { PureComponent } from 'react';
import firebase from '../../config/firebase';
import { database } from '../../config/firebase';

import Movie from '../Movie/Movie';
import UserMenu from '../UserMenu/UserMenu';
import MoviesSpinner from '../Spinners/MoviesSpinner/MoviesSpinner';
import InformationDialog from './InformationDialog/InformationDialog';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';

import './MoviesContainer.css';

const styles = {
    "loggedInBtn": { margin: '6px auto 10px auto', backgroundColor: 'forestgreen' },
    "loggedInName": { textDecoration: 'underline' },
    "scrollToMenu": { margin: '10px', bottom: '1px', backgroundColor: 'black' }
};

class MoviesContainer extends PureComponent {

    state = {
        moviesData: [],
        maxResults: 5,
        addingMovie: false,
        years: [],
        loading: false,
        showInformationDialog: false,
        informationDialogTitle: "",
    }

    componentDidMount() {
        this.topMenuRef = React.createRef();

        firebase.auth().onAuthStateChanged(user => {
            if (user) { this.getMoviesToWatch(); }  // User is signed in.
            else { } // No user is signed in.
        });
    }

    componentDidUpdate() {
        // this.state.moviesData.forEach(elem => { console.log(elem.key) });
        // console.log('[componentDidUpdate] this.state.moviesData: ', this.state.moviesData);
    }

    handleUserSignIn = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(result => { // Sign-in successfully.
                const username = result.additionalUserInfo.profile.name;
                this.handleInformationDialogTitle(`Hi ${username}, you are now logged in.`);
            })
            .catch(error => { this.handleInformationDialogTitle('Sign in error: ' + error); console.log('Sign in error: ', error); }); // Sign-in failed.
    }

    handleUserSignOut = () => {
        if (window.confirm(`Are you sure you want to log out from your account ${firebase.auth().currentUser.email} ?`)) {
            firebase.auth().signOut()
                .then(() => { // Sign-out successfully.
                    this.handleInformationDialogTitle("You are now logged out.");
                })
                .catch(error => { this.handleInformationDialogTitle('Sign out error: ' + error); console.log('Sign out error: ', error); }); // Sign-out failed.
        }
    }

    toggleInformationDialog = () => {
        this.setState({ showInformationDialog: !this.state.showInformationDialog }, () => { setTimeout(() => { this.setState({ showInformationDialog: false }) }, 3000) });
    }

    handleInformationDialogTitle = title => {
        this.setState({ informationDialogTitle: title }, () => { this.toggleInformationDialog(); });
    }

    handleMovieDelete = movieID => {
        let deletedMovieDetails = "";
        let updatedMoviesData = this.state.moviesData.slice(); // same as ES6: [...this.state.moviesData]

        updatedMoviesData = updatedMoviesData.filter(movie => {
            if (movieID === movie.key) {
                deletedMovieDetails = `${movie.props.nameEng} (${movie.props.releaseYear})`;
                return false;
            }
            return true;
        });

        this.setState({ moviesData: updatedMoviesData }, () => {
            database.ref('/mymovies/' + firebase.auth().currentUser.uid + "/" + movieID).remove()
                .then(() => {
                    this.handleInformationDialogTitle(`'${deletedMovieDetails}' deleted successfully`);
                })
                .catch((error) => { console.error(error); })
        });
    }

    handleMovieAdd = details => {
        const Year = parseInt(details.Year);
        const movieToBeAdded = { ...details, Year };
        delete movieToBeAdded.movieSearchResults;
        delete movieToBeAdded.loading;

        database.ref('/mymovies/' + firebase.auth().currentUser.uid).push(movieToBeAdded, () => {
            this.handleInformationDialogTitle(`'${movieToBeAdded.NameEng} (${movieToBeAdded.Year})' added successfully`);
            this.toggleMovieAddModal();
        });
    }

    toggleMovieAddModal = () => { this.setState({ addingMovie: !this.state.addingMovie }); }

    getMoviesToWatch = (filter = "releaseYear", order = "descending", year = "All", maxResults = this.state.maxResults) => {

        const filterToShow = filter === "releaseYear" ? "Year" : filter.charAt(0).toUpperCase() + filter.slice(1); // for matching DB's keys: nameEng > NameEng

        this.setState({ maxResults: maxResults, loading: true }, () => {
            const userID = firebase.auth().currentUser.uid;
            if (year === "All") {
                database.ref('/mymovies/' + userID).orderByChild(filterToShow).limitToLast(this.state.maxResults)
                    .on('value', response => { this.handleFirebaseData(response, filterToShow, order, year); }, error => { console.log(error); })
            } else {
                database.ref('/mymovies/' + userID).orderByChild("Year").limitToLast(this.state.maxResults).equalTo(parseInt(year))
                    .on('value', response => { this.handleFirebaseData(response, filterToShow, order, year); }, error => { console.log(error); });
            }
        });
    }

    handleFirebaseData = (response, filter, order, year) => {
        let sortedMovies = [];

        if (year !== "All") {
            sortedMovies = this.sortMoviesofTheSameYear(response.val(), filter, order); // sort movies of the same year by filter
        } else {
            order === "descending"
                ? response.forEach(elem => { sortedMovies.unshift({ key: elem.key, ...elem.val() }); })
                : response.forEach(elem => { sortedMovies.push({ key: elem.key, ...elem.val() }); });
        }

        this.setMoviesToWatch(sortedMovies);
    }

    setMoviesToWatch = moviesData => {

        let years = [];
        const movies = moviesData.map(movie => { // .slice(0, this.state.maxResults)
            years.push(movie['Year']);
            return <Movie
                key={movie['key']}
                dbID={movie['key']}
                imdbID={movie['imdbID'] ? movie['imdbID'] : null}
                nameHeb={movie['NameHeb']}
                nameEng={movie['NameEng']}
                releaseYear={movie['Year']}
                trailerURL={movie['TrailerURL']}
                userID={firebase.auth().currentUser.uid}
                userEmail={firebase.auth().currentUser.email}
                comments={movie['Comments']}
                handleInformationDialog={this.handleInformationDialogTitle}
                delete={this.handleMovieDelete} />
        });

        years = new Set([...this.state.years, ...years]);
        this.setState({ moviesData: movies, years: years, loading: false });
    }

    sortMoviesofTheSameYear = (responseData, filter, order) => {

        let sortedMovies = [];

        for (const elem in responseData)
            sortedMovies.push({ key: elem, ...responseData[elem] });

        sortedMovies = sortedMovies.sort((a, b) => { // filter(movie => !movie.Error).

            const movie1 = a[filter], movie2 = b[filter];

            if (order === "descending") {
                return (movie2 > movie1
                    ? 1
                    : (movie2 === movie1 ? 0 : -1));
            } else {
                return (movie1 < movie2
                    ? -1
                    : (movie2 === movie1 ? 0 : 1));
            }
        });

        return sortedMovies;
    }

    render() {

        const isLoggedIn = firebase.auth().currentUser ? true : false;
        let signInOutButton = <Button color="primary" variant="contained" title={"Sign in with your Google account"} onClick={() => this.handleUserSignIn()}>Sign in</Button>;
        let userMenu = null;
        let moviesC = null;
        let scrollToMenu = null;

        if (isLoggedIn) {
            signInOutButton = <Button
                color="primary"
                variant="contained"
                style={styles.loggedInBtn}
                title={`Log out from ${firebase.auth().currentUser.email}`}
                onClick={() => this.handleUserSignOut()}>
                Logged in as&nbsp;<span style={styles.loggedInName}>{firebase.auth().currentUser.displayName}</span></Button>;

            userMenu = <div className={"UserMenu"} ref={this.topMenuRef}>
                <UserMenu
                    isOpen={this.state.addingMovie}
                    toggle={this.toggleMovieAddModal}
                    addMovie={details => { this.handleMovieAdd(details) }} // @@@@@@@@@@@@@
                    getMovies={this.getMoviesToWatch}
                    years={this.state.years}
                    maxResults={this.state.maxResults}
                    handleInformationDialog={this.handleInformationDialogTitle} />
            </div>;

            moviesC = !this.state.loading
                ? <div className={"MoviesGallery"}>{this.state.moviesData}</div>
                : <MoviesSpinner />;

            scrollToMenu = <Fab
                color="primary"
                variant="extended"
                style={styles.scrollToMenu}
                size="small"
                title=" Scroll to the top menu"
                onClick={() => { window.scrollTo({ top: this.topMenuRef.current.offsetTop, behavior: "smooth" }); }}><NavigationIcon /></Fab>;
        }

        return (
            <div>
                {signInOutButton}
                {userMenu}
                {moviesC}
                {scrollToMenu}

                <InformationDialog
                    isOpen={this.state.showInformationDialog}
                    toggle={this.toggleInformationDialog}
                    dialogTitle={this.state.informationDialogTitle} />
            </div>
        );

    }

}

export default MoviesContainer;