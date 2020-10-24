import React, { PureComponent } from 'react';

import { connect } from 'react-redux';
import { saveMovies, toggleSnackbar } from '../../store/actions';

import MoviesService from '../../Services/MoviesService';
import AnalyticsService from '../../Services/AnalyticsService';

import { getShortURL } from '../../utils/urlShortener';

import Movie from '../../components/Movie/Movie';
import MovieAddModal from '../../components/UI Elements/MovieAddModal/MovieAddModal';
import MovieTrailerModal from '../../components/UI Elements/MovieTrailerModal/MovieTrailerModal';
import MovieCommentsModal from '../../components/UI Elements/MovieCommentsModal/MovieCommentsModal';
import MoviesSpinner from '../../components/UI Elements/Spinners/MoviesSpinner';
import MoviesCounter from '../../components/UI Elements/MoviesCounter/MoviesCounter';
// import InformationModal from '../UI Elements/InformationModal/InformationModal';

import { TextField, InputAdornment, Tooltip, IconButton, Fab, Zoom } from '@material-ui/core';
import { Search as SearchIcon, Add as AddIcon, Share as ShareIcon } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const StyledIconButton = withStyles({ root: { color: 'inherit' } })(IconButton);
const StyledTooltip = withStyles({
    tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' },
    tooltipPlacementBottom: { marginTop: '0px' },
    arrow: { color: 'black' },
})(Tooltip);

class MoviesContainer extends PureComponent {
    constructor(props) {
        super(props);

        this.handleQueryMovies();

        this.state = {
            showInformationModal: false,
            informationModalTitle: '',
            freeSearchFilter: '',
            watchingTrailer: false,
            searchTrailerParams: '',
            searchID: '',
            editingComments: false,
            comments: '',
            addingMovie: false,
            moviesData: {},
        };
    }

    handleQueryMovies = () => {
        const paramsString = window.location.search;
        const searchParams = new URLSearchParams(paramsString);
        if (searchParams.has('imdbIDs')) {
            const imdbIDsString = searchParams.get('imdbIDs');
            const imdbIDsArr = imdbIDsString.split(',');
            const moviesArr = imdbIDsArr.map((imdbID) => ({ imdbID, NameEng: '' }));
            this.props.saveMovies(moviesArr);
            AnalyticsService({
                category: 'User',
                action: 'Viewing another user list',
            });
        }
    };

    deleteMovie = (movieID, imdbID, movieName, movieYear, isMovieWatched) => {
        MoviesService.DeleteMovie(movieID)
            .then(async () => {
                try {
                    const shouldRemoveYear = await MoviesService.ShouldRemoveYear(
                        imdbID,
                        movieYear
                    );
                    if (shouldRemoveYear) {
                        // there is another movie with the same year
                        MoviesService.UpdateYears(movieYear, 'remove');
                    }
                    const properties = ['total'];
                    if (!isMovieWatched) properties.push('unwatched');
                    MoviesService.UpdateCounter(properties, 'Delete Movie');
                    this.props.toggleSnackbar(
                        true,
                        `The movie '${movieName} (${movieYear})' deleted successfully`,
                        'success'
                    );
                } catch (error) {
                    this.props.toggleSnackbar(
                        true,
                        `Error! There was a problem deleting the movie '${movieName} (${movieYear})'`,
                        'error'
                    );
                }
            })
            .catch(() => {
                this.props.toggleSnackbar(
                    true,
                    `Error! There was a problem deleting the movie '${movieName} (${movieYear})'`,
                    'error'
                );
            });

        AnalyticsService({
            category: 'Movie',
            action: 'Deleting a movie',
        });
    };

    addMovie = async (movie) => {
        const { NameEng, imdbID, Year } = movie;
        try {
            const isMovieExists = await MoviesService.isMovieExists(imdbID);
            if (isMovieExists) {
                this.props.toggleSnackbar(
                    true,
                    `The movie '${NameEng}' already exists in your list!`,
                    'warning'
                );
                return;
            }
        } catch (error) {
            this.props.toggleSnackbar(
                true,
                `There was an error adding '${NameEng} (${Year})'.`,
                'error'
            );
        }

        MoviesService.AddMovie(movie)
            .then(() => {
                this.props.toggleSnackbar(
                    true,
                    `The movie '${NameEng} (${Year})' added successfully`,
                    'success'
                );
                if (!this.props.watchMode) this.toggleAddMovie();
                MoviesService.UpdateYears(Year, 'add');
                MoviesService.UpdateCounter(['total', 'unwatched'], 'Add Movie');
            })
            .catch(() => {
                this.props.toggleSnackbar(
                    true,
                    `There was an error adding '${NameEng} (${Year})'`,
                    'error'
                );
            });
        AnalyticsService({
            category: 'Movie',
            action: 'Adding a movie',
        });
    };

