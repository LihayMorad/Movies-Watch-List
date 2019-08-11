import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { withStyles } from '@material-ui/core/styles';
const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);

class movieCommentsModal extends Component {

    state = {
        comments: this.props.comments || "",
        commentsChanged: false
    }

    handleChange = e => { this.setState({ comments: e.target.value, commentsChanged: true }); }

    render() {
        const { commentsChanged } = this.state;

        return (
            <StyledDialog
                open={this.props.isOpen}
                onClose={this.props.toggle}
                fullWidth
                maxWidth="md">

                <DialogTitle>Movie note</DialogTitle>

                <DialogContent>
                    <DialogContentText>Edit your personal note below.</DialogContentText>
                    <TextField
                        id="comments"
                        multiline
                        autoFocus
                        margin="dense"
                        type="text"
                        defaultValue={this.props.comments}
                        onChange={this.handleChange}
                        fullWidth />
                </DialogContent>

                <DialogActions>
                    <Button color="primary" onClick={() => { this.props.handleComments(commentsChanged ? this.state.comments : this.props.comments) }}>Save</Button>
                </DialogActions>

            </StyledDialog>
        );
    }
}

export default movieCommentsModal;