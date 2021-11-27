import React, { useState, useEffect, useCallback } from 'react';

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

const MovieCommentsModal = ({ isOpen, comments, toggle, handleEditComments }) => {
    const [newComments, setNewComments] = useState(comments || '');
    const [commentsChanged, setCommentsChanged] = useState(false);

    const onChange = useCallback((e) => {
        setNewComments(e.target.value);
        setCommentsChanged(true);
    }, []);

    const onClose = useCallback(() => {
        setNewComments(comments || '');
        setCommentsChanged(false);
        toggle();
    }, [comments, toggle]);

    const onSave = useCallback(() => {
        handleEditComments(commentsChanged ? newComments : comments);
    }, [comments, newComments, commentsChanged, handleEditComments]);

    useEffect(() => {
        setNewComments(comments);
    }, [comments]);

    return (
        <StyledDialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                Movie note
                <IconButton className="closeModalBtn" onClick={onClose}>
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
                    value={commentsChanged ? newComments : comments}
                    onChange={onChange}
                    fullWidth
                />
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={onSave}>
                    Save
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default MovieCommentsModal;