    handleEditComments = (comments) => {
        MoviesService.UpdateMovie(this.state.dbMovieID, { Comments: comments })
            .then(() => {
                this.setState({ comments: comments, editingComments: false }, () => {
                    this.props.toggleSnackbar(
                        true,
                        'Personal note saved successfully',
                        'information'
                    );
                });
            })
            .catch(() => {
                this.setState({ comments: comments, editingComments: false }, () => {
                    this.props.toggleSnackbar(
                        true,
                        'There was an error saving your personal note',
                        'error'
                    );
                });
            });
    };

    toggleAddMovie = () => {
        this.setState((state) => ({ addingMovie: !state.addingMovie }));
    };

    toggleWatchTrailer = (searchTrailerParams = '', searchID = '') => {
        this.setState((state) => ({
            searchTrailerParams,
            searchID,
            watchingTrailer: !state.watchingTrailer,
        }));
    };

    toggleEditComments = (dbMovieID = '', comments = '') => {
        this.setState((state) => ({
            comments,
            dbMovieID,
            editingComments: !state.editingComments,
        }));
    };

    handleInformationModalTitle = (title) => {
        this.setState({ informationModalTitle: title }, () => {
            this.toggleInformationModal();
        });
    };

    toggleInformationModal = () => {
        this.setState(
            (state) => ({ showInformationModal: !state.showInformationModal }),
            () => {
                setTimeout(() => {
                    this.setState({ showInformationModal: false });
                }, 3000);
            }
        );
    };

    shareList = async (userInfo, movies) => {
        const url = `${window.location.origin}/?watchMode=true&user=${userInfo.replace(
            /\s/g,
            '+'
        )}&imdbIDs=${movies.map((movie) => movie.imdbID).join()}`;
        try {
            const shortURL = await getShortURL(url);
            navigator.clipboard.writeText(shortURL).then(
                () => {
                    alert(
                        "Your list's sharable link was copied to clipboard. Just paste it wherever you need."
                    );
                },
                () => {
                    throw new Error();
                }
            );
        } catch (error) {
            window.prompt(
                "Please copy your list's sharable link and paste it wherever you need:",
                url
            );
        }
    };

    onFreeSearchFilterChange = ({ target: { value } }) => {
        this.setState({ freeSearchFilter: value });
    };

    filterByName = ({ NameEng, NameHeb }) => {
        const freeSearchFilter = this.state.freeSearchFilter.trim();
        return (
            NameEng.toLowerCase().includes(freeSearchFilter.toLowerCase()) ||
            NameHeb.includes(freeSearchFilter)
        );
    };

    saveMovieData = (movieKey, movieData) => {
        this.setState((state) => ({
            moviesData: { ...state.moviesData, [movieKey]: movieData },
        }));
    };

