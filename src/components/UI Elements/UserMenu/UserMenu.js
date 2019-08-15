import React, { Component } from 'react';

import firebase, { database } from '../../../config/firebase';

import { connect } from 'react-redux';
import * as actionTypes from '../../../store/actions';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import MovieFilterIcon from '@material-ui/icons/MovieFilter';
import Switch from '@material-ui/core/Switch';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@material-ui/core/Button';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutlined';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Fade from '@material-ui/core/Fade';

import MovieAddModal from '../../Movie/MovieAddModal/MovieAddModal';
import Snackbar from '../../UI Elements/Snackbar/Snackbar';

import { withStyles } from '@material-ui/core/styles';
import './UserMenu.css';

const StyledFormControlLabel = withStyles({
    root: { maxWidth: '100px', marginRight: '0' },
    label: { fontSize: '0.7rem', fontWeight: '500', color: 'white !important' }
})(FormControlLabel);

const StyledInputLabel = withStyles({ root: { color: 'inherit !important', '&:focus': { color: 'inherit !important' } } })(InputLabel);
const StyledSelect = withStyles({ icon: { color: 'inherit' } })(Select);
const StyledOutlinedInput = withStyles({ input: { padding: '18.5px 35px 18.5px 12px' }, notchedOutline: { borderColor: '#ffffffbf !important', '&:focus': { borderColor: 'white !important' }, } })(OutlinedInput);
const StyledSwitch = withStyles({ switchBase: { color: 'grey' }, checked: { color: 'white' }, })(Switch);

class UserMenu extends Component {

