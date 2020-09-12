import React, { Component } from 'react';

import { connect } from 'react-redux';
import { toggleSnackbar } from '../../store/actions';

import AccountsService from '../../Services/AccountsService';
import AnalyticsService from '../../Services/AnalyticsService';

import { Menu, MenuItem, Tooltip, Button, IconButton, Fade, Zoom } from '@material-ui/core';
import {
    PersonOutline as PersonOutlineIcon,
    Person as PersonIcon,
    Link as LinkIcon,
    AccountCircle,
} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const StyledTooltip = withStyles({
    tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' },
    tooltipPlacementBottom: { marginTop: '5px' },
    arrow: { color: 'black' },
})(Tooltip);

class AccountMenu extends Component {
    state = {
        menuAnchorEl: null,
    };

    signIn = () => {
        AccountsService.SignIn()
            .then((result) => {
                this.props.toggleSnackbar(
                    true,
                    `Hi ${result.additionalUserInfo.profile.name}, you are now logged in.`,
                    'information'
                );
                this.close();
                AnalyticsService({
                    category: 'User',
                    action: 'User Signed in with Google account',
                });
            })
            .catch(() => {
                this.props.toggleSnackbar(true, `Sign in error`, 'error');
            });
    };

    signInAnonymously = () => {
        AccountsService.SignInAnonymously()
            .then(() => {
                this.props.toggleSnackbar(
                    true,
                    `Hi, you are now logged in as a guest user.`,
                    'information'
                );
                this.close();
                AnalyticsService({
                    category: 'User',
                    action: 'User Signed in anonymously',
                });
            })
            .catch(() => {
                this.props.toggleSnackbar(true, `Error! cannot sign in as a guest user.`, 'error');
            });
    };

    linkAccount = () => {
        AccountsService.LinkAccount()
            .then((result) => {
                this.props.toggleSnackbar(
                    true,
                    `You guest account was successfully linked with your Google account '${result.user.email}'.`,
                    'information'
                );
                this.close();
                AnalyticsService({
                    category: 'User',
                    action: 'User linked his anonymous account to his Google account',
                });
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    true,
                    `Error! Cannot link with Google account '${error.email}' because you've probably used it before. Try to login with this account.`,
                    'error'
                );
            });
    };

    signOut = () => {
        const loggedInUser = AccountsService.GetLoggedInUser();
        const accountMessage = loggedInUser.isAnonymous
            ? 'guest account ?\nPlease pay attention that your list will be lost! You can link your Google account to save it.'
            : `account '${loggedInUser.email}' ?`;
        if (window.confirm(`Are you sure you want to logout from your ${accountMessage}`)) {
            AccountsService.SignOut()
                .then(() => {
                    this.props.toggleSnackbar(true, 'You are now logged out', 'information');
                    this.close();
                    AnalyticsService({
                        category: 'User',
                        action: 'User signed out',
                    });
                })
                .catch(() => {
                    this.props.toggleSnackbar(true, `Sign out error`, 'error');
                });
        }
    };

    open = (e) => {
        this.setState({ menuAnchorEl: e.currentTarget });
    };

    close = () => {
        this.setState({ menuAnchorEl: null });
    };

    getSignInOutButton = () => {
        const loggedInUser = AccountsService.GetLoggedInUser();
        return (
            <MenuItem>
                {loggedInUser ? (
                    <Button
                        id="loggedInBtn"
                        className="btnPadding"
                        color="primary"
                        variant="contained"
                        onClick={this.signOut}
                    >
                        {loggedInUser.isAnonymous ? (
                            <>
                                <PersonOutlineIcon />
                                &nbsp;Logout from Guest
                            </>
                        ) : (
                            <>
                                <PersonIcon />
                                &nbsp;Logout from {loggedInUser.displayName || loggedInUser.email}
                            </>
                        )}
                    </Button>
                ) : (
                    <StyledTooltip
                        title="Sign in with your Google account"
                        TransitionComponent={Zoom}
                        arrow
                    >
                        <Button
                            className="btnPadding"
                            color="primary"
                            variant="contained"
                            onClick={this.signIn}
                        >
                            <PersonIcon />
                            &nbsp;Sign in
                        </Button>
                    </StyledTooltip>
                )}
            </MenuItem>
        );
    };

    getLinkAccountButton = () => (
        <MenuItem>
            <StyledTooltip
                title="Link this guest account with your Google account to save your list"
                TransitionComponent={Zoom}
                arrow
            >
                <Button
                    className="btnPadding"
                    color="primary"
                    variant="contained"
                    onClick={this.linkAccount}
                >
                    <LinkIcon />
                    &nbsp;Link with Google
                </Button>
            </StyledTooltip>
        </MenuItem>
    );

    getSignInAnonymouslyButton = () => (
        <MenuItem>
            <StyledTooltip title="Sign in anonymously" TransitionComponent={Zoom} arrow>
                <Button
                    className="btnPadding"
                    color="default"
                    variant="contained"
                    onClick={this.signInAnonymously}
                >
                    <PersonOutlineIcon />
                    &nbsp;Login as a guest
                </Button>
            </StyledTooltip>
        </MenuItem>
    );

    render() {
        const loggedInUser = AccountsService.GetLoggedInUser();
        const { menuAnchorEl } = this.state;
        const isOpen = !!menuAnchorEl;

        return (
            <>
                <IconButton id="accountMenu" color="primary" onClick={this.open}>
                    <AccountCircle fontSize="large" />
                </IconButton>

                <Menu
                    anchorEl={menuAnchorEl}
                    open={isOpen}
                    onClose={this.close}
                    TransitionComponent={Fade}
                    keepMounted
                >
                    {this.getSignInOutButton()}
                    {!loggedInUser && this.getSignInAnonymouslyButton()}
                    {loggedInUser && loggedInUser.isAnonymous && this.getLinkAccountButton()}
                </Menu>
            </>
        );
    }
}

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => ({
    toggleSnackbar: (open, message, type) => dispatch(toggleSnackbar({ open, message, type })),
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountMenu);
