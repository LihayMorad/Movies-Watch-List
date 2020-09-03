import React, { Component } from 'react';
import axios from 'axios';

import AnalyticsService from '../../../Services/AnalyticsService';

import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    Typography,
    IconButton,
    Zoom,
} from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

import ErrorIcon from '../../../assets/ErrorIcon.png';
import LoadingSpinner from '../Spinners/SearchResultsSpinner';

const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);

class MovieTrailerModal extends Component {
    state = {
        trailerId: '',
        trailerTitle: '',
        searchError: false,
        loading: false,
    };

    getTrailer = () => {
        // if we get an error from TMDB, continue to YouTube search
        this.setState({ loading: true }, this.getTrailerFromTMDBAPI);
    };

    getTrailerFromTMDBAPI = () => {
        if (this.props.searchID) {
            axios(
                `https://api.themoviedb.org/3/movie/${this.props.searchID}/videos?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
            )
                .then((response) => {
                    if (response.status === 200 && response.statusText === 'OK') {
                        const results = response.data.results || [];
                        const trailer =
                            results.length &&
                            results.find(
                                (movie) => movie.site === 'YouTube' && movie.type === 'Trailer'
                            );
                        if (!trailer) throw Error({ message: 'No results from TMDB' });
                        this.setState({
                            trailerId: trailer.key || '',
                            trailerTitle: `${this.props.searchParams} Trailer`,
                            searchError: '',
                            loading: false,
                        });
                    } else {
                        throw Error(response);
                    }
                })
                .catch((error) => {
                    this.setState({
                        searchError: error.response ? error.response.statusText : error.message,
                    });
                    this.getTrailerFromYouTubeAPI();
                });
        } else {
            this.setState({ searchError: 'Search ID is missing' });
            this.getTrailerFromYouTubeAPI();
        }
        AnalyticsService({
            category: 'Movie',
            action: 'Searching movie trailer by TMDB API',
        });
    };

    getTrailerFromYouTubeAPI = () => {
        if (this.props.searchParams) {
            axios(
                `https://content.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${this.props.searchParams}%20trailer&type=video&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`
            )
                .then((response) => {
                    if (response.status === 200) {
                        const results = response.data.items || [];
                        const trailer = results.length && results[0].id;
                        if (!trailer) throw Error({ message: 'No results from YouTube' });
                        this.setState({
                            trailerId: trailer.videoId,
                            trailerTitle: `${this.props.searchParams} Trailer`,
                            searchError: '',
                            loading: false,
                        });
                    } else {
                        throw Error(response);
                    }
                })
                .catch((error) => {
                    this.setState({
                        searchError: error.response ? error.response.data : error.message,
                        loading: false,
                    });
                });
        } else {
            this.setState({ searchError: 'Search parameters are missing' });
        }
        AnalyticsService({
            category: 'Movie',
            action: 'Searching movie trailer by YouTube API',
        });
    };

    onClose = () => {
        this.setState({ trailerId: '', trailerTitle: '', searchError: false, loading: false });
        this.props.toggle();
    };

    render() {
        const { trailerId, trailerTitle, searchError, loading } = this.state;
        const { isOpen, toggle } = this.props;
        const title = !loading
            ? !searchError
                ? trailerTitle
                : 'Error! Something went wrong'
            : 'Loading...';
        return (
            <StyledDialog
                fullWidth
                maxWidth="lg"
                TransitionComponent={Zoom}
                open={isOpen}
                onEnter={this.getTrailer}
                onClose={this.onClose}
            >
                <div className="DialogTitleDiv">
                    <DialogTitle>{title}</DialogTitle>
                    <IconButton
                        color="inherit"
                        className="closeModalBtn"
                        onClick={toggle}
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </IconButton>
                </div>

                {!loading ? (
                    <div className={`DialogContentYoutubeDivWrapper ${searchError ? 'error' : ''}`}>
                        {!searchError ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerId}?autoplay=0`}
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                                frameBorder="0"
                                title="Movie Trailer"
                            ></iframe>
                        ) : (
                            <img src={ErrorIcon} alt="Error! Something went wrong" />
                        )}
                    </div>
                ) : (
                    <LoadingSpinner />
                )}

                <DialogActions id="TrailerModalActions">
                    {!loading && !searchError && (
                        <Typography variant="body1" align="left">
                            *based on YouTube search results
                        </Typography>
                    )}
                    <Button onClick={toggle}>Close</Button>
                </DialogActions>
            </StyledDialog>
        );
    }
}

export default MovieTrailerModal;
