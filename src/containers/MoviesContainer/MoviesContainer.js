import React, { PureComponent } from 'react';
import firebase, { database } from '../../config/firebase';

import { connect } from 'react-redux'
import * as actionTypes from '../../store/actions';

import Movie from '../../components/Movie/Movie';

import MovieAddModal from '../../components/UI Elements/MovieAddModal/MovieAddModal';
import MovieTrailerModal from '../../components/UI Elements/MovieTrailerModal/MovieTrailerModal';
import MovieCommentsModal from '../../components/UI Elements/MovieCommentsModal/MovieCommentsModal';
import MoviesSpinner from '../../components/UI Elements/Spinners/MoviesSpinner/MoviesSpinner';
// import InformationModal from '../UI Elements/InformationModal/InformationModal';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import FormControl from '@material-ui/core/FormControl';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import Checkbox from '@material-ui/core/Checkbox';
import RemoveRedEye from '@material-ui/icons/RemoveRedEye';
import RemoveRedEyeOutlined from '@material-ui/icons/RemoveRedEyeOutlined';
import Badge from '@material-ui/core/Badge';
import Zoom from '@material-ui/core/Zoom';
import AddIcon from '@material-ui/icons/Add';

import { withStyles } from '@material-ui/core/styles';
import './MoviesContainer.css';

const StyledIconButton = withStyles({ root: { color: 'white' } })(IconButton);
const StyledTooltip = withStyles({
    tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' },
    tooltipPlacementBottom: { marginTop: '0px' }
})(Tooltip);

class MoviesContainer extends PureComponent {

    state = {
        showInformationModal: false, informationModalTitle: "",
        watchingTrailer: false, searchTrailerParams: "", searchID: "",
        editingComments: false, comments: "",
        addingMovie: false
    }

    handleMovieDelete = (movieID, movieYear) => {
        let movieName = "";
        let isMovieWatched;
        let shouldDeleteYear = true;

        this.props.movies.filter(movie => {
            if (movieID === movie.key) {
                movieName = movie.NameEng;
                isMovieWatched = movie.Watched;
                return false;
            } else { // there is another movie with the same year
                if (movieYear === movie.Year) { shouldDeleteYear = false; }
            }
            return true;
        });

        if (movieName) { // movie found in props movies list
            database.ref(`/mymovies/${firebase.auth().currentUser.uid}/movies/${movieID}`).remove()
                .then(() => {
                    if (shouldDeleteYear) { this.handleYearDelete(movieYear); }
                    const counterNames = ["total"];
                    if (!isMovieWatched) { counterNames.push("unwatched"); }
                    this.handleCounterChange(counterNames, "Delete Movie");
                    this.props.onSnackbarToggle(true, `The movie '${movieName} (${movieYear})' deleted successfully`, "success");
                })
                .catch(() => { this.props.onSnackbarToggle(true, `Error! There was a problem deleting the movie '${movieName} (${movieYear})'`, "error"); })
        } else { this.props.onSnackbarToggle(true, `Error! There was a problem deleting the movie '${movieName} (${movieYear})'`, "error"); }
    }

    handleYearDelete = yearToDelete => {
        const years = this.props.moviesYears.filter(year => year !== yearToDelete);
        database.ref(`/mymovies/${firebase.auth().currentUser.uid}/years`).set([...years], (error) => {
            if (!error) { }
            else { console.log('error: ', error); }
        });
    }

    handleCounterChange = (names, type) => {
        const updatedCounter = { ...this.props.moviesCounter };
        switch (type) {
            case "Add Movie":
                names.forEach(name => { updatedCounter[name]++; })
                database.ref(`/mymovies/${firebase.auth().currentUser.uid}/counter`).set(updatedCounter, (error) => {
                    if (!error) { }
                    else { console.log('error: ', error); }
                });
                break;
            case "Delete Movie":
                names.forEach(name => { updatedCounter[name]--; })
                database.ref(`/mymovies/${firebase.auth().currentUser.uid}/counter`).set(updatedCounter, (error) => {
                    if (!error) { }
                    else { console.log('error: ', error); }
                });
                break;
            default: break;
        }
    }