    render() {
        // const { showInformationModal, informationModalTitle } = this.state;
        const {
            addingMovie,
            watchingTrailer,
            searchID,
            searchTrailerParams,
            comments,
            editingComments,
            freeSearchFilter,
            moviesData,
        } = this.state;
        const {
            loadingMovies,
            movies: dbMovies = [],
            moviesCounter,
            filters,
            loggedInUser,
            watchMode,
            watchModeUserInfo,
        } = this.props;

        let moviesContainer = null;
        let loggedOutMessage = null;
        let counter = null;
        let freeSearch = null;
        let addMovieBtn = null;
        let shareListBtn = null;

        if (!watchMode) {
            if (loggedInUser) {
                let loggedInUserInfo = '';
                const unseenCounter = moviesCounter.unwatched;
                const watchedCounter = moviesCounter.total - moviesCounter.unwatched;
                counter = (
                    <MoviesCounter unseenCounter={unseenCounter} watchedCounter={watchedCounter} />
                );

                freeSearch = (
                    <TextField
                        className="MenuElementMg freeSearch"
                        name="freeSearch"
                        margin="normal"
                        label="Filter search results"
                        placeholder="Enter movie name"
                        value={freeSearchFilter}
                        InputProps={{
                            type: 'text',
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        InputLabelProps={{ style: { color: 'inherit' } }}
                        onChange={this.onFreeSearchFilterChange}
                    />
                );

                addMovieBtn = (
                    <div className="addMovieBtn">
                        <Fab
                            color="primary"
                            variant="extended"
                            size="medium"
                            onClick={this.toggleAddMovie}
                        >
                            <AddIcon />
                            Add Movie
                        </Fab>
                    </div>
                );

                const movies = dbMovies
                    .filter(this.filterByName)
                    .map((movie) => (
                        <Movie
                            key={movie.key || movie.imdbID}
                            dbMovieID={movie.key}
                            data={{ ...movie, ...moviesData[movie.key] }}
                            hasData={!!moviesData[movie.key]}
                            saveMovieData={this.saveMovieData}
                            deleteMovie={this.deleteMovie}
                            toggleWatchTrailer={this.toggleWatchTrailer}
                            toggleEditComments={this.toggleEditComments}
                            toggleSnackbar={this.props.toggleSnackbar}
                            watchMode={watchMode}
                        />
                    ));

                moviesContainer = !loadingMovies ? (
                    (moviesContainer =
                        movies.length === 0 ? (
                            <>
                                <h3 className="informationH3">No results</h3>
                                <h4 className="informationH4">
                                    Add a movie or change list filters
                                </h4>
                            </>
                        ) : (
                            <div className="MoviesContainer">{movies}</div>
                        ))
                ) : (
                    <MoviesSpinner />
                );
                loggedInUserInfo = !loggedInUser.isAnonymous
                    ? loggedInUser.displayName || loggedInUser.email
                    : 'a guest';
                shareListBtn = !loadingMovies && movies.length !== 0 && (
                    <StyledTooltip
                        title="Share this list"
                        disableFocusListener
                        disableTouchListener
                        TransitionComponent={Zoom}
                        arrow
                    >
                        <StyledIconButton
                            onClick={() => this.shareList(loggedInUserInfo, dbMovies)}
                        >
                            <ShareIcon />
                        </StyledIconButton>
                    </StyledTooltip>
                );
            } else {
                loggedOutMessage = (
                    <>
                        <h3 className="informationH3">Welcome!</h3>
                        <br />
                        <h4 className="informationH4">
                            Sign in to start editing your movie watch list
                        </h4>
                        <h4 className="informationH4">
                            * You can use your Google account or a guest account
                        </h4>
                    </>
                );
            }
        } else {
            const movies = dbMovies.map((movie) => (
                <Movie
                    key={movie.imdbID}
                    dbMovieID={movie.imdbID}
                    data={{ ...movie, ...moviesData[movie.imdbID] }}
                    hasData={!!moviesData[movie.imdbID]}
                    saveMovieData={this.saveMovieData}
                    addMovie={loggedInUser && this.addMovie}
                    toggleWatchTrailer={this.toggleWatchTrailer}
                    watchMode={watchMode}
                />
            ));
            moviesContainer =
                movies.length === 0 ? (
                    <h4 className="informationH4">
                        The list is empty. Ask the owner for an updated link.
                    </h4>
                ) : (
                    <div className="MoviesContainer">{movies}</div>
                );
        }

        return (
            <div>
                {loggedOutMessage}

                {dbMovies.length > 0 &&
                    filters.year === 'All' &&
                    filters.maxResults === 1000 &&
                    !loadingMovies &&
                    freeSearch}

                {!loadingMovies && counter}

                {addMovieBtn}

                {shareListBtn}

                {watchModeUserInfo && (
                    <h3 className="informationH3">You are watching {watchModeUserInfo}'s list</h3>
                )}

                {moviesContainer}

                <MovieAddModal
                    isOpen={addingMovie}
                    toggle={this.toggleAddMovie}
                    addMovie={this.addMovie}
                />

                <MovieTrailerModal
                    isOpen={watchingTrailer}
                    toggle={this.toggleWatchTrailer}
                    searchID={searchID}
                    searchParams={searchTrailerParams}
                />

                <MovieCommentsModal
                    isOpen={editingComments}
                    toggle={this.toggleEditComments}
                    comments={comments}
                    handleEditComments={this.handleEditComments}
                />

                {/* <InformationModal
                        isOpen={showInformationModal}
                        toggle={this.toggleInformationModal}
                        title={informationModalTitle} /> */}
            </div>
        );
    }
}

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => ({
    saveMovies: (movies) => dispatch(saveMovies(movies)),
    toggleSnackbar: (open, message, type) => dispatch(toggleSnackbar({ open, message, type })),
});

export default connect(mapStateToProps, mapDispatchToProps)(MoviesContainer);
