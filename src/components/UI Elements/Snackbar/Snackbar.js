import React, { Component } from 'react';

import { connect } from 'react-redux';
import * as actionTypes from '../../../store/actions';

import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Fade from '@material-ui/core/Fade';

class SimpleSnackbar extends Component {

    handleClose = () => { this.props.onSnackbarToggle(false, "") }

    render() {

        return (
            <Snackbar
                id="snackbarRoot"
                style={{ margin: '15px auto' }}
                open={this.props.isSnackbarOpen}
                onClose={this.handleClose}
                message={this.props.snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                autoHideDuration={4000}
                TransitionComponent={Fade}
                action={[
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={this.handleClose}>
                        <CloseIcon />
                    </IconButton>
                ]}
            />
        );
    }
}

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
    onSnackbarToggle: (open, message) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message } })
})

export default connect(mapStateToProps, mapDispatchToProps)(SimpleSnackbar);