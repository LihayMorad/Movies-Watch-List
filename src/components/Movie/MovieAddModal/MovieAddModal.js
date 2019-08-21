import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import * as actionTypes from '../../../store/actions';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import WhatshotIcon from '@material-ui/icons/Whatshot';

import Zoom from '@material-ui/core/Zoom';
import MoviesResultsGrid from './MoviesResultsGrid/MoviesResultsGrid';
import MovieTrailerModal from '../../UI Elements/MovieTrailerModal/MovieTrailerModal';
import SearchResultsSpinner from '../../UI Elements/Spinners/SearchResultsSpinner/SearchResultsSpinner';

import { withStyles } from '@material-ui/core/styles';
import './MovieAddModal.css';

const currYear = new Date().getFullYear();
const initialState = {
    NameHeb: "", NameEng: "", Year: currYear, Comments: "",
    movieSearchResults: [], imdbID: "", tmdbID: "", resultsType: "", loading: false,
    watchingTrailer: false, searchTrailerParams: "", searchID: ""
};

const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);
const StyledDialogContent = withStyles({ root: { padding: '0 24px 12px !important' } })(DialogContent);

class movieAddModal extends Component {

    state = { ...initialState }

    componentDidMount() { this.personalNote = React.createRef(); } // for scrolling to bottom

