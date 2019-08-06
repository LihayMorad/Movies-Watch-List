import React, { PureComponent } from 'react';
import firebase, { database } from '../../config/firebase';

import { connect } from 'react-redux'
import * as actionTypes from '../../store/actions';

import Movie from '../Movie/Movie';
import UserMenu from '../UserMenu/UserMenu';
import InformationDialog from './InformationDialog/InformationDialog';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutlined';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Fade from '@material-ui/core/Fade';
import Snackbar from '../UI Elements/Snackbar/Snackbar';
import MoviesSpinner from '../UI Elements/Spinners/MoviesSpinner/MoviesSpinner';
import TrackVisibility from 'react-on-screen';

import './MoviesContainer.css';

class MoviesContainer extends PureComponent {

    state = {
        moviesData: [],
        maxResults: 5,
        addingMovie: false,
        years: [],
        loading: false,
        showInformationDialog: false,
        informationDialogTitle: "",
        googleAuthProvider: new firebase.auth.GoogleAuthProvider(),
        accountMenuAnchorEl: null,
        showScrollToMenuButton: false
    }

    componentDidMount() {
        this.topMenuRef = React.createRef();

        firebase.auth().onAuthStateChanged(user => {
            if (user) { this.getMoviesToWatch(); } // User is signed in.
            else { } // No user is signed in.
        });
    }

    handleUserSignIn = () => {
        firebase.auth().signInWithPopup(this.state.googleAuthProvider)
            .then((result) => { this.props.onSnackbarToggle(true, `Hi ${result.additionalUserInfo.profile.name}, you are now logged in.`, "information"); }) // Sign-in successfully.
            .catch((error) => { this.props.onSnackbarToggle(true, `Sign in error: ${error}`, "error"); }); // Sign-in failed.
    }

    handleUserSignInAnonymously = () => {
        firebase.auth().signInAnonymously()
            .then((result) => { this.props.onSnackbarToggle(true, `Hi, you are now logged in as a guest user.`, "information"); }) // Sign-in anonymously successfully.
            .catch((error) => { this.props.onSnackbarToggle(true, `Error! cannot sign in as a guest user.`, "error"); }); // Sign-in anonymously failed.
    }

    handleUserAccountLinking = () => {
        firebase.auth().currentUser.linkWithPopup(this.state.googleAuthProvider)
            .then((result) => { this.props.onSnackbarToggle(true, `You guest account was successfully linked with your Google account '${result.user.email}'.`, "information"); }) // Accounts linking succeeded.
            .catch((error) => { this.props.onSnackbarToggle(true, `Error! Cannot link with Google account '${error.email}' because you've probably used it before. Try to login with your '${error.email}' Google account.`, "error"); }); // Accounts linking failed.
    }

    handleUserSignOut = () => {
        const relevantAccountMessage = firebase.auth().currentUser.isAnonymous
            ? "guest account ?\nPlease pay attention that you your data will be lost! You can link it to your Google account to save it."
            : `account '${firebase.auth().currentUser.email}' ?`;
        if (window.confirm(`Are you sure you want to logout from your ${relevantAccountMessage} `)) {
            firebase.auth().signOut()
                .then((result) => { this.props.onSnackbarToggle(true, "You are now logged out", "information"); }) // Sign-out successfully.
                .catch((error) => { this.props.onSnackbarToggle(true, `Sign out error: ${error}`, "error"); }); // Sign-out failed.
        }
    }

    toggleInformationDialog = () => {
        this.setState(state => ({ showInformationDialog: !state.showInformationDialog }),
            () => setTimeout(() => { this.setState({ showInformationDialog: false }) }, 3000));
    }

    handleInformationDialogTitle = title => { this.setState({ informationDialogTitle: title }, () => { this.toggleInformationDialog(); }); }

    handleMovieAdd = details => {
        const Year = parseInt(details.Year);
        const { NameEng, NameHeb, imdbID, Comments, Watched } = details;
        const movieToBeAdded = { NameEng, NameHeb, imdbID, Comments, Year, Watched };

        database.ref('/mymovies/' + firebase.auth().currentUser.uid).push(movieToBeAdded, (error) => {
            const message = !error
                ? `${movieToBeAdded.NameEng} (${movieToBeAdded.Year}) added successfully`
                : `There was an error adding ${movieToBeAdded.NameEng} (${movieToBeAdded.Year})`;
            this.props.onSnackbarToggle(true, message, !error ? "success" : "error");
            this.toggleMovieAddModal();
        });
    }

