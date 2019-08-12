import React, { PureComponent } from 'react';
import firebase, { database } from '../../config/firebase';

import { connect } from 'react-redux'
import * as actionTypes from '../../store/actions';

import Movie from '../Movie/Movie';
import InformationDialog from './InformationDialog/InformationDialog';
import MoviesSpinner from '../UI Elements/Spinners/MoviesSpinner/MoviesSpinner';

import './MoviesContainer.css';

class MoviesContainer extends PureComponent {

    state = {
        showInformationDialog: false,
        informationDialogTitle: "",
    }

    toggleInformationDialog = () => {
        this.setState(state => ({ showInformationDialog: !state.showInformationDialog }),
            () => setTimeout(() => { this.setState({ showInformationDialog: false }) }, 3000));
    }

    handleInformationDialogTitle = title => { this.setState({ informationDialogTitle: title }, () => { this.toggleInformationDialog(); }); }

    handleMovieDelete = movieID => {
        let deletedMovieDetails = "";
        let updatedMovies = [...this.props.movies];

        updatedMovies = updatedMovies.filter(movie => {
            if (movieID === movie.key) {
                deletedMovieDetails = `${movie.NameEng} (${movie.Year})`;
                return false;
            }
            return true;
        });

        database.ref(`/mymovies/${firebase.auth().currentUser.uid}/${movieID}`).remove()
            .then(() => {
                this.props.onSnackbarToggle(true, `'${deletedMovieDetails}' deleted successfully`, "success");
                this.props.saveMovies(updatedMovies);
            })
            .catch(() => {
                this.props.onSnackbarToggle(true, `Error! Cannot delete '${deletedMovieDetails}'`, "error");
            })
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
                    nameHeb={movie['NameHeb']}
                    nameEng={movie['NameEng']}
                    Year={movie['Year']}
                    userID={firebase.auth().currentUser.uid}
                    userEmail={firebase.auth().currentUser.email}
                    comments={movie['Comments']}
                    watched={movie['Watched']}
                    delete={this.handleMovieDelete} />
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