    handleMovieAdd = async (details) => {
        const Year = parseInt(details.Year);
        const { NameEng, NameHeb, imdbID, Comments, Watched } = details;
        const movieToBeAdded = { NameEng, NameHeb, imdbID, Comments, Year, Watched };

        const isMovieExistsResponse = await this.isMovieAlreadyExists(imdbID);
        if (isMovieExistsResponse) {
            isMovieExistsResponse !== "error"
                ? this.props.onSnackbarToggle(true, `The movie '${NameEng}' already exists in your list!`, "warning")
                : this.props.onSnackbarToggle(true, `There was an error adding '${NameEng} (${Year})'.`, "error");
            return;
        }

        database.ref(`/mymovies/${firebase.auth().currentUser.uid}/movies`).push(movieToBeAdded, (error) => {
            if (!error) {
                this.props.onSnackbarToggle(true, `The movie '${NameEng} (${Year})' added successfully`, "success");
                this.toggleAddMovie();
                this.handleYearAdd(Year);
                this.handleCounterChange(["total", "unwatched"], "Add Movie");
            } else {
                this.props.onSnackbarToggle(true, `There was an error adding '${NameEng} (${Year})'`, "error");
            }
        });
    }

    isMovieAlreadyExists = imdbID => {
        return new Promise((resolve, reject) => {
            database.ref(`/mymovies/${firebase.auth().currentUser.uid}/movies`).orderByChild("imdbID").equalTo(imdbID).once('value',
                response => { resolve(!!response.val()); },
                error => { resolve("error"); })
        })
    }

    handleYearAdd = year => {
        const years = new Set([...this.props.moviesYears, year]);
        database.ref(`/mymovies/${firebase.auth().currentUser.uid}/years`).set([...years], (error) => {
            if (!error) { }
            else { console.log('error: ', error); }
        });
    }

    toggleAddMovie = () => { this.setState(state => ({ addingMovie: !state.addingMovie })) };

    toggleWatchTrailer = (searchTrailerParams = "", searchID = "") => { this.setState(state => ({ searchTrailerParams, searchID, watchingTrailer: !state.watchingTrailer })); };

    handleEditComments = comments => {
        database.ref(`/mymovies/${this.state.userID}/movies/${this.state.dbMovieID}`).update({ Comments: comments }, (error) => {
            const message = !error
                ? "Personal note saved successfully"
                : "There was an error saving the note";
            this.setState({ comments: comments, editingComments: false },
                () => { this.props.onSnackbarToggle(true, message, !error ? "information" : "error"); });
        });
    }

    toggleEditComments = (comments = "", userID = "", dbMovieID = "") => { this.setState(state => ({ comments, userID, dbMovieID, editingComments: !state.editingComments })) };

    handleInformationModalTitle = title => { this.setState({ informationModalTitle: title }, () => { this.toggleInformationModal(); }); }

    toggleInformationModal = () => {
        this.setState(state => ({ showInformationModal: !state.showInformationModal }),
            () => setTimeout(() => { this.setState({ showInformationModal: false }) }, 3000));
    }

