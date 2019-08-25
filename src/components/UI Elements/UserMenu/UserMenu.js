import React, { Component } from 'react';
import firebase, { database } from '../../../config/firebase';

import { connect } from 'react-redux';
import * as actionTypes from '../../../store/actions';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MovieFilterIcon from '@material-ui/icons/MovieFilter';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Button from '@material-ui/core/Button';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutlined';
import LinkIcon from '@material-ui/icons/Link';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Tooltip from '@material-ui/core/Tooltip';
import Fade from '@material-ui/core/Fade';
import Zoom from '@material-ui/core/Zoom';

import { withStyles } from '@material-ui/core/styles';
import './UserMenu.css';

const StyledInputLabel = withStyles({ root: { color: 'inherit !important', '&:focus': { color: 'inherit !important' } } })(InputLabel);
const StyledSelect = withStyles({ icon: { color: 'inherit' } })(Select);
const StyledOutlinedInput = withStyles({ input: { padding: '18.5px 35px 18.5px 12px' }, notchedOutline: { borderColor: '#ffffffbf !important', '&:focus': { borderColor: 'white !important' }, } })(OutlinedInput);
const StyledTooltip = withStyles({
    tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' },
    tooltipPlacementBottom: { marginTop: '5px' }
})(Tooltip);

class UserMenu extends Component {

