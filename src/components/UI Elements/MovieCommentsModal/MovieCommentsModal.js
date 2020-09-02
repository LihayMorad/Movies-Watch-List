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

    handleChange = ({ target: { value } }) => {
        this.setState({ comments: value, commentsChanged: true });
    };

    handleClose = () => {
        this.setState({ commentsChanged: false });
        this.props.toggle();
    };

    render() {
        const { commentsChanged } = this.state;

        return (
            <StyledDialog
                open={this.props.isOpen}
                onClose={this.handleClose}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    Movie note
                    <IconButton className="modalCloseBtn" onClick={this.props.toggle}>
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
                        onChange={this.handleChange}
                        fullWidth
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        color="primary"
                        onClick={() => {
                            this.props.handleEditComments(
                                commentsChanged ? this.state.comments : this.props.comments
                            );
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </StyledDialog>
        );
    }
}

export default movieCommentsModal;
