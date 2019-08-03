import React, { Component } from 'react';
import axios from 'axios';

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
import MoviesResultsGrid from './MoviesResultsGrid/MoviesResultsGrid';

import { withStyles } from '@material-ui/core/styles';
import './MovieAddModal.css';

const currYear = new Date().getFullYear();
const initialState = {
    NameHeb: "", NameEng: "", Year: currYear, Comments: "",
    movieSearchResults: [], imdbID: "", loading: false
};

const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);
const StyledDialogContent = withStyles({ root: { padding: '0 24px 12px !important' } })(DialogContent);

class movieAddModal extends Component {

    state = { ...initialState }

    componentDidMount() { this.personalNote = React.createRef(); } // for scrolling to bottom

    componentDidUpdate(prevProps) { if (prevProps.isOpen !== this.props.isOpen) this.setState({ ...initialState }); }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); }

    handleAddMovie = () => {
        this.state.imdbID
        ? this.props.addMovie(this.state)
        : alert("Please search and choose a movie from the search results.");
    }

    handleMovieSearch = () => {
        this.setState({ loading: true }, async () => {
            try {
                let movieSearchResults = [];
                const searchURL = `https://www.omdbapi.com/?s=${this.state.NameEng}&y=${this.state.Year}&type=movie&apikey=${process.env.REACT_APP_OMDB_API_KEY}`;
                const omdbResponse = await axios(searchURL);
                if (omdbResponse.status === 200 && omdbResponse.data.Response === "True") {
                    movieSearchResults = omdbResponse.data.Search;
                } else { alert("Search error: " + omdbResponse.data.Error); }
                this.setState({ loading: false, movieSearchResults, imdbID: "" });
            } catch (error) {
                this.setState({ loading: false });
                alert("Something went wrong: " + error);
            }
        });
    }

    handleUpdateCurrentMovie = (imdbID, title, year) => {
        this.setState({ imdbID: imdbID, NameEng: title, Year: year }, () => { this.personalNote.current.scrollIntoView({ behavior: "smooth" }); });
    }

    render() {
        const { imdbID, Year, movieSearchResults, loading } = this.state;

        return (

            <StyledDialog
                open={this.props.isOpen}
                onClose={this.props.toggle}
                maxWidth="md"
                fullWidth
                disableBackdropClick>

                <DialogTitle>Add a movie to your watch list
                    <IconButton id={"movieAddModalCloseBtn"} onClick={this.props.toggle}><CloseIcon /></IconButton>
                </DialogTitle>

                <form id={"movieAddModalForm"} onSubmit={e => { e.preventDefault(); this.handleMovieSearch() }}>

                    <StyledDialogContent>
                        <DialogContentText>
                            Search a movie by its english name and then choose it from the search results.<br />
                            Yan can specify its hebrew name and personal note.<br />
                            When you done click 'Add' below.
                        </DialogContentText>
                        <br />
                        <TextField
                            autoFocus required fullWidth
                            margin="dense" id="movieNameEng" type="text"
                            name="NameEng" label="Movie's English name"
                            placeholder="Enter english name"
                            onChange={this.handleChange} />
                        <TextField
                            fullWidth
                            margin="dense" id="movieReleaseYear" type="number"
                            name="Year" label={"Movie's Release year"}
                            defaultValue={Year}
                            placeholder={"Enter release year"}
                            inputProps={{ min: "1950", max: currYear + 2 }}
                            onChange={this.handleChange} />

                        <Button type="sumbit" color="secondary" variant="outlined" id={"movieAddModalSearchBtn"}>Search</Button>

                        {!loading
                            ? <MoviesResultsGrid
                                results={movieSearchResults}
                                imdbID={imdbID}
                                updateCurrentMovie={this.handleUpdateCurrentMovie} />
                            : <SearchResultsSpinner />}

                        {imdbID && <>
                            <TextField
                                fullWidth
                                margin="dense" id="movieNameHeb" type="text"
                                name="NameHeb" label={"Movie's Hebrew name"}
                                placeholder={"Enter hebrew name (optional)"}
                                onChange={this.handleChange} />
                            <TextField
                                fullWidth multiline
                                margin="dense" id="movieComments" type="text"
                                name="Comments" label={"Movie's Personal Note"}
                                placeholder={"Enter Personal Note (optional)"}
                                onChange={this.handleChange}
                                inputProps={{ ref: this.personalNote }} />
                        </>}

                    </StyledDialogContent>

                    {imdbID && <DialogActions>
                        <Button color="primary" variant="contained" onClick={this.handleAddMovie}>Add</Button>
                    </DialogActions>}

                </form>

            </StyledDialog >
        );

    }
}

export default movieAddModal;