    state = {
        filter: "releaseYear",
        order: "descending",
        year: "All",
        maxResults: 10,
        googleAuthProvider: new firebase.auth.GoogleAuthProvider(),
        accountMenuAnchorEl: null
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
                this.props.onSnackbarToggle(true, `Hi ${result.additionalUserInfo.profile.name}, you are now logged in.`, "information");
                this.handleCloseAccountMenu();
            })
            .catch((error) => { this.props.onSnackbarToggle(true, `Sign in error: ${error}`, "error"); }); // Sign-in failed.
    }

    handleUserSignInAnonymously = () => {
        firebase.auth().signInAnonymously()
            .then((result) => { // Sign-in anonymously successfully.
                this.props.onSnackbarToggle(true, `Hi, you are now logged in as a guest user.`, "information");
                this.handleCloseAccountMenu();
            })
            .catch((error) => { this.props.onSnackbarToggle(true, `Error! cannot sign in as a guest user.`, "error"); }); // Sign-in anonymously failed.
    }

    handleUserAccountLinking = () => {
        firebase.auth().currentUser.linkWithPopup(this.state.googleAuthProvider)
            .then((result) => { // Accounts linking succeeded.
                this.props.onSnackbarToggle(true, `You guest account was successfully linked with your Google account '${result.user.email}'.`, "information");
                this.handleCloseAccountMenu();
            })
            .catch((error) => { this.props.onSnackbarToggle(true, `Error! Cannot link with Google account '${error.email}' because you've probably used it before. Try to login this Google account.`, "error"); }); // Accounts linking failed.
    }

    handleUserSignOut = () => {
        const relevantAccountMessage = firebase.auth().currentUser.isAnonymous
            ? "guest account ?\nPlease pay attention that you your data will be lost! You can link it to your Google account to save it."
            : `account '${firebase.auth().currentUser.email}' ?`;
        if (window.confirm(`Are you sure you want to logout from your ${relevantAccountMessage} `)) {
            firebase.auth().signOut()
                .then((result) => { // Sign-out successfully.
                    this.props.onSnackbarToggle(true, "You are now logged out", "information");
                    this.handleCloseAccountMenu();
                })
                .catch((error) => { this.props.onSnackbarToggle(true, `Sign out error: ${error}`, "error"); }); // Sign-out failed.
        }
    }

    getMoviesToWatch = (filter = "releaseYear", order = "descending", year = "All", maxResults = this.state.maxResults) => {
        this.props.toggleLoadingMovies(true);
        const filterToShow = filter === "releaseYear" ? "Year" : filter;

        this.setState({ maxResults: maxResults }, () => {
            const userID = firebase.auth().currentUser.uid;
            let moviesDBRef = database.ref(`/mymovies/${userID}/movies`);
            let moviesYearsDBRef = database.ref(`/mymovies/${userID}/years`);

            if (year === "All") {
                moviesDBRef = order === "descending"
                    ? moviesDBRef.orderByChild(filterToShow).limitToLast(this.state.maxResults)
                    : moviesDBRef.orderByChild(filterToShow).limitToFirst(this.state.maxResults)
            } else {
                moviesDBRef = moviesDBRef.orderByChild("Year").limitToFirst(this.state.maxResults).equalTo(parseInt(year))
            }

            moviesDBRef.on('value',
                response => { this.handleFirebaseData(response, filterToShow, order, year); },
                error => {
                    this.props.toggleLoadingMovies(false);
                    firebase.auth().currentUser && this.props.onSnackbarToggle(true, `There was an error retrieving movies: ${error}`, "error");
                })

            moviesYearsDBRef.on('value',
                response => {
                    const years = response.val() ? new Set([...response.val()]) : [];
                    this.props.saveMoviesYears([...years].sort((a, b) => b - a));
                },
                error => { console.log('[moviesYearsDBRef] error: ', error); })

            database.ref(`/mymovies/${userID}/counter`).on('value',
                response => { this.props.onMoviesCounterChange(response.val()); },
                error => { console.log('error: ', error); })
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
        this.props.saveMovies(sortedMovies);
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

    handleFilterChange = e => { this.setState({ [e.target.name]: e.target.value }); }

    handleApplyFilters = () => { this.getMoviesToWatch(this.state.filter, this.state.order, this.state.year, this.state.maxResults); }

    render() {
        const firebaseUser = firebase.auth().currentUser;
        const { accountMenuAnchorEl } = this.state;
        const isLoggedIn = !!firebaseUser;
        const isAccountMenuOpen = !!accountMenuAnchorEl;
        const years = this.props.moviesYears.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>);

        let signInOutButton = <MenuItem>
            <Button
                id="signInWithGoogle" className="btnPadding" color="primary" variant="contained" title="Sign in with your Google account"
                onClick={this.handleUserSignIn}><PersonIcon />&nbsp;Sign in</Button>
        </MenuItem>;

        let signInOutAnonymouslyButton = <MenuItem>
            <StyledTooltip title="Sign in anonymously" TransitionComponent={Zoom}>
                <Button className="btnPadding" color="default" variant="contained" onClick={this.handleUserSignInAnonymously}>
                    <PersonOutlineIcon />&nbsp;Login as a guest
                </Button>
            </StyledTooltip>
        </MenuItem>;

        if (isLoggedIn) {
            signInOutButton = <MenuItem title="Logout" onClick={this.handleUserSignOut}>
                <Button id="loggedInBtn" className="btnPadding" color="primary" variant="contained">
                    {firebaseUser.isAnonymous
                        ? <><PersonOutlineIcon />&nbsp;Logout from Guest</>
                        : <><PersonIcon />&nbsp;Logout from {firebaseUser.displayName || firebaseUser.email}</>}
                </Button>
            </MenuItem >;

            if (firebaseUser.isAnonymous) {
                signInOutAnonymouslyButton = <MenuItem>
                    <StyledTooltip title="Link this guest account with your Google account to save your data" TransitionComponent={Zoom}>
                        <Button className="btnPadding" color="primary" variant="contained" onClick={this.handleUserAccountLinking}>
                            <LinkIcon />&nbsp;Link with Google
                        </Button>
                    </StyledTooltip>
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
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={10}><em>10</em></MenuItem>
                                <MenuItem value={15}>15</MenuItem>
                                <MenuItem value={20}>20</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                            </StyledSelect>
                        </FormControl>

                        <Button id="applyBtn" className="MenuElement" color="primary" variant="contained" size="small" title="Apply filters" onClick={this.handleApplyFilters}>
                            <MovieFilterIcon />&nbsp;Apply
                        </Button>

                    </div>

                </form>}

            </>

        );

    }

};

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
    saveMovies: (movies) => dispatch({ type: actionTypes.SAVE_MOVIES, payload: movies }),
    saveMoviesYears: (moviesYears) => dispatch({ type: actionTypes.SAVE_MOVIES_YEARS, payload: moviesYears }),
    toggleWatchedMovies: () => dispatch({ type: actionTypes.TOGGLE_WATCHED_MOVIES }),
    toggleLoadingMovies: (isLoading) => dispatch({ type: actionTypes.TOGGLE_LOADING_MOVIES, payload: isLoading }),
    onSnackbarToggle: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } }),
    onMoviesCounterChange: (updatedCounter) => dispatch({ type: actionTypes.ON_MOVIES_COUNTER_CHANGE, payload: updatedCounter })
});

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);