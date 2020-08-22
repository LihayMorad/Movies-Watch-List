import React from 'react';

import { connect } from 'react-redux';
import * as actionTypes from '../../../store/actions';

import { Snackbar, SnackbarContent, IconButton } from '@material-ui/core';
import { Close as CloseIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon, Info as InfoIcon, Warning as WarningIcon } from '@material-ui/icons';
import { grey, green, red, blue, amber } from '@material-ui/core/colors';

import './Snackbar.css';

const snackbarStyles = {
    "default": {
        "color": grey[900],
        "icon": null
    },
    "error": {
        "color": red[700],
        "icon": <ErrorIcon />
    },
    "warning": {
        "color": amber[700],
        "icon": <WarningIcon />
    },
    "information": {
        "color": blue[700],
        "icon": <InfoIcon />
    },
    "success": {
        "color": green[600],
        "icon": <CheckCircleIcon />
    }
}

const simpleSnackbar = props => {

    const handleClose = () => { props.onSnackbarToggle(false, "", "default"); };

    const color = props.snackbarType ? snackbarStyles[props.snackbarType].color : snackbarStyles['default'].color;
    const icon = props.snackbarType ? snackbarStyles[props.snackbarType].icon : snackbarStyles['default'].icon;
    const message = props.snackbarMessage || "";

    return (
        <Snackbar
            id="snackbarRoot"
            open={props.isSnackbarOpen}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={4000}>
            <SnackbarContent
                style={{ backgroundColor: color }}
                message={<span id="snackbarMessage" >{icon}&nbsp;{message}</span>}
                action={[
                    <IconButton
                        id="snackbarCloseBtn"
                        key="close"
                        color="inherit"
                        onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                ]} />
        </Snackbar>
    );

}

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
    onSnackbarToggle: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } })
})

export default connect(mapStateToProps, mapDispatchToProps)(simpleSnackbar);