    componentDidUpdate(prevProps) { if (prevProps.isOpen !== this.props.isOpen) this.setState({ ...initialState }); }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); }

    handleAddMovie = () => {
        const movieDetails = { ...this.state, Year: this.state.selectedYear, NameEng: this.state.selectedTitle, Watched: false };
        this.state.imdbID
            ? this.props.addMovie(movieDetails)
            : this.props.onSnackbarToggle(true, "Please search and choose a movie from the search results.", "information");
    }

    handleMovieSearch = () => {
        this.setState({ loading: true }, async () => {
            try {
                let movieSearchResults = [];
                let resultsType = "";
                const searchURL = `https://www.omdbapi.com/?s=${this.state.NameEng}&y=${this.state.Year}&type=movie&apikey=${process.env.REACT_APP_OMDB_API_KEY}`;
                const omdbResponse = await axios(searchURL);
                if (omdbResponse.status === 200 && omdbResponse.data.Response === "True") {
                    movieSearchResults = omdbResponse.data.Search;
                    resultsType = "search";
                } else {
                    const message = omdbResponse.data.Error === "Too many results." ? "Too many results, please try to be more specific." : omdbResponse.data.Error;
                    this.props.onSnackbarToggle(true, `Search error. ${message}`, "warning");
                }
                this.setState({ loading: false, movieSearchResults, imdbID: "", tmdbID: "", resultsType });
            } catch (error) {
                this.props.onSnackbarToggle(true, "Network error. Something went wrong!", "error");
                this.setState({ loading: false, movieSearchResults: [], imdbID: "", tmdbID: "", resultsType: "" });
            }
        });
    }

    handleTrendingMovieSearch = () => {

        this.setState({ loading: true }, async () => {
            try {
                let movieSearchResults = [];
                let resultsType = "";
                const trendingURL = `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.REACT_APP_TMDB_API_KEY}`;
                const tmdbResponse = await axios(trendingURL);
                if (tmdbResponse.status === 200) {
                    movieSearchResults = tmdbResponse.data.results;
                    resultsType = "trending";
                } else {
                    this.props.onSnackbarToggle(true, "Search error. Something went wrong!", "warning");
                }
                this.setState({ loading: false, movieSearchResults, imdbID: "", tmdbID: "", resultsType });
            } catch (error) {
                this.props.onSnackbarToggle(true, "Network error. Something went wrong!", "error");
                this.setState({ loading: false, movieSearchResults: [], imdbID: "", tmdbID: "", resultsType: "" });
            }
        });
    }

    handleUpdateCurrentMovie = (imdbID, tmdbID, title, year) => {
        this.setState({ imdbID, tmdbID, selectedTitle: title, selectedYear: year },
            () => { this.personalNote.current.scrollIntoView({ behavior: "smooth" }); });
    }

    getIMDBID = async (tmdbID, movieTitle, movieYear) => {
        try {
            const searchURL = `https://api.themoviedb.org/3/movie/${tmdbID}/external_ids?api_key=${process.env.REACT_APP_TMDB_API_KEY}`;
            const tmdbResponse = await axios(searchURL);
            if (tmdbResponse.status === 200) {
                this.handleUpdateCurrentMovie(tmdbResponse.data.imdb_id, tmdbID, movieTitle, movieYear);
            } else {
                this.props.onSnackbarToggle(true, "Something went wrong! can't get movie data", "warning");
            }
        } catch (error) {
            this.props.onSnackbarToggle(true, "Network error. Something went wrong!", "error");
        }
    }

    toggleWatchTrailer = (searchTrailerParams = "", searchID = "") => { this.setState(state => ({ searchTrailerParams, searchID, watchingTrailer: !state.watchingTrailer })); };

    render() {
        const { imdbID, tmdbID, Year, movieSearchResults, loading } = this.state;

        return (
            <>

                <StyledDialog
                    open={this.props.isOpen}
                    onClose={this.props.toggle}
                    maxWidth="md"
                    fullWidth
                    TransitionComponent={Zoom}>

                    <DialogTitle id="movieAddModalTitle">Add a movie to your watch list
                        <IconButton id="movieAddModalCloseBtn" onClick={this.props.toggle}><CloseIcon /></IconButton>
                    </DialogTitle>

                    <form id="movieAddModalForm" onSubmit={e => { e.preventDefault(); this.handleMovieSearch(); }}>

                        <StyledDialogContent>
                            <DialogContentText>
                                Search a movie or see popular movies now and then choose one from the search results.<br />
                                You may specify its hebrew name and your personal note below.<br />
                                When you're done click 'Add'.
                        </DialogContentText>
                            <br />
                            <TextField
                                fullWidth variant="outlined"
                                autoFocus required
                                margin="dense" id="movieNameEng"
                                name="NameEng" label="Movie's English name"
                                inputProps={{ type: "text", placeholder: "Enter english name" }}
                                onChange={this.handleChange} />
                            <TextField
                                fullWidth variant="outlined"
                                margin="dense" id="movieReleaseYear"
                                name="Year" label="Movie's Release year"
                                defaultValue={Year}
                                inputProps={{ type: "number", placeholder: "Enter release year", min: "1950", max: currYear + 2 }}
                                onChange={this.handleChange} />

                            <Button type="submit" color="primary" variant="outlined" className="movieAddModalBtn"><SearchIcon />Search</Button>
                            <Button type="button" color="secondary" variant="outlined" className="movieAddModalBtn"
                                onClick={this.handleTrendingMovieSearch}><WhatshotIcon />&nbsp;Popular Movies</Button>

                            {!loading
                                ? this.state.resultsType && <MoviesResultsGrid
                                    results={movieSearchResults}
                                    type={this.state.resultsType}
                                    imdbID={imdbID}
                                    tmdbID={tmdbID}
                                    updateCurrentMovie={this.handleUpdateCurrentMovie}
                                    toggleWatchTrailer={this.toggleWatchTrailer}
                                    getIMDBID={this.getIMDBID} />
                                : <SearchResultsSpinner />}

                            {imdbID && <>
                                <TextField
                                    fullWidth variant="outlined"
                                    margin="dense" id="movieNameHeb"
                                    name="NameHeb" label="Movie's Hebrew name"
                                    placeholder="Enter hebrew name (optional)"
                                    inputProps={{ type: "text" }}
                                    onChange={this.handleChange} />
                                <TextField
                                    fullWidth variant="outlined" multiline
                                    margin="normal" id="movieComments"
                                    name="Comments" label="Movie's Personal Note"
                                    placeholder="Enter Personal Note (optional)"
                                    onChange={this.handleChange}
                                    inputProps={{ type: "text", ref: this.personalNote }} />
                            </>}

                        </StyledDialogContent>

                        {imdbID && <DialogActions>
                            <Button color="primary" variant="contained" id="movieAddModalAddBtn" onClick={this.handleAddMovie}>Add</Button>
                        </DialogActions>}

                    </form>

                </StyledDialog >

                <MovieTrailerModal
                    isOpen={this.state.watchingTrailer}
                    toggle={this.toggleWatchTrailer}
                    searchParams={this.state.searchTrailerParams}
                    searchID={this.state.searchID} />

            </>
        );

    }
}

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
    onSnackbarToggle: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } })
})

export default connect(mapStateToProps, mapDispatchToProps)(movieAddModal);