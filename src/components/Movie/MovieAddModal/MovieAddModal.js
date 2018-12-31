import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class movieAddModal extends Component {

    state = {
        NameHeb: "", NameEng: "", Year: "", TrailerURL: "", Comments: ""
    }

    // componentDidMount() { console.log('this.props.addMovie: ', this.props.addMovie); }

    // componentDidUpdate() { console.log('this.state: ', this.state); }

    handleChange = event => { this.setState({ [event.target.name]: event.target.value }); }

    handleSubmit = event => {
        this.props.addMovie(this.state);
    }

    render() {

        return (

            <Dialog
                open={this.props.isOpen}
                // onEnter={this.modalOpened}
                onClose={this.props.toggle}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>Adding a movie</DialogTitle>

                <form onSubmit={(e) => { e.preventDefault(); this.handleSubmit() }}>

                    <DialogContent>
                        <DialogContentText>You can add movie details below.</DialogContentText>
                        <TextField
                            multiline autoFocus required fullWidth
                            margin="dense" id="movieNameEng" type="text"
                            name="NameEng" label="Movie's English name"
                            placeholder="Enter english name"
                            // defaultValue={"Enter the movie's english name"}
                            onChange={this.handleChange}
                        />
                        <TextField
                            multiline fullWidth
                            margin="dense" id="movieNameHeb" type="text"
                            name="NameHeb" label={"Movie's Hebrew name"}
                            placeholder={"Enter hebrew name"}
                            onChange={this.handleChange}
                        />
                        <TextField
                            multiline required fullWidth
                            margin="dense" id="movieReleaseYear" type="number"
                            name="Year" label={"Movie's Release year"}
                            placeholder={"Enter release year"}
                            onChange={this.handleChange}
                        />
                        <TextField
                            multiline fullWidth
                            margin="dense" id="movieTrailer" type="text"
                            name="TrailerURL" label={"Movie's Trailer"}
                            placeholder={"Enter trailer link"}
                            onChange={this.handleChange}
                        />
                        <TextField
                            multiline fullWidth
                            margin="dense" id="movieComments" type="text"
                            name="Comments" label={"Movie's Comments"}
                            placeholder={"Enter comments"}
                            onChange={this.handleChange}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button type="submit" color="primary" onClick={() => { console.log("clicked"); }}>Add</Button>
                    </DialogActions>

                </form>

            </Dialog>
        )

    }
}

export default movieAddModal;