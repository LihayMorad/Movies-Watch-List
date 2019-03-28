import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import SearchResultsSpinner from '../../Spinners/SearchResultsSpinner/SearchResultsSpinner';

import { withStyles } from '@material-ui/core/styles';

import axios from 'axios';

import MoviesResultsGrid from './MoviesResultsGrid/MoviesResultsGrid';

const initialState = {
    NameHeb: "", NameEng: "", Year: "", TrailerURL: "", Comments: "",
    movieSearchResults: [], imdbID: "", loading: false
};

const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);

class movieAddModal extends Component {

    state = { ...initialState }

    // componentDidMount() { console.log("[componentDidMount]"); }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isOpen !== this.props.isOpen)
            this.setState({ ...initialState });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); }

    handleSubmit = event => { this.state.imdbID ? this.props.addMovie(this.state) : alert("Please click on the search button and choose a movie.") }

    async handleMovieSearch() {
        this.setState({ loading: true });
        const omdbResponse = await axios(`https://www.omdbapi.com/?s=${this.state.NameEng}&y=${this.state.Year}&type=movie&apikey=${process.env.REACT_APP_OMDB_API_KEY}`);
        try {
            let movieSearchResults = [];
            if (omdbResponse.data.Response === "True") {
                movieSearchResults = omdbResponse.data.Search;
            } else { alert("Search error: " + omdbResponse.data.Error); }
            this.setState({ loading: false, movieSearchResults });
        } catch (error) {
            this.setState({ loading: false });
            alert("Error: " + error);
        }
    }

    handleUpdateCurrentMovie = (imdbID, title, year) => { this.setState({ imdbID: imdbID, NameEng: title, Year: year }); }

    render() {

        const closeBtnStyles = {
            position: 'absolute',
            right: '0',
            top: '0'
        }

        return (

            <StyledDialog
                open={this.props.isOpen}
                onClose={this.props.toggle}
                maxWidth="md"
                fullWidth
                disableBackdropClick
                disableEscapeKeyDown>

                <DialogTitle>Add a movie to your watch list<IconButton style={closeBtnStyles} onClick={this.props.toggle}><CloseIcon /></IconButton></DialogTitle>

                <form onSubmit={e => { e.preventDefault(); this.handleSubmit() }}>

                    <DialogContent>
                        <DialogContentText>
                            Search a movie by its english name (you may also specify a year).<br></br>
                            Click 'Search' and then click on the movie you searched for.<br></br>
                            If you'd like to, you can also specify its hebrew name, trailer link and personal note.<br></br>
                            Click 'Add' at the bottom.
                        </DialogContentText>
                        <TextField
                            multiline autoFocus required fullWidth
                            margin="dense" id="movieNameEng" type="text"
                            name="NameEng" label="Movie's English name"
                            placeholder="Enter english name"
                            onChange={this.handleChange} />
                        <TextField
                            fullWidth
                            margin="dense" id="movieReleaseYear" type="number"
                            name="Year" label={"Movie's Release year"}
                            placeholder={"Enter release year"}
                            onChange={this.handleChange} />

                        <Button color="secondary" variant="outlined" style={{ marginTop: '10px' }} onClick={() => this.handleMovieSearch()}>Search</Button>

                        {!this.state.loading ? <MoviesResultsGrid
                            results={this.state.movieSearchResults}
                            imdbID={this.state.imdbID}
                            updateCurrentMovie={this.handleUpdateCurrentMovie} />
                            :
                            <SearchResultsSpinner />}

                        <TextField
                            multiline fullWidth
                            margin="dense" id="movieNameHeb" type="text"
                            name="NameHeb" label={"Movie's Hebrew name"}
                            placeholder={"Enter hebrew name (optional)"}
                            onChange={this.handleChange} />
                        <TextField
                            multiline fullWidth
                            margin="dense" id="movieTrailer" type="text"
                            name="TrailerURL" label={"Movie's Trailer"}
                            placeholder={"Enter trailer link (optional)"}
                            onChange={this.handleChange} />
                        <TextField
                            multiline fullWidth
                            margin="dense" id="movieComments" type="text"
                            name="Comments" label={"Movie's Personal Note"}
                            placeholder={"Enter Personal Note (optional)"}
                            onChange={this.handleChange} />

                    </DialogContent>

                    <DialogActions>
                        <Button type="submit" color="primary" variant="contained">Add</Button>
                    </DialogActions>

                </form>

            </StyledDialog >
        );

    }
}

export default movieAddModal;