    state = {
        filter: "releaseYear",
        order: "descending",
        year: "All",
        maxResults: 5,
        googleAuthProvider: new firebase.auth.GoogleAuthProvider(),
        accountMenuAnchorEl: null,
        years: [],
        addingMovie: false,
        loading: false
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) { this.getMoviesToWatch(); } // User is signed in.
            else { } // No user is signed in.
        });
    }

    handleUserSignIn = () => {
        firebase.auth().signInWithPopup(this.state.googleAuthProvider)
            .then((result) => { // Sign-in successfully.
                this.props.toggleSnackbar(true, `Hi ${result.additionalUserInfo.profile.name}, you are now logged in.`, "information");
                this.handleCloseAccountMenu();
            })
            .catch((error) => { this.props.toggleSnackbar(true, `Sign in error: ${error}`, "error"); }); // Sign-in failed.
    }

    handleUserSignInAnonymously = () => {
        firebase.auth().signInAnonymously()
            .then((result) => { // Sign-in anonymously successfully.
                this.props.toggleSnackbar(true, `Hi, you are now logged in as a guest user.`, "information");
                this.handleCloseAccountMenu();
            })
            .catch((error) => { this.props.toggleSnackbar(true, `Error! cannot sign in as a guest user.`, "error"); }); // Sign-in anonymously failed.
    }

    handleUserAccountLinking = () => {
        firebase.auth().currentUser.linkWithPopup(this.state.googleAuthProvider)
            .then((result) => { // Accounts linking succeeded.
                this.props.toggleSnackbar(true, `You guest account was successfully linked with your Google account '${result.user.email}'.`, "information");
                this.handleCloseAccountMenu();
            })
            .catch((error) => { this.props.toggleSnackbar(true, `Error! Cannot link with Google account '${error.email}' because you've probably used it before. Try to login with your '${error.email}' Google account.`, "error"); }); // Accounts linking failed.
    }

    handleUserSignOut = () => {
        const relevantAccountMessage = firebase.auth().currentUser.isAnonymous
            ? "guest account ?\nPlease pay attention that you your data will be lost! You can link it to your Google account to save it."
            : `account '${firebase.auth().currentUser.email}' ?`;
        if (window.confirm(`Are you sure you want to logout from your ${relevantAccountMessage} `)) {
            firebase.auth().signOut()
                .then((result) => { // Sign-out successfully.
                    this.props.toggleSnackbar(true, "You are now logged out", "information");
                    this.handleCloseAccountMenu();
                })
                .catch((error) => { this.props.toggleSnackbar(true, `Sign out error: ${error}`, "error"); }); // Sign-out failed.
        }
    }

    getMoviesToWatch = (filter = "releaseYear", order = "descending", year = "All", maxResults = this.state.maxResults) => {
        this.props.toggleLoadingMovies(true);

        const filterToShow = filter === "releaseYear" ? "Year" : filter;

        this.setState({ maxResults: maxResults, loading: true }, () => {
            const user = firebase.auth().currentUser;
            const userID = user.uid;
            const isLoggedIn = !!user;
            let onValue = null;

            year === "All"
                ? onValue = database.ref('/mymovies/' + userID).orderByChild(filterToShow).limitToLast(this.state.maxResults)
                : onValue = database.ref('/mymovies/' + userID).orderByChild("Year").limitToLast(this.state.maxResults).equalTo(parseInt(year))

            onValue.on('value',
                response => { this.handleFirebaseData(response, filterToShow, order, year); },
                error => {
                    this.props.toggleLoadingMovies(false);
                    isLoggedIn && this.props.toggleSnackbar(true, `There was an error retrieving movies: ${error}`, "error");
                })
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
        moviesData.forEach(movie => { years.add(movie['Year']); })

        if (!this.props.showWatchedMovies) { moviesData = moviesData.filter(movie => !movie.Watched); }

        this.props.saveMovies(moviesData);

        this.setState({ years: [...years].sort((a, b) => b - a), loading: false });
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

    handleOpenAccountMenu = e => { this.setState({ accountMenuAnchorEl: e.currentTarget }); }

    handleCloseAccountMenu = e => { this.setState({ accountMenuAnchorEl: null }); }

    handleFilterChange = e => { this.setState({ [e.target.name]: e.target.value }); };

    handleMovieSearch = () => { this.getMoviesToWatch(this.state.filter, this.state.order, this.state.year, this.state.maxResults); };

    toggleMovieAddModal = () => { this.setState(state => ({ addingMovie: !state.addingMovie })) }

    handleMovieAdd = details => {
        const Year = parseInt(details.Year);
        const { NameEng, NameHeb, imdbID, Comments, Watched } = details;
        const movieToBeAdded = { NameEng, NameHeb, imdbID, Comments, Year, Watched };

        // check if movie already exists in user's list. best performance according to: https://nikitahl.com/how-to-find-an-item-in-a-javascript-array
        for (let i = 0; i < this.props.movies.length; i++) {
            if (this.props.movies[i].imdbID === imdbID) {
                this.props.toggleSnackbar(true, `The movie ${NameEng} is already exists in your list!`, "warning"); return;
            }
        }

        database.ref(`/mymovies/${firebase.auth().currentUser.uid}`).push(movieToBeAdded, (error) => {
            const message = !error
                ? `${movieToBeAdded.NameEng} (${movieToBeAdded.Year}) added successfully`
                : `There was an error adding ${movieToBeAdded.NameEng} (${movieToBeAdded.Year}). ${error}`;
            this.props.toggleSnackbar(true, message, !error ? "success" : "error");
            this.toggleMovieAddModal();
        });
    }

    render() {

        const firebaseUser = firebase.auth().currentUser;
        const { accountMenuAnchorEl } = this.state;
        const isLoggedIn = !!firebaseUser;
        const isAccountMenuOpen = !!accountMenuAnchorEl;
        const years = [...this.state.years].map(year => <MenuItem key={year} value={year}>{year}</MenuItem>);

        let signInOutButton = <MenuItem>
            <Button
                id="signInWithGoogle" className="btnPadding" color="primary" variant="contained" title="Sign in with your Google account"
                onClick={this.handleUserSignIn}><PersonIcon />&nbsp;Sign in</Button>
        </MenuItem>;

        let signInOutAnonymouslyButton = <MenuItem>
            <Button
                className="btnPadding" color="default" variant="contained" title="Sign in anonymously"
                onClick={this.handleUserSignInAnonymously}><PersonOutlineIcon />&nbsp;Login as a guest</Button>
        </MenuItem>;

        if (isLoggedIn) {
            signInOutButton = <MenuItem title="Logout" onClick={this.handleUserSignOut}>
                <Button id="loggedInBtn" className="btnPadding" color="primary" variant="contained">
                    {firebaseUser.isAnonymous
                        ? <><PersonOutlineIcon />&nbsp;&nbsp;Guest</>
                        : <><PersonIcon />&nbsp;{firebaseUser.displayName || firebaseUser.email}</>}
                </Button>
            </MenuItem >;

            if (firebaseUser.isAnonymous) {
                signInOutAnonymouslyButton = <MenuItem title="Link this guest account with your Google account to save your data"
                    onClick={this.handleUserAccountLinking}>
                    <Button className="btnPadding" color="primary" variant="outlined">
                        <CloudUploadIcon />&nbsp;&nbsp;Link with Google
                    </Button>
                </MenuItem>;
            } else {
                signInOutAnonymouslyButton = null;
            }

        }

        return (
            <>
                <IconButton id="accountMenu" color="primary" aria-owns={accountMenuAnchorEl ? 'simple-menu' : undefined} aria-haspopup="true"
                    onClick={this.handleOpenAccountMenu}>
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

                {isLoggedIn && <form>
                    <div className="Menu">
                        <FormControl id="sortByFilter" className="MenuElement" variant="outlined">
                            <StyledInputLabel htmlFor="sortFilter">Sort by</StyledInputLabel>
                            <StyledSelect
                                value={this.state.filter}
                                onChange={this.handleFilterChange}
                                input={<StyledOutlinedInput labelWidth={52} name="filter" id="sortFilter" />}
                                autoWidth >
                                <MenuItem value="releaseYear"><em>Year</em></MenuItem>
                                <MenuItem value="NameEng">English Name</MenuItem>
                                <MenuItem value="NameHeb">Hebrew Name</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        <FormControl id="orderByFilter" className="MenuElement" variant="outlined">
                            <StyledInputLabel htmlFor="orderBy">Order by</StyledInputLabel>
                            <StyledSelect
                                value={this.state.order}
                                onChange={this.handleFilterChange}
                                input={<StyledOutlinedInput labelWidth={60} name="order" id="orderBy" />}
                                autoWidth >
                                <MenuItem value="descending"><em>Descending</em></MenuItem>
                                <MenuItem value="ascending">Ascending</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        <FormControl id="menuYear" className="MenuElement" variant="outlined">
                            <StyledInputLabel htmlFor="showYear">Year</StyledInputLabel>
                            <StyledSelect
                                value={this.state.year}
                                onChange={this.handleFilterChange}
                                input={<StyledOutlinedInput labelWidth={33} name="year" id="showYear" />}
                                autoWidth >
                                <MenuItem value="All"><em>All</em></MenuItem>
                                {years}
                            </StyledSelect>
                        </FormControl>

                        <FormControl id="menuMaxResults" className="MenuElement" variant="outlined">
                            <StyledInputLabel htmlFor="maxResults">Results</StyledInputLabel>
                            <StyledSelect
                                value={this.state.maxResults}
                                onChange={this.handleFilterChange}
                                input={<StyledOutlinedInput labelWidth={54} name="maxResults" id="maxResults" />}
                                autoWidth>
                                <MenuItem value={1000}>All</MenuItem>
                                <MenuItem value={5}><em>5</em></MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={15}>15</MenuItem>
                                <MenuItem value={20}>20</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        <FormControl id="showWatchedMoviesSwitch" className="MenuElement">
                            <ButtonBase>
                                <StyledFormControlLabel
                                    control={<StyledSwitch
                                        name="showWatchedMoviesSwitch"
                                        color="default"
                                        checked={this.props.showWatchedMovies}
                                        onChange={this.props.toggleWatchedMovies}
                                    />}
                                    label="Show watched movies"
                                    labelPlacement="end"
                                />
                            </ButtonBase>
                        </FormControl>

                        <Button className="MenuElement" color="primary" variant="contained" size="small" title="Apply filters" onClick={this.handleMovieSearch}>
                            <MovieFilterIcon />&nbsp;Apply
                        </Button>

                    </div>

                    <Fab id="menuAddMovie" color="primary" variant="extended" size="large" title="Add Movie" onClick={this.toggleMovieAddModal} >
                        <AddIcon />Add Movie
                        </Fab>

                    <MovieAddModal isOpen={this.state.addingMovie} toggle={this.toggleMovieAddModal} addMovie={this.handleMovieAdd} />

                </form>}

                <Snackbar />

            </>

        );

    }

};

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
    saveMovies: (movies) => dispatch({ type: actionTypes.SAVE_MOVIES, payload: movies }),
    toggleWatchedMovies: () => dispatch({ type: actionTypes.TOGGLE_WATCHED_MOVIES }),
    toggleLoadingMovies: (isLoading) => dispatch({ type: actionTypes.TOGGLE_LOADING_MOVIES, payload: isLoading }),
    toggleSnackbar: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } })
})

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);