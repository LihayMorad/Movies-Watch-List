import React, { useState, useCallback } from 'react';

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
    tooltipPlacementBottom: { marginTop: '12px' },
    arrow: { color: 'black' },
})(Tooltip);

const AccountMenu = ({ toggleSnackbar }) => {
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const loggedInUser = AccountsService.GetLoggedInUser();
    const isOpen = !!menuAnchorEl;

    const open = useCallback((e) => {
        setMenuAnchorEl(e.currentTarget);
    }, []);

    const close = useCallback(() => {
        setMenuAnchorEl(null);
    }, []);

    const signIn = useCallback(() => {
        AccountsService.SignIn()
            .then((result) => {
                toggleSnackbar(
                    true,
                    `Hi ${result.additionalUserInfo.profile.name}, you are now logged in.`,
                    'information'
                );
                close();
                AnalyticsService({
                    category: 'User',
                    action: 'User Signed in with Google account',
                });
            })
            .catch(() => {
                toggleSnackbar(true, `Sign in error`, 'error');
            });
    }, [toggleSnackbar, close]);

    const signInAnonymously = useCallback(() => {
        AccountsService.SignInAnonymously()
            .then(() => {
                toggleSnackbar(true, `Hi, you are now logged in as a guest user.`, 'information');
                close();
                AnalyticsService({
                    category: 'User',
                    action: 'User Signed in anonymously',
                });
            })
            .catch(() => {
                toggleSnackbar(true, `Error! cannot sign in as a guest user.`, 'error');
            });
    }, [toggleSnackbar, close]);

    const linkAccount = useCallback(() => {
        AccountsService.LinkAccount()
            .then((result) => {
                toggleSnackbar(
                    true,
                    `You guest account was successfully linked with your Google account '${result.user.email}'.`,
                    'information'
                );
                close();
                AnalyticsService({
                    category: 'User',
                    action: 'User linked his anonymous account to his Google account',
                });
            })
            .catch((error) => {
                toggleSnackbar(
                    true,
                    `Error! Cannot link with Google account '${error.email}' because you've probably used it before. Try to login with this account.`,
                    'error'
                );
            });
    }, [toggleSnackbar, close]);

    const signOut = useCallback(() => {
        const loggedInUser = AccountsService.GetLoggedInUser();
        const accountMessage = loggedInUser.isAnonymous
            ? 'guest account ?\nPlease pay attention that your list will be lost! You can link your Google account to save it.'
            : `account '${loggedInUser.email}' ?`;
        if (window.confirm(`Are you sure you want to logout from your ${accountMessage}`)) {
            AccountsService.SignOut()
                .then(() => {
                    toggleSnackbar(true, 'You are now logged out', 'information');
                    close();
                    AnalyticsService({
                        category: 'User',
                        action: 'User signed out',
                    });
                })
                .catch(() => {
                    toggleSnackbar(true, `Sign out error`, 'error');
                });
        }
    }, [toggleSnackbar, close]);

    const getSignInOutButton = useCallback(() => {
        const loggedInUser = AccountsService.GetLoggedInUser();
        return (
            <MenuItem>
                {loggedInUser ? (
                    <Button
                        className="loggedInBtn btnPadding"
                        color="primary"
                        variant="contained"
                        onClick={signOut}
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
                            onClick={signIn}
                        >
                            <PersonIcon />
                            &nbsp;Sign in
                        </Button>
                    </StyledTooltip>
                )}
            </MenuItem>
        );
    }, [signIn, signOut]);

    const getLinkAccountButton = useCallback(
        () => (
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
                        onClick={linkAccount}
                    >
                        <LinkIcon />
                        &nbsp;Link with Google
                    </Button>
                </StyledTooltip>
            </MenuItem>
        ),
        [linkAccount]
    );

    const getSignInAnonymouslyButton = useCallback(
        () => (
            <MenuItem>
                <StyledTooltip title="Sign in anonymously" TransitionComponent={Zoom} arrow>
                    <Button
                        className="btnPadding"
                        color="default"
                        variant="contained"
                        onClick={signInAnonymously}
                    >
                        <PersonOutlineIcon />
                        &nbsp;Login as a guest
                    </Button>
                </StyledTooltip>
            </MenuItem>
        ),
        [signInAnonymously]
    );

    return (
        <>
            <IconButton className="accountMenu" color="primary" onClick={open}>
                <AccountCircle fontSize="large" />
            </IconButton>

            <Menu
                anchorEl={menuAnchorEl}
                open={isOpen}
                onClose={close}
                TransitionComponent={Fade}
                keepMounted
            >
                {getSignInOutButton()}
                {!loggedInUser && getSignInAnonymouslyButton()}
                {loggedInUser && loggedInUser.isAnonymous && getLinkAccountButton()}
            </Menu>
        </>
    );
};

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => ({
    toggleSnackbar: (open, message, type) => dispatch(toggleSnackbar({ open, message, type })),
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountMenu);
