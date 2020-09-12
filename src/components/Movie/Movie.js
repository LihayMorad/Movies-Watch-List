import React, { Component } from 'react';
import axios from 'axios';

import MoviesService from '../../Services/MoviesService';
import AnalyticsService from '../../Services/AnalyticsService';

import MovieTabs from './MovieTabs/MovieTabs';
import MovieSpinner from '../../components/UI Elements/Spinners/MovieSpinner';

import { hasExpired } from '../../utils/common';

import {
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    Typography,
    Checkbox,
    Tooltip,
    Fab,
    Divider,
    Zoom,
} from '@material-ui/core';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon,
    RemoveRedEye,
    RemoveRedEyeOutlined,
} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

import Rating from 'react-rating'; // https://github.com/dreyescat/react-rating

import ErrorIcon from '../../assets/ErrorIcon.png';
import youTubeIcon from '../../assets/youtube_icon.png';

const StyledTooltip = withStyles({
    tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' },
    arrow: { color: 'black' },
})(Tooltip);

const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500/';

class Movie extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: !props.hasData,
            error: false,
        };
    }

    componentDidMount() {
        if (!this.props.hasData) this.getMovieDb();
    }

    getMovieDb = () => {
        const { dbMovieID, watchMode } = this.props;
        const { imdbID, imdbRating, imdbRatingTimestamp, Poster } = this.props.data;
        let movieData = {};
        let error = false;
        axios(
            `https://www.omdbapi.com/?i=${imdbID}&type=movie&plot=full&apikey=${process.env.REACT_APP_OMDB_API_KEY}`
        )
            .then((response) => {
                if (response.status === 200 && response.data.Response === 'True') {
                    movieData = response.data;
                    movieData.Year = parseInt(response.data.Year);
                    if (Poster) {
                        // it's the poster path if we added the movie from 'Popular Movies' search results
                        movieData.Poster = TMDB_POSTER_BASE_URL + Poster;
                    }
                    const shouldUpdateIMDBRating =
                        !watchMode &&
                        (!imdbRating || !imdbRatingTimestamp || hasExpired(imdbRatingTimestamp));
                    if (shouldUpdateIMDBRating) {
                        const newIMDBRating =
                            movieData.imdbRating && movieData.imdbRating !== 'N/A'
                                ? movieData.imdbRating
                                : '';
                        this.updateIMDBRating(newIMDBRating);
                    }
                } else {
                    error = response.data.Error;
                }
            })
            .catch(() => (error = true))
            .finally(() => {
                this.setState({ loading: false, error });
                this.props.saveMovieData(!watchMode ? dbMovieID : imdbID, movieData);
            });
    };

    toggleMovieWatched = ({ target: { checked } }) => {
        const label = checked ? 'watched' : 'unwatched';
        MoviesService.UpdateMovie(this.props.dbMovieID, { Watched: checked })
            .then(() => {
                this.props.toggleSnackbar(
                    true,
                    `Movie marked as ${label} successfully`,
                    'information'
                );
                MoviesService.UpdateCounter(
                    null,
                    checked ? 'Mark as watched' : 'Mark as unwatched'
                );
                AnalyticsService({
                    category: 'Movie',
                    action: 'Toggle movie watched status',
                });
            })
            .catch(() => {
                this.props.toggleSnackbar(
                    true,
                    `There was an error marking the movie as ${label}`,
                    'error'
                );
            });
    };

    updateIMDBRating = (imdbRating) => {
        MoviesService.UpdateMovie(this.props.dbMovieID, {
            imdbRating,
            imdbRatingTimestamp: Date.now(),
        })
            .then(() => {})
            .catch(() => {});
    };

    addMovie = () => {
        const { imdbID, NameEng, Title, Year } = this.props.data;
        this.props.addMovie({ imdbID, NameEng: NameEng || Title, Year, Watched: false });
    };

    getActionButtons = () => {
        const { loading, error } = this.state;
        const { dbMovieID, watchMode } = this.props;
        const { imdbID, Title, NameEng, Comments, Year, Watched } = this.props.data;
        return !watchMode ? (
            <>
                <StyledTooltip title="Edit movie's personal note" TransitionComponent={Zoom} arrow>
                    <Zoom in={!loading} timeout={500} unmountOnExit className="movieCardFab">
                        <Fab
                            color="primary"
                            size="small"
                            onClick={() => {
                                this.props.toggleEditComments(dbMovieID, Comments);
                            }}
                        >
                            <EditIcon />
                        </Fab>
                    </Zoom>
                </StyledTooltip>

                <StyledTooltip
                    title={`Mark movie as ${Watched ? 'unseen' : 'watched'}`}
                    TransitionComponent={Zoom}
                    arrow
                >
                    <Zoom in={!loading} timeout={500} unmountOnExit className="movieCardFab">
                        <Fab color="default" size="small">
                            <Checkbox
                                style={{ height: 'inherit' }}
                                checked={Watched || false}
                                icon={<RemoveRedEyeOutlined fontSize="large" color="action" />}
                                checkedIcon={<RemoveRedEye fontSize="large" color="primary" />}
                                onChange={this.toggleMovieWatched}
                            />
                        </Fab>
                    </Zoom>
                </StyledTooltip>

                <StyledTooltip title="Delete movie" TransitionComponent={Zoom}>
                    <Zoom in={!loading} timeout={500} unmountOnExit className="movieCardFab">
                        <Fab
                            color="secondary"
                            size="small"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this movie?')) {
                                    this.props.deleteMovie(
                                        dbMovieID,
                                        imdbID,
                                        !error ? Title : NameEng,
                                        Year,
                                        Watched
                                    );
                                }
                            }}
                        >
                            <DeleteIcon />
                        </Fab>
                    </Zoom>
                </StyledTooltip>
            </>
        ) : (
            this.props.addMovie && (
                <StyledTooltip title="Add this movie to your list" TransitionComponent={Zoom} arrow>
                    <Zoom in={!loading} timeout={500} unmountOnExit className="movieCardFab">
                        <Fab
                            color="primary"
                            variant="extended"
                            size="large"
                            onClick={this.addMovie}
                        >
                            <AddIcon />
                        </Fab>
                    </Zoom>
                </StyledTooltip>
            )
        );
    };

    render() {
        const { loading, error } = this.state;
        const { watchMode } = this.props;
        const {
            imdbID,
            Title,
            NameEng,
            NameHeb,
            Comments,
            Year,
            Poster,
            Country,
            Runtime,
            imdbRating,
            Ratings,
            Plot,
            Actors,
            Genre,
        } = this.props.data;

        return (
            <div className="movieCardContainer">
                <Card className="movieCard">
                    {imdbRating && imdbRating !== 'N/A' && (
                        <StyledTooltip
                            title={`IMDB rating: ${imdbRating}`}
                            TransitionComponent={Zoom}
                            arrow
                        >
                            <div>
                                <Rating
                                    className="movieRatingStars"
                                    initialRating={imdbRating}
                                    stop={10}
                                    fractions={10}
                                    emptySymbol={<StarBorderIcon />}
                                    fullSymbol={<StarIcon />}
                                    readonly
                                />
                            </div>
                        </StyledTooltip>
                    )}

                    <CardActionArea>
                        <StyledTooltip
                            title="Click to watch the trailer"
                            TransitionComponent={Zoom}
                            arrow
                        >
                            <CardContent
                                className="movieCardContent"
                                onClick={() =>
                                    this.props.toggleWatchTrailer(
                                        `${!error ? Title : NameEng} ${Year}`,
                                        imdbID
                                    )
                                }
                            >
                                <div className="movieCardContentImgDiv">
                                    {!loading ? (
                                        !error ? (
                                            <>
                                                <img
                                                    src={Poster}
                                                    className="movieCardContentImgDivPoster"
                                                    alt="Movie Poster Not Found"
                                                />
                                                <img
                                                    src={youTubeIcon}
                                                    className="movieCardContentYouTubeImg"
                                                    alt="YouTube icon"
                                                />
                                            </>
                                        ) : (
                                            <div className="movieCardContentImgDivError">
                                                <img
                                                    src={ErrorIcon}
                                                    alt={error === true ? 'Error' : error}
                                                />
                                                <h1>Database error {error}</h1>
                                            </div>
                                        )
                                    ) : (
                                        <MovieSpinner />
                                    )}
                                </div>

                                <Divider variant="middle"></Divider>

                                <div className="movieCardContentTextDiv">
                                    {!loading ? (
                                        <div>
                                            <Typography variant="h4">
                                                {!error ? Title : NameEng}
                                            </Typography>
                                            <Typography variant="h5">{NameHeb}</Typography>
                                            {!error ? (
                                                <p>
                                                    {Country} {Year} <span>({Runtime})</span>
                                                </p>
                                            ) : (
                                                <p>{Year}</p>
                                            )}
                                            {Comments && (
                                                <p>
                                                    Personal note:{' '}
                                                    <span className="commentsSpan">{Comments}</span>
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <MovieSpinner />
                                    )}
                                </div>
                            </CardContent>
                        </StyledTooltip>
                    </CardActionArea>

                    <CardActions>
                        {!loading ? (
                            !error && (
                                <MovieTabs
                                    title={!error ? Title : NameEng}
                                    year={Year}
                                    ratings={Ratings}
                                    imdbRating={imdbRating}
                                    imdbID={imdbID}
                                    plot={Plot}
                                    actors={Actors}
                                    genre={Genre}
                                    watchMode={watchMode}
                                />
                            )
                        ) : (
                            <MovieSpinner />
                        )}
                    </CardActions>

                    {this.getActionButtons()}
                </Card>
            </div>
        );
    }
}

export default Movie;
