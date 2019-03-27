import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

const SignInOutDialog = props => {

    return (
        <div>
            <Dialog
                keepMounted
                open={props.isOpen}
                onClose={props.toggle}
                TransitionComponent={Transition}>
                <DialogTitle>
                    {props.dialogTitle}
                </DialogTitle>
                <DialogActions>
                    <Button color="primary" onClick={props.toggle}>Ok</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default SignInOutDialog;