import React, { PureComponent } from 'react';

import { connect } from 'react-redux'
import * as actionTypes from '../../store/actions';

import MoviesService from '../../Services/MoviesService';
import AccountsService from '../../Services/AccountsService';
import AnalyticsService from '../../Services/AnalyticsService';

import { debounce } from '../../utils/common';
import { getShortURL } from '../../utils/urlShortener';

import Movie from '../../components/Movie/Movie';
import MovieAddModal from '../../components/UI Elements/MovieAddModal/MovieAddModal';
import MovieTrailerModal from '../../components/UI Elements/MovieTrailerModal/MovieTrailerModal';
import MovieCommentsModal from '../../components/UI Elements/MovieCommentsModal/MovieCommentsModal';
import MoviesSpinner from '../../components/UI Elements/Spinners/MoviesSpinner';
import MoviesCounter from '../../components/UI Elements/MoviesCounter/MoviesCounter';
// import InformationModal from '../UI Elements/InformationModal/InformationModal';

import { TextField, InputAdornment, Tooltip, IconButton, Fab, Zoom } from '@material-ui/core';
import { Search as SearchIcon, Add as AddIcon, Share as ShareIcon, } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const StyledIconButton = withStyles({ root: { color: 'inherit' } })(IconButton);
const StyledTooltip = withStyles({ tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' }, tooltipPlacementBottom: { marginTop: '0px' } })(Tooltip);

class MoviesContainer extends PureComponent {

    state = {
        showInformationModal: false, informationModalTitle: "", freeSearch: "",
        watchingTrailer: false, searchTrailerParams: "", searchID: "",
        editingComments: false, comments: "",
        addingMovie: false
    }

    componentDidUpdate(prevProps) {
        if (this.props.watchingList !== prevProps.watchingList && this.props.watchingList) {
            this.handleQueryMovies();
            AnalyticsService({
                category: 'User',
                action: 'Viewing another user list'
            });
        }
    }

    handleQueryMovies = () => {
        const paramsString = window.location.search;
        const searchParams = new URLSearchParams(paramsString);
        if (searchParams.has("imdbIDs")) {
            const imdbIDsString = searchParams.get("imdbIDs");
            const imdbIDsArr = imdbIDsString.split(",");
            const moviesArr = imdbIDsArr.map(imdbID => ({ imdbID: imdbID, NameEng: "" }))
            this.props.saveMovies(moviesArr);
        }
    }

    handleDeleteMovie = async (movieID, imdbID, movieName, movieYear, isMovieWatched) => {
        try {
            const shouldDeleteYear = await MoviesService.ShouldDeleteYear(imdbID, movieYear);
            MoviesService.DeleteMovie(movieID)
                .then(() => {
                    if (shouldDeleteYear) { this.handleDeleteYear(movieYear); } // there is another movie with the same year
                    const properties = ["total"];
                    if (!isMovieWatched) { properties.push("unwatched"); }
                    this.handleUpdateCounter(properties, "Delete Movie");
                    this.props.onSnackbarToggle(true, `The movie '${movieName} (${movieYear})' deleted successfully`, "success");
                })
                .catch(() => { this.props.onSnackbarToggle(true, `Error! There was a problem deleting the movie '${movieName} (${movieYear})'`, "error"); })
        } catch (error) { this.props.onSnackbarToggle(true, `Error! There was a problem deleting the movie '${movieName} (${movieYear})'`, "error"); }
        AnalyticsService({
            category: 'Movie',
            action: 'Deleting a movie'
        });
    }

    handleDeleteYear = yearToDelete => {
        const years = this.props.moviesYears.filter(year => year !== yearToDelete);
        MoviesService.UpdateYears(years)
            .then((res) => { })
            .catch((error) => { })
    }

    handleAddMovie = async (movie) => {
        const { NameEng, imdbID, Year } = movie;

        try {
            const isMovieExists = await MoviesService.IsMovieAlreadyExists(imdbID);
            if (isMovieExists) { this.props.onSnackbarToggle(true, `The movie '${NameEng}' already exists in your list!`, "warning"); return; }
        } catch (error) { this.props.onSnackbarToggle(true, `There was an error adding '${NameEng} (${Year})'.`, "error"); }

        MoviesService.AddMovie(movie)
            .then((res) => {
                this.props.onSnackbarToggle(true, `The movie '${NameEng} (${Year})' added successfully`, "success");
                this.toggleAddMovie();
                this.handleAddYear(Year);
                this.handleUpdateCounter(["total", "unwatched"], "Add Movie");
            })
            .catch((error) => { this.props.onSnackbarToggle(true, `There was an error adding '${NameEng} (${Year})'`, "error"); })
        AnalyticsService({
            category: 'Movie',
            action: 'Adding a movie'
        });
    }

    handleAddYear = year => {
        MoviesService.UpdateYears(new Set([...this.props.moviesYears, year]))
            .then((res) => { })
            .catch((error) => { })
    }

    handleUpdateCounter = (properties, type) => {
        MoviesService.UpdateCounter(this.props.moviesCounter, properties, type)
            .then((res) => { })
            .catch((error) => { })
    }

    handleEditComments = comments => {
        MoviesService.UpdateMovie(this.state.dbMovieID, "Comments", comments)
            .then((res) => { this.setState({ comments: comments, editingComments: false }, () => { this.props.onSnackbarToggle(true, "Personal note saved successfully", "information"); }) })
            .catch((error) => { this.setState({ comments: comments, editingComments: false }, () => { this.props.onSnackbarToggle(true, "There was an error saving your personal note", "error"); }) })
    }

    toggleAddMovie = () => { this.setState(state => ({ addingMovie: !state.addingMovie })) };

    toggleWatchTrailer = (searchTrailerParams = "", searchID = "") => { this.setState(state => ({ searchTrailerParams, searchID, watchingTrailer: !state.watchingTrailer })); };

    toggleEditComments = (dbMovieID = "", comments = "") => { this.setState(state => ({ comments, dbMovieID, editingComments: !state.editingComments })) };

    handleInformationModalTitle = title => { this.setState({ informationModalTitle: title }, () => { this.toggleInformationModal(); }); }

    toggleInformationModal = () => { this.setState(state => ({ showInformationModal: !state.showInformationModal }), () => { setTimeout(() => { this.setState({ showInformationModal: false }) }, 3000) }); }

    shareList = async (userInfo, movies) => {
        const url = `https://movies-watch-list.netlify.app/?watchingList=true&user=${userInfo.replace(/\s/g, "+")}&imdbIDs=${movies.map(movie => movie.imdbID).join()}`;
        try {
            const shortURL = await getShortURL(url);
            navigator.clipboard.writeText(shortURL)
                .then(
                    () => { alert("Your list's sharable link was copied to clipboard. Just paste it wherever you need."); },
                    () => { throw new Error(); }
                )
        } catch (error) { window.prompt("Please copy your list's sharable link and paste it wherever you need:", url); }
    }

    handleFreeSearchChange = ({ target: { value } }) => {
        this.setState({ freeSearch: value });
        this.applyFreeSearchFilter(value);
    }

    applyFreeSearchFilter = debounce(value => {
        this.props.onFreeSearch(value);
    }, 250);

    render() {
        // const { showInformationModal, informationModalTitle } = this.state;
        let moviesContainer = null;
        let loggedOutMessage = null;
        let counter = null;
        let freeSearch = null;
        let addMovieBtn = null;
        let shareListBtn = null;
        const { addingMovie, watchingTrailer, searchID, searchTrailerParams, comments, editingComments, } = this.state;
        const { loadingMovies, movies: dbMovies = [], moviesCounter, filters, freeSearchFilter, watchingList, watchingListUserInfo } = this.props;

        if (!watchingList) {
            const loggedInUser = AccountsService.GetLoggedInUser();
            if (loggedInUser) {
                let loggedInUserInfo = "";
                const unseenCounter = moviesCounter.unwatched;
                const watchedCounter = moviesCounter.total - moviesCounter.unwatched;
                counter = <MoviesCounter unseenCounter={unseenCounter} watchedCounter={watchedCounter} />;

                freeSearch = <TextField
                    className="MenuElementMg freeSearch"
                    name="freeSearch" margin="normal"
                    label="Filter search results"
                    placeholder="Enter movie name"
                    value={this.state.freeSearch}
                    InputProps={{
                        type: "text",
                        startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)
                    }}
                    InputLabelProps={{ style: { color: 'inherit' } }}
                    onChange={this.handleFreeSearchChange} />;

                addMovieBtn = <div id="addMovieBtn">
                    <Fab color="primary" variant="extended" size="large" onClick={this.toggleAddMovie}>
                        <AddIcon />Add Movie
                    </Fab>
                </div>;

                const movies = dbMovies
                    .filter(movie => (
                        movie.NameEng.toLowerCase().includes(freeSearchFilter.trim().toLowerCase()) ||
                        movie.NameHeb.includes(freeSearchFilter.trim())
                    ))
                    .map(movie => (
                        <Movie
                            key={movie['key'] || movie['imdbID']}
                            dbMovieID={movie['key']}
                            {...movie}
                            imdbID={movie['imdbID'] || null}
                            delete={this.handleDeleteMovie}
                            toggleWatchTrailer={this.toggleWatchTrailer}
                            toggleEditComments={this.toggleEditComments}
                            watchingList={watchingList} />
                    ));

                moviesContainer = !loadingMovies
                    ? moviesContainer = movies.length === 0
                        ? <>
                            <h3 className="informationH3">No results</h3>
                            <h4 className="informationH4">Add a movie or change list filters</h4>
                        </>
                        : <div className="MoviesContainer">{movies}</div>
                    : <MoviesSpinner />;
                loggedInUserInfo = !loggedInUser.isAnonymous ? loggedInUser.displayName || loggedInUser.email : "a guest";
                shareListBtn = !loadingMovies && movies.length !== 0 && <StyledTooltip title="Share this list" disableFocusListener disableTouchListener TransitionComponent={Zoom}>
                    <StyledIconButton onClick={() => this.shareList(loggedInUserInfo, dbMovies)}>
                        <ShareIcon />
                    </StyledIconButton>
                </StyledTooltip>
            } else {
                loggedOutMessage = <>
                    <h3 className="informationH3">Welcome!</h3><br />
                    <h4 className="informationH4">Sign in to start editing your movie watch list</h4>
                    <h4 className="informationH4">* You can use your Google account or a guest account</h4>
                </>;
            }
        } else {
            const movies = dbMovies
                .map(movie => (
                    <Movie
                        key={movie['imdbID']}
                        dbMovieID={movie['imdbID']}
                        {...movie}
                        imdbID={movie['imdbID'] || null}
                        toggleWatchTrailer={this.toggleWatchTrailer}
                        watchingList={watchingList} />
                ));
            moviesContainer = movies.length === 0
                ? <h4 className="informationH4">The list is empty. Ask the owner for an updated link.</h4>
                : <div className="MoviesContainer">{movies}</div>;
        }

        return (
            <div>

                {loggedOutMessage}

                {dbMovies.length > 0 && filters.year === "All" && filters.maxResults === 1000 && !loadingMovies && freeSearch}

                {counter}

                {addMovieBtn}

                {shareListBtn}

                {watchingListUserInfo && <h3 className="informationH3">You are watching {watchingListUserInfo}'s list</h3>}

                {moviesContainer}

                <MovieAddModal
                    isOpen={addingMovie}
                    toggle={this.toggleAddMovie}
                    addMovie={this.handleAddMovie} />

                <MovieTrailerModal
                    isOpen={watchingTrailer}
                    toggle={this.toggleWatchTrailer}
                    searchID={searchID}
                    searchParams={searchTrailerParams} />

                <MovieCommentsModal
                    isOpen={editingComments}
                    toggle={this.toggleEditComments}
                    comments={comments}
                    handleEditComments={this.handleEditComments} />

                {/* <InformationModal
                        isOpen={showInformationModal}
                        toggle={this.toggleInformationModal}
                        title={informationModalTitle} /> */}

            </div>
        );

    }

}

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
    saveMovies: (movies) => dispatch({ type: actionTypes.SAVE_MOVIES, payload: movies }),
    onSnackbarToggle: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } }),
    onFreeSearch: (value) => dispatch({ type: actionTypes.ON_FREE_SEARCH_FILTER_CHANGE, payload: value })
});

export default connect(mapStateToProps, mapDispatchToProps)(MoviesContainer);