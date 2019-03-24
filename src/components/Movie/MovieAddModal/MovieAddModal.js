import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import axios from 'axios';

import MoviesResultsGrid from './MoviesResultsGrid/MoviesResultsGrid';

const initialState = {
    NameHeb: "", NameEng: "", Year: "", TrailerURL: "", Comments: "",
    searched: false, movieSearchResults: [], imdbID: ""
};

class movieAddModal extends Component {

    state = {
        ...initialState
    }

    // componentDidMount() { console.log("[componentDidMount]"); }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isOpen !== this.props.isOpen)
            this.setState({ ...initialState });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); }

    handleSubmit = event => { this.state.imdbID ? this.props.addMovie(this.state) : alert("Please click on the search button and choose a movie.") }

    async handleMovieSearch() {
        const omdbResponse = await axios(`https://www.omdbapi.com/?s=${this.state.NameEng}&y=${this.state.Year}&type=movie&apikey=${process.env.REACT_APP_OMDB_API_KEY}`);
        try {
            let movieSearchResults = omdbResponse.data.Search;
            omdbResponse.data.Response === "True" ? this.setState({ movieSearchResults, searched: true }) : alert("Search error: " + omdbResponse.data.Error);
        } catch (error) {
            console.error('error: ', error);
        }
    }

    handleupdateCurrentMovie = (imdbID, year) => { this.setState({ imdbID: imdbID, Year: year }); }

    render() {

        return (

            <Dialog
                open={this.props.isOpen}
                onClose={this.props.toggle}
                maxWidth="lg"
                fullWidth >

                <DialogTitle>Adding a movie</DialogTitle>

                <form onSubmit={e => { e.preventDefault(); this.handleSubmit() }}>

                    <DialogContent>
                        <DialogContentText>You can add movie details below.</DialogContentText>
                        <TextField
                            multiline autoFocus required fullWidth
                            margin="dense" id="movieNameEng" type="text"
                            name="NameEng" label="Movie's English name"
                            placeholder="Enter english name"
                            onChange={this.handleChange} />
                        <TextField
                            multiline fullWidth
                            margin="dense" id="movieNameHeb" type="text"
                            name="NameHeb" label={"Movie's Hebrew name"}
                            placeholder={"Enter hebrew name"}
                            onChange={this.handleChange} />
                        <TextField
                            fullWidth
                            margin="dense" id="movieReleaseYear" type="number"
                            name="Year" label={"Movie's Release year"}
                            placeholder={"Enter release year"}
                            onChange={this.handleChange} />
                        <TextField
                            multiline fullWidth
                            margin="dense" id="movieTrailer" type="text"
                            name="TrailerURL" label={"Movie's Trailer"}
                            placeholder={"Enter trailer link"}
                            onChange={this.handleChange} />
                        <TextField
                            multiline fullWidth
                            margin="dense" id="movieComments" type="text"
                            name="Comments" label={"Movie's Comments"}
                            placeholder={"Enter comments"}
                            onChange={this.handleChange} />

                        <Button color="secondary" onClick={e => this.handleMovieSearch()}>Search</Button>

                        {this.state.searched && <MoviesResultsGrid
                            results={this.state.movieSearchResults}
                            imdbID={this.state.imdbID}
                            updateCurrentMovie={this.handleupdateCurrentMovie} />}

                    </DialogContent>

                    <DialogActions>
                        <Button type="submit" color="primary">Add</Button>
                    </DialogActions>

                </form>

            </Dialog >
        )

    }
}

export default movieAddModal;