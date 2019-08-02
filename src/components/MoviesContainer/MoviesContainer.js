import React, { PureComponent } from 'react';
import firebase, { database } from '../../config/firebase';

import Movie from '../Movie/Movie';
import UserMenu from '../UserMenu/UserMenu';
import MoviesSpinner from '../Spinners/MoviesSpinner/MoviesSpinner';
import InformationDialog from './InformationDialog/InformationDialog';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutlined';

import './MoviesContainer.css';

const styles = {
    "loggedInBtn": { margin: '6px auto 10px auto', backgroundColor: 'forestgreen' },
    "loggedInName": { textDecoration: 'underline' },
    "scrollToMenu": { margin: '15px', bottom: '1px', backgroundColor: 'black' },
    "btnMargin": { margin: '6px 5px 10px 5px' }
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
        googleAuthProvider: new firebase.auth.GoogleAuthProvider()
    }

    componentDidMount() {
        this.topMenuRef = React.createRef();

        firebase.auth().onAuthStateChanged(user => {
            if (user) { this.getMoviesToWatch(); } // User is signed in.
            else { } // No user is signed in.
        });
    }

    componentDidUpdate() {
        // this.state.moviesData.forEach(elem => { console.log(elem.key) });
        // console.log('[componentDidUpdate] this.state.moviesData: ', this.state.moviesData);
    }

    handleUserSignIn = () => {
        firebase.auth().signInWithPopup(this.state.googleAuthProvider)
            .then((result) => { this.handleInformationDialogTitle(`Hi ${result.additionalUserInfo.profile.name}, you are now logged in.`); }) // Sign-in successfully.
            .catch((error) => { this.handleInformationDialogTitle('Sign in error: ' + error); console.log('Sign in error: ', error); }); // Sign-in failed.
    }

    handleUserSignInAnonymously = () => {
        firebase.auth().signInAnonymously()
            .then((result) => { this.handleInformationDialogTitle(`Hi, you are now logged in as a guest user.`); }) // Sign-in anonymously successfully.
            .catch((error) => { this.handleInformationDialogTitle(`Error! cannot sign in as a guest user.`); console.log('errorCode: ', error); }); // Sign-in anonymously failed.
    }

    handleUserAccountLinking = () => {
        firebase.auth().currentUser.linkWithPopup(this.state.googleAuthProvider)
            .then((result) => { this.handleInformationDialogTitle(`You guest account was successfully linked with your Google account '${result.user.email}'.`); }) // Accounts successfully linked.
            .catch((error) => { this.handleInformationDialogTitle(`Error! Cannot link with Google account '${error.email}' because you've probably used it before. Please log in with your '${error.email}' Google account.`); }); // Error while linking accounts.
    }

    handleUserSignOut = () => {
        const relevantAccountMessage = firebase.auth().currentUser.isAnonymous
            ? "guest account ?\n Please pay attention that you your data will be lost! You can link it to your Google account to save it."
            : `account '${firebase.auth().currentUser.email}' ?`;
        if (window.confirm(`Are you sure you want to logout from your ${relevantAccountMessage} `)) {
            firebase.auth().signOut()
                .then((result) => { this.handleInformationDialogTitle("You are now logged out."); }) // Sign-out successfully.
                .catch((error) => { this.handleInformationDialogTitle('Sign out error: ' + error); console.log('Sign out error: ', error); }); // Sign-out failed.
        }
    }

    toggleInformationDialog = () => {
        this.setState(state => { return { showInformationDialog: !state.showInformationDialog } },
            () => setTimeout(() => { this.setState({ showInformationDialog: false }) }, 3000));
    }

    handleInformationDialogTitle = title => { this.setState({ informationDialogTitle: title }, () => { this.toggleInformationDialog(); }); }

    handleMovieAdd = details => {
        const Year = parseInt(details.Year);
        const { NameEng, NameHeb, imdbID, Comments } = details;
        const movieToBeAdded = { NameEng, NameHeb, imdbID, Comments, Year };

        database.ref('/mymovies/' + firebase.auth().currentUser.uid).push(movieToBeAdded, () => {
            this.handleInformationDialogTitle(`'${movieToBeAdded.NameEng} (${movieToBeAdded.Year})' added successfully`);
            this.toggleMovieAddModal();
        });
    }

    toggleMovieAddModal = () => { this.setState({ addingMovie: !this.state.addingMovie }); }

    handleMovieDelete = movieID => {
        let deletedMovieDetails = "";
        let updatedMoviesData = [...this.state.moviesData];

        updatedMoviesData = updatedMoviesData.filter(movie => {
            if (movieID === movie.key) {
                deletedMovieDetails = `${movie.props.nameEng} (${movie.props.releaseYear})`;
                return false;
            }
            return true;
        });

        database.ref(`/mymovies/${firebase.auth().currentUser.uid}/${movieID}`).remove()
            .then((result) => { this.handleInformationDialogTitle(`'${deletedMovieDetails}' deleted successfully`); this.setState({ moviesData: updatedMoviesData }); })
            .catch((error) => { this.handleInformationDialogTitle(`Error! Cannot delete '${deletedMovieDetails}'`); console.error("remove movie error: ", error); })
    }

    getMoviesToWatch = (filter = "releaseYear", order = "descending", year = "All", maxResults = this.state.maxResults) => {

        const filterToShow = filter === "releaseYear" ? "Year" : filter.charAt(0).toUpperCase() + filter.slice(1); // for matching DB's keys: nameEng > NameEng

        this.setState({ maxResults: maxResults, loading: true }, () => {
            const userID = firebase.auth().currentUser.uid;
            if (year === "All") {
                database.ref('/mymovies/' + userID).orderByChild(filterToShow).limitToLast(this.state.maxResults)
                    .on('value',
                        response => { this.handleFirebaseData(response, filterToShow, order, year); },
                        error => { console.log(error); })
            } else {
                database.ref('/mymovies/' + userID).orderByChild("Year").limitToLast(this.state.maxResults).equalTo(parseInt(year))
                    .on('value',
                        response => { this.handleFirebaseData(response, filterToShow, order, year); },
                        error => { console.log(error); });
            }
        });
    }

    handleFirebaseData = (response, filter, order, year) => {
        let sortedMovies = [];

        if (year !== "All") {
            sortedMovies = this.sortMoviesOfTheSameYear(response.val(), filter, order);
        } else {
            order === "descending"
                ? response.forEach(elem => { sortedMovies.unshift({ key: elem.key, ...elem.val() }); })
                : response.forEach(elem => { sortedMovies.push({ key: elem.key, ...elem.val() }); });
        }

        this.setMoviesToWatch(sortedMovies);
    }

    setMoviesToWatch = moviesData => {

        let years = new Set([...this.state.years]);
        const movies = moviesData.map(movie => {
            years.add(movie['Year']);
            return <Movie
                key={movie['key']}
                dbID={movie['key']}
                imdbID={movie['imdbID'] || null}
                nameHeb={movie['NameHeb']}
                nameEng={movie['NameEng']}
                releaseYear={movie['Year']}
                userID={firebase.auth().currentUser.uid}
                userEmail={firebase.auth().currentUser.email}
                comments={movie['Comments']}
                handleInformationDialog={this.handleInformationDialogTitle}
                delete={this.handleMovieDelete} />
        });

        this.setState({ moviesData: movies, years: [...years].sort((a, b) => b - a), loading: false });
    }

    sortMoviesOfTheSameYear = (responseData, filter, order) => {

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

        let userMenu = null;
        let moviesC = null;
        const firebaseUser = firebase.auth().currentUser;
        const isLoggedIn = Boolean(firebaseUser);
        let scrollToMenu = null;
        let signInOutButton = <Button color="primary" variant="contained" style={styles.btnMargin} title={"Sign in with your Google account"}
            onClick={this.handleUserSignIn}><PersonIcon />&nbsp;Sign in</Button>;
        let signInOutAnonymouslyButton = <Button color="primary" variant="contained" style={styles.btnMargin} title={"Sign in anonymously"}
            onClick={this.handleUserSignInAnonymously}><PersonOutlineIcon />&nbsp;Sign in as a guest</Button>;

        if (isLoggedIn) {
            signInOutButton = <Button
                color="primary" variant="contained" style={styles.loggedInBtn} title="Logout"
                onClick={this.handleUserSignOut}>
                Logged in as&nbsp;<span style={styles.loggedInName}>{firebaseUser.isAnonymous ? "a guest" : firebaseUser.displayName || firebaseUser.email}</span></Button>;

            if (firebaseUser.isAnonymous) {
                signInOutAnonymouslyButton = <Button color="primary" variant="contained" style={styles.btnMargin}
                    title="Link this guest account with your Google account to save your data"
                    onClick={this.handleUserAccountLinking}>Link with Google account</Button>;
            } else {
                signInOutAnonymouslyButton = null;
            }

            userMenu = <div className={"UserMenu"} ref={this.topMenuRef}>
                <UserMenu
                    isOpen={this.state.addingMovie}
                    toggle={this.toggleMovieAddModal}
                    addMovie={details => { this.handleMovieAdd(details) }}
                    getMovies={this.getMoviesToWatch}
                    years={this.state.years}
                    maxResults={this.state.maxResults}
                    handleInformationDialog={this.handleInformationDialogTitle} />
            </div>;

            moviesC = !this.state.loading
                ? <div className="MoviesGallery">{this.state.moviesData}</div>
                : <MoviesSpinner />;

            scrollToMenu = <Fab
                color="primary" variant="extended" style={styles.scrollToMenu} size="small" title=" Scroll to the top menu"
                onClick={() => { window.scrollTo({ top: this.topMenuRef.current.offsetTop, behavior: "smooth" }); }}><NavigationIcon /></Fab>;
        }

        return (
            <div>
                {signInOutButton}
                {signInOutAnonymouslyButton}
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