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

const styles = {
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

const snackbar = ({ isOpen, type, message = '', close }) => {
    const { color, icon } = styles[type || 'default'];

    return (
        <Snackbar
            id="snackbarRoot"
            open={isOpen}
            onClose={close}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            autoHideDuration={4000}
        >
            <SnackbarContent
                style={{ backgroundColor: color }}
                message={
                    <span id="snackbarMessage">
                        {icon}&nbsp;{message}
                    </span>
                }
                action={[
                    <IconButton id="snackbarCloseBtn" key="close" color="inherit" onClick={close}>
                        <CloseIcon />
                    </IconButton>,
                ]}
            />
        </Snackbar>
    );
};

const mapStateToProps = ({ isSnackbarOpen, snackbarType, snackbarMessage }) => ({
    isOpen: isSnackbarOpen,
    type: snackbarType,
    message: snackbarMessage,
});

const mapDispatchToProps = (dispatch) => ({
    close: () => dispatch(toggleSnackbar({ open: false, message: null, type: 'default' })),
});

export default connect(mapStateToProps, mapDispatchToProps)(snackbar);