    render() {
        // const { showInformationModal, informationModalTitle } = this.state;
        let moviesContainer = null;
        let loggedOutMessage = null;
        let counter = null;
        let addMovieBtn = null;
        const firebaseUser = firebase.auth().currentUser;
        const isLoggedIn = !!firebaseUser;
        const dbMovies = this.props.movies || [];
        const { loadingMovies, moviesCounter, showWatchedMovies } = this.props;

        if (isLoggedIn) {
            const movies = dbMovies
                .filter(movie => movie.NameEng.toLowerCase().includes(this.props.freeSearchFilter.toLowerCase())
                    && movie.Watched === this.props.showWatchedMovies)
                .map(movie => (
                    <Movie
                        key={movie['key']}
                        dbMovieID={movie['key']}
                        {...movie}
                        imdbID={movie['imdbID'] || null}
                        userID={firebase.auth().currentUser.uid}
                        userEmail={firebase.auth().currentUser.email}
                        delete={this.handleMovieDelete}
                        toggleWatchTrailer={this.toggleWatchTrailer}
                        toggleEditComments={this.toggleEditComments} />
                ));

            moviesContainer = !loadingMovies
                ? moviesContainer = dbMovies.length === 0
                    ? <>
                        <h3 className="noResultsH3">No results</h3>
                        <h4 className="noResultsH4">Add a movie or change list filters</h4>
                    </>
                    : <div className="MoviesContainer">{movies}</div>
                : <MoviesSpinner />;


            addMovieBtn = <Fab id="menuAddMovie" color="primary" variant="extended" size="large" onClick={this.toggleAddMovie} >
                <AddIcon />Add Movie
            </Fab>


            counter = <FormControl>
                <StyledTooltip title={`${showWatchedMovies ? 'Watched' : 'Unwatched'} movies`} disableFocusListener disableTouchListener TransitionComponent={Zoom}>
                    <Checkbox
                        checked={showWatchedMovies}
                        icon={<StyledIconButton>
                            <Badge badgeContent={moviesCounter.unwatched} color="secondary">
                                <RemoveRedEyeOutlined fontSize="large" />
                            </Badge>
                        </StyledIconButton>}
                        checkedIcon={<StyledIconButton>
                            <Badge badgeContent={moviesCounter.total - moviesCounter.unwatched} color="secondary">
                                <RemoveRedEye fontSize="large" />
                            </Badge>
                        </StyledIconButton>}
                        onChange={this.props.toggleWatchedMovies} />
                </StyledTooltip>
            </FormControl>

        } else {
            loggedOutMessage = <><br />
                <h3 className="noResultsH3">Please login to edit your list</h3>
                <h4 className="noResultsH4">(You can login as a guest)</h4>
            </>
        }

        return (
            <div>

                {loggedOutMessage}

                {addMovieBtn}

                {counter}

                {isLoggedIn && this.props.movies.length > 0 && <TextField
                    className="MenuElement freeSearch"
                    name="freeSearch" margin="normal"
                    label="Filter search results"
                    placeholder="Enter movie name"
                    value={this.props.freeSearchFilter}
                    InputProps={{
                        type: "text",
                        startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)
                    }}
                    InputLabelProps={{ style: { color: 'inherit' } }}
                    onChange={(e) => { this.props.onFreeSearch(e.target.value); }}
                />}

                {moviesContainer}

                <MovieAddModal
                    isOpen={this.state.addingMovie}
                    toggle={this.toggleAddMovie}
                    addMovie={this.handleMovieAdd} />


                <MovieTrailerModal
                    isOpen={this.state.watchingTrailer}
                    toggle={this.toggleWatchTrailer}
                    searchParams={this.state.searchTrailerParams}
                    searchID={this.state.searchID} />

                <MovieCommentsModal
                    isOpen={this.state.editingComments}
                    toggle={this.toggleEditComments}
                    comments={this.state.comments}
                    handleEditComments={this.handleEditComments} />

                {/* <InformationModal
                        isOpen={showInformationModal}
                        toggle={this.toggleInformationModal}
                        title={informationModalTitle} /> */}

            </div >
        );

    }

}

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
    onSnackbarToggle: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } }),
    onFreeSearch: (value) => dispatch({ type: actionTypes.ON_FREE_SEARCH_FILTER_CHANGE, payload: value }),
    toggleWatchedMovies: () => dispatch({ type: actionTypes.TOGGLE_WATCHED_MOVIES })
});

export default connect(mapStateToProps, mapDispatchToProps)(MoviesContainer);