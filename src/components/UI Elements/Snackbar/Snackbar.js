import React from 'react';

import { connect } from 'react-redux';
import * as actionTypes from '../../../store/actions';

import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import WarningIcon from '@material-ui/icons/Warning';
import Grow from '@material-ui/core/Grow';

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
            autoHideDuration={4000}
            TransitionComponent={Grow}>
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