import React, { PureComponent } from 'react';
import firebase, { database } from '../../config/firebase';

import { connect } from 'react-redux'
import * as actionTypes from '../../store/actions';

import Movie from '../Movie/Movie';
import MovieTrailerModal from '../UI Elements/MovieTrailerModal/MovieTrailerModal';
import MovieCommentsModal from '../UI Elements/MovieCommentsModal/MovieCommentsModal';
import InformationDialog from './InformationDialog/InformationDialog';
import MoviesSpinner from '../UI Elements/Spinners/MoviesSpinner/MoviesSpinner';

import './MoviesContainer.css';

class MoviesContainer extends PureComponent {

    state = {
        showInformationDialog: false, informationDialogTitle: "",
        watchingTrailer: false, searchParams: "",
        editingComments: false, comments: ""
    }

    toggleInformationDialog = () => {
        this.setState(state => ({ showInformationDialog: !state.showInformationDialog }),
            () => setTimeout(() => { this.setState({ showInformationDialog: false }) }, 3000));
    }

    handleInformationDialogTitle = title => { this.setState({ informationDialogTitle: title }, () => { this.toggleInformationDialog(); }); }

    handleMovieDelete = movieID => {
        let movieDetails = "";
        let updatedMovies = [...this.props.movies];

        updatedMovies = updatedMovies.filter(movie => {
            if (movieID === movie.key) {
                movieDetails = `${movie.NameEng} (${movie.Year})`;
                return false;
            }
            return true;
        });

        database.ref(`/mymovies/${firebase.auth().currentUser.uid}/${movieID}`).remove()
            .then(() => {
                this.props.onSnackbarToggle(true, `The movie '${movieDetails}' deleted successfully`, "success");
                this.props.saveMovies(updatedMovies);
            })
            .catch(() => {
                this.props.onSnackbarToggle(true, `Error! There was a problem deleting the movie '${movieDetails}'`, "error");
            })
    }

    toggleWatchTrailer = (searchParams = "") => { this.setState(state => ({ searchParams, watchingTrailer: !state.watchingTrailer })); };

    toggleEditComments = (comments = "", userID = "", dbMovieID = "") => {
        this.setState(state => ({ comments, userID, dbMovieID, editingComments: !state.editingComments }))
    };

    handleEditComments = comments => {
        database.ref(`/mymovies/${this.state.userID}/${this.state.dbMovieID}`).update({ Comments: comments }, (error) => {
            const message = !error
                ? "Personal note saved successfully"
                : "There was an error saving the note";
            this.setState({ comments: comments, editingComments: false },
                () => { this.props.onSnackbarToggle(true, message, !error ? "information" : "error"); });
        });
    }

    render() {

        const { showInformationDialog, informationDialogTitle } = this.state;
        let moviesContainer = null;
        let loggedOutMessage = null;
        const firebaseUser = firebase.auth().currentUser;
        const isLoggedIn = !!firebaseUser;
        const dbMovies = this.props.movies || [];
        const { loadingMovies } = this.props;

        if (isLoggedIn) {
            const movies = dbMovies.map(movie => (
                <Movie
                    key={movie['key']}
                    dbMovieID={movie['key']}
                    imdbID={movie['imdbID'] || null}
                    NameHeb={movie['NameHeb']}
                    NameEng={movie['NameEng']}
                    Year={movie['Year']}
                    comments={movie['Comments']}
                    watched={movie['Watched']}
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

        } else {
            loggedOutMessage = <><br />
                <h3 className="noResultsH3">Please login to edit your list</h3>
                <h4 className="noResultsH4">(You can login as a guest)</h4>
            </>
        }

        return (
            <div>

                {loggedOutMessage}

                {moviesContainer}

                {/* <InformationDialog
                    isOpen={showInformationDialog}
                    toggle={this.toggleInformationDialog}
                    dialogTitle={informationDialogTitle} /> */}

                <MovieTrailerModal
                    isOpen={this.state.watchingTrailer}
                    toggle={this.toggleWatchTrailer}
                    searchParams={this.state.searchParams} />

                <MovieCommentsModal
                    isOpen={this.state.editingComments}
                    toggle={this.toggleEditComments}
                    comments={this.state.comments}
                    handleEditComments={this.handleEditComments} />

            </div >
        );

    }

}

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
    onSnackbarToggle: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } }),
    saveMovies: (movies) => dispatch({ type: actionTypes.SAVE_MOVIES, payload: movies }),
})

export default connect(mapStateToProps, mapDispatchToProps)(MoviesContainer);