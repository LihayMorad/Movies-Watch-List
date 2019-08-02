import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

import { withStyles } from '@material-ui/core/styles';

const Transition = props => <Slide direction="up" {...props} />;
const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);

const informationDialog = props => {

    return (
        <StyledDialog
            // keepMounted
            open={props.isOpen}
            onClose={props.toggle}
            TransitionComponent={Transition}>
            <DialogTitle>{props.dialogTitle}</DialogTitle>
            <DialogActions><Button color="primary" onClick={props.toggle}>Ok</Button></DialogActions>
        </StyledDialog>
    );
}

export default informationDialog;