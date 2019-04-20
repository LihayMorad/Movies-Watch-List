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

import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import './MovieAddModal.css';

import MoviesResultsGrid from './MoviesResultsGrid/MoviesResultsGrid';

const currYear = new Date().getFullYear();
const initialState = {
    NameHeb: "", NameEng: "", Year: currYear, TrailerURL: "", Comments: "",
    movieSearchResults: [], imdbID: "", loading: false
};

const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);
// const styles = {
//     closeBtn: { position: 'absolute', right: '0', top: '0' },
//     form: { display: 'contents' },
//     searchBtn: { marginTop: '10px' },
//     hebName: { direction: 'rtl' }
// }

class movieAddModal extends Component {

    state = { ...initialState }

    componentDidMount() {
        this.nameEngInput = React.createRef();
        this.yearFieldInput = React.createRef();
        this.personalNote = React.createRef();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isOpen !== this.props.isOpen)
            this.setState({ ...initialState });
    }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); }

    handleAddMovie = event => {
        this.state.imdbID
            ? this.props.addMovie(this.state)
            : alert("Please search and choose a movie from the search results.");
    }

    handleMovieSearch = () => {
        this.setState({ loading: true }, async () => {
            try {
                const omdbResponse = await axios(`https://www.omdbapi.com/?s=${this.nameEngInput.current.value}&y=${this.yearFieldInput.current.value}&type=movie&apikey=${process.env.REACT_APP_OMDB_API_KEY}`);
                let movieSearchResults = [];
                if (omdbResponse.data.Response === "True") {
                    movieSearchResults = omdbResponse.data.Search;
                } else { alert("Search error: " + omdbResponse.data.Error); }
                this.setState({ loading: false, movieSearchResults, imdbID: "" });
            } catch (error) {
                this.setState({ loading: false });
                alert("Error: " + error);
            }
        });
    }

    handleUpdateCurrentMovie = (imdbID, title, year) => {
        this.setState({ imdbID: imdbID, NameEng: title, Year: year }, () => {
            this.personalNote.current.scrollIntoView({behavior: "smooth"});
        });
    }

    render() {

        return (

            <StyledDialog
                open={this.props.isOpen}
                onClose={this.props.toggle}
                maxWidth="md"
                fullWidth
                disableBackdropClick>

                <DialogTitle>Add a movie to your watch list<IconButton id={"movieAddModalCloseBtn"} onClick={this.props.toggle}><CloseIcon /></IconButton></DialogTitle>

                <form id={"movieAddModalForm"} onSubmit={e => { e.preventDefault(); this.handleMovieSearch() }}>

                    <DialogContent>
                        <DialogContentText>
                            Search a movie by its english name and then choose it from the search results.<br></br>
                            Yan can specify its hebrew name, trailer link and personal note.<br></br>
                            When you done click 'Add' below.
                        </DialogContentText>
                        <TextField
                            autoFocus required fullWidth
                            margin="dense" id="movieNameEng" type="text"
                            name="NameEng" label="Movie's English name"
                            placeholder="Enter english name"
                            inputProps={{ min: "1950", max: currYear + 2, ref: this.nameEngInput }}
                            onChange={this.handleChange} />
                        <TextField
                            fullWidth
                            margin="dense" id="movieReleaseYear (optional)" type="number"
                            name="Year" label={"Movie's Release year"}
                            defaultValue={this.state.Year}
                            placeholder={"Enter release year"}
                            inputProps={{ min: "1950", max: currYear + 2, ref: this.yearFieldInput }}
                            onChange={this.handleChange} />

                        <Button type="sumbit" color="secondary" variant="outlined" id={"movieAddModalSearchBtn"}>Search</Button>

                        {!this.state.loading
                            ? <MoviesResultsGrid
                                results={this.state.movieSearchResults}
                                imdbID={this.state.imdbID}
                                updateCurrentMovie={this.handleUpdateCurrentMovie} />
                            : <SearchResultsSpinner />}

                        {this.state.imdbID && <>
                            <TextField
                                fullWidth
                                margin="dense" id="movieNameHeb" type="text"
                                name="NameHeb" label={"Movie's Hebrew name"}
                                placeholder={"Enter hebrew name (optional)"}
                                onChange={this.handleChange} />
                            <TextField
                                fullWidth
                                margin="dense" id="movieTrailer" type="text"
                                name="TrailerURL" label={"Movie's Trailer"}
                                placeholder={"Enter trailer link (optional)"}
                                onChange={this.handleChange} />
                            <TextField
                                fullWidth multiline
                                margin="dense" id="movieComments" type="text"
                                name="Comments" label={"Movie's Personal Note"}
                                placeholder={"Enter Personal Note (optional)"}
                                onChange={this.handleChange} inputProps={{ ref: this.personalNote }} /></>}

                    </DialogContent>
                </form>
                
                {this.state.imdbID && <DialogActions>
                    <Button color="primary" variant="contained" onClick={this.handleAddMovie}>Add</Button>
                </DialogActions>}

            </StyledDialog >
        );

    }
}

export default movieAddModal;