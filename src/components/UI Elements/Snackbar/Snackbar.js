import React from 'react';

import { connect } from 'react-redux';
import { toggleSnackbar } from '../../../store/actions';

import { Snackbar, SnackbarContent, IconButton } from '@material-ui/core';
import {
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
} from '@material-ui/icons';
import { grey, green, red, blue, amber } from '@material-ui/core/colors';

const snackbarStyles = {
    default: {
        color: grey[900],
        icon: null,
    },
    error: {
        color: red[700],
        icon: <ErrorIcon />,
    },
    warning: {
        color: amber[700],
        icon: <WarningIcon />,
    },
    information: {
        color: blue[700],
        icon: <InfoIcon />,
    },
    success: {
        color: green[600],
        icon: <CheckCircleIcon />,
    },
};

const simpleSnackbar = ({ isSnackbarOpen, snackbarType, snackbarMessage = '', toggleSnackbar }) => {
    const handleClose = () => {
        toggleSnackbar(false, '', 'default');
    };

    const color = snackbarType
        ? snackbarStyles[snackbarType].color
        : snackbarStyles['default'].color;
    const icon = snackbarType ? snackbarStyles[snackbarType].icon : snackbarStyles['default'].icon;

    return (
        <Snackbar
            id="snackbarRoot"
            open={isSnackbarOpen}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={4000}
        >
            <SnackbarContent
                style={{ backgroundColor: color }}
                message={
                    <span id="snackbarMessage">
                        {icon}&nbsp;{snackbarMessage}
                    </span>
                }
                action={[
                    <IconButton
                        id="snackbarCloseBtn"
                        key="close"
                        color="inherit"
                        onClick={handleClose}
                    >
                        <CloseIcon />
                    </IconButton>,
                ]}
            />
        </Snackbar>
    );
};

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => ({
    toggleSnackbar: (open, message, type) => dispatch(toggleSnackbar({ open, message, type })),
});

export default connect(mapStateToProps, mapDispatchToProps)(simpleSnackbar);
