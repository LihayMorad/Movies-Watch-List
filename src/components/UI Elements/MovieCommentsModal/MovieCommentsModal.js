import React, { Component } from 'react';

import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
} from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);

class movieCommentsModal extends Component {
    state = {
        comments: this.props.comments || '',
        commentsChanged: false,
    };

    componentDidUpdate(prevProps) {
        if (prevProps.comments !== this.props.comments)
            this.setState({ comments: this.props.comments });
    }

    onChange = ({ target: { value } }) => {
        this.setState({ comments: value, commentsChanged: true });
    };

    close = () => {
        this.setState({ commentsChanged: false });
        this.props.toggle();
    };

    handleEditComments = () => {
        this.props.handleEditComments(
            this.state.commentsChanged ? this.state.comments : this.props.comments
        );
    };

    render() {
        const { commentsChanged } = this.state;

        return (
            <StyledDialog open={this.props.isOpen} onClose={this.close} fullWidth maxWidth="md">
                <DialogTitle>
                    Movie note
                    <IconButton className="closeModalBtn" onClick={this.props.toggle}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>Edit your personal note below.</DialogContentText>
                    <TextField
                        id="comments"
                        multiline
                        autoFocus
                        margin="dense"
                        type="text"
                        value={commentsChanged ? this.state.comments : this.props.comments}
                        onChange={this.onChange}
                        fullWidth
                    />
                </DialogContent>

                <DialogActions>
                    <Button color="primary" onClick={this.handleEditComments}>
                        Save
                    </Button>
                </DialogActions>
            </StyledDialog>
        );
    }
}

export default movieCommentsModal;