    toggleMovieAddModal = () => { this.setState(state => ({ addingMovie: !state.addingMovie })) }

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
            .then(() => {
                this.props.onSnackbarToggle(true, `'${deletedMovieDetails}' deleted successfully`, "success");
                this.setState({ moviesData: updatedMoviesData });
            })
            .catch(() => {
                this.props.onSnackbarToggle(true, `Error! Cannot delete '${deletedMovieDetails}'`, "error");
            })
    }

    getMoviesToWatch = (filter = "releaseYear", order = "descending", year = "All", maxResults = this.state.maxResults) => {

        const filterToShow = filter === "releaseYear" ? "Year" : filter.charAt(0).toUpperCase() + filter.slice(1); // for matching DB's keys: nameEng > NameEng

        this.setState({ maxResults: maxResults, loading: true }, () => {
            const userID = firebase.auth().currentUser.uid;
            if (year === "All") {
                database.ref('/mymovies/' + userID).orderByChild(filterToShow).limitToLast(this.state.maxResults)
                    .on('value',
                        response => { this.handleFirebaseData(response, filterToShow, order, year); },
                        error => { })
            } else {
                database.ref('/mymovies/' + userID).orderByChild("Year").limitToLast(this.state.maxResults).equalTo(parseInt(year))
                    .on('value',
                        response => { this.handleFirebaseData(response, filterToShow, order, year); },
                        error => { });
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
        if (!this.props.showWatchedMovies) {
            moviesData = moviesData.filter(movie => !movie.Watched);
        }

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
                watched={movie['Watched']}
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

    handleClickAccountMenu = e => { this.setState({ accountMenuAnchorEl: e.currentTarget }); }

    handleCloseAccountMenu = e => { this.setState({ accountMenuAnchorEl: null }); }

    scrollToMenu = () => { window.scrollTo({ top: this.topMenuRef.current.offsetTop, behavior: "smooth" }); }

    render() {

        let moviesC = null;
        const firebaseUser = firebase.auth().currentUser;
        const isLoggedIn = !!firebaseUser;
        const { accountMenuAnchorEl, showScrollToMenuButton, showInformationDialog, informationDialogTitle } = this.state;
        const isAccountMenuOpen = !!accountMenuAnchorEl;
        let scrollToMenu = null;
        let userMenu = null;

        let signInOutButton = <MenuItem>
            <Button
                id="signInWithGoogle" color="primary" variant="contained" title={"Sign in with your Google account"}
                onClick={this.handleUserSignIn}><PersonIcon />&nbsp;Sign in</Button>
        </MenuItem>;
        let signInOutAnonymouslyButton = <MenuItem>
            <Button
                className="btnPadding" color="default" variant="contained" title={"Sign in anonymously"}
                onClick={this.handleUserSignInAnonymously}><PersonOutlineIcon />&nbsp;Login as a guest</Button>
        </MenuItem>;

        if (isLoggedIn) {
            signInOutButton = <MenuItem
                title="Logout"
                onClick={this.handleUserSignOut}>
                <Button id="loggedInBtn" color="primary" variant="contained" title="Sign out">
                    {firebaseUser.isAnonymous
                        ? <><PersonOutlineIcon />&nbsp;Guest</>
                        : <><PersonIcon />&nbsp;{firebaseUser.displayName || firebaseUser.email}</>}
                </Button>
            </MenuItem >;

            if (firebaseUser.isAnonymous) {
                signInOutAnonymouslyButton = <MenuItem
                    onClick={this.handleUserAccountLinking}>
                    <Button className="btnPadding" color="primary" variant="outlined"
                        title="Link this guest account with your Google account to save your data">Link with Google
                    </Button>
                </MenuItem>;
            } else {
                signInOutAnonymouslyButton = null;
            }

            userMenu = ({ isVisible }) => {
                setTimeout(() => { this.setState({ showScrollToMenuButton: !isVisible }); }, 300);

                return <div className={"UserMenu"} ref={this.topMenuRef}>
                    <UserMenu
                        isOpen={this.state.addingMovie}
                        toggle={this.toggleMovieAddModal}
                        addMovie={details => { this.handleMovieAdd(details) }}
                        getMovies={this.getMoviesToWatch}
                        years={this.state.years}
                        maxResults={this.state.maxResults} />
                </div>;
            }

            moviesC = !this.state.loading
                ? <div className="MoviesGallery">
                    {this.state.moviesData.length === 0
                        ? <h3>Your list is empty.</h3>
                        : this.state.moviesData}
                </div>
                : <MoviesSpinner />;

            scrollToMenu = <Fab
                id="scrollToMenu" color="primary" variant="extended" size="small" title="Scroll to the top menu"
                onClick={this.scrollToMenu}><NavigationIcon />
            </Fab>;
        }

        return (
            <div>

                <React.Fragment>
                    <IconButton id="accountMenu" color="primary" aria-owns={accountMenuAnchorEl ? 'simple-menu' : undefined} aria-haspopup="true"
                        onClick={this.handleClickAccountMenu}>
                        <AccountCircle fontSize="large" />
                    </IconButton>

                    <Menu
                        anchorEl={accountMenuAnchorEl}
                        open={isAccountMenuOpen}
                        onClose={this.handleCloseAccountMenu}
                        TransitionComponent={Fade}
                        keepMounted>
                        {signInOutButton}
                        {signInOutAnonymouslyButton}
                    </Menu>
                </React.Fragment>

                {userMenu && <TrackVisibility partialVisibility>
                    {userMenu}
                </TrackVisibility>}

                {moviesC}
                {showScrollToMenuButton && scrollToMenu}

                <InformationDialog
                    isOpen={showInformationDialog}
                    toggle={this.toggleInformationDialog}
                    dialogTitle={informationDialogTitle} />

                <Snackbar />
            </div >
        );

    }

}

const mapStateToProps = state => state

const mapDispatchToProps = dispatch => ({
    onSnackbarToggle: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } })
})

export default connect(mapStateToProps, mapDispatchToProps)(MoviesContainer);