import React from 'react';

import { Button, Dialog, DialogActions, DialogTitle, Slide } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const Transition = props => <Slide direction="up" {...props} />;
const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);

const informationModal = props => (
    <StyledDialog
        open={props.isOpen}
        onClose={props.toggle}
        TransitionComponent={Transition}>
        <DialogTitle>{props.title}</DialogTitle>
        <DialogActions><Button color="primary" onClick={props.toggle}>Ok</Button></DialogActions>
    </StyledDialog>
);

export default informationModal;