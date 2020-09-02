import React, { Component } from 'react';

import Header from '../../components/UI Elements/Header/Header';
import AccountMenu from '../../components/AccountMenu/AccountMenu';
import FiltersMenu from '../../components/FiltersMenu/FiltersMenu';
import MoviesContainer from '../MoviesContainer/MoviesContainer';
import Attributions from '../../components/UI Elements/Attributions/Attributions';
import Snackbar from '../../components/UI Elements/Snackbar/Snackbar';

import { Tooltip, Fab, Zoom } from '@material-ui/core';
import { Navigation as NavigationIcon } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

import TrackVisibility from 'react-on-screen';

const StyledTooltip = withStyles({ tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' } })(Tooltip);

class Layout extends Component {

    constructor(props) {
        super(props);
        this.topMenuRef = React.createRef();
    }

    state = {
        showScrollToMenuButton: false,
        watchingList: false
    }

    componentDidMount() {
        this.handleQueryParams();
    }

    scrollToMenu = () => { window.scrollTo({ top: this.topMenuRef.current.offsetTop, behavior: "smooth" }); }

    handleQueryParams = () => {
        const paramsString = window.location.search;
        const searchParams = new URLSearchParams(paramsString);
        this.setState({
            watchingList: searchParams.has("watchingList") && searchParams.get("watchingList") === "true",
            watchingListUserInfo: searchParams.has("user") && searchParams.get("user")
        });
    }

    render() {
        const { watchingList, watchingListUserInfo } = this.state;
        let scrollToMenu = null;
        let filtersMenu = null;
        let accountMenu = null;
        let snackbar = null;

        if (!watchingList) {
            scrollToMenu = (
                <StyledTooltip title="Scroll up to filters menu" disableFocusListener disableTouchListener TransitionComponent={Zoom}>
                    <Fab id="scrollToMenu" color="primary" variant="extended" size="small" onClick={this.scrollToMenu}>
                        <NavigationIcon />
                    </Fab>
                </StyledTooltip>
            );
            filtersMenu = (
                <TrackVisibility partialVisibility>
                    {({ isVisible }) => {
                        setTimeout(() => { this.setState({ showScrollToMenuButton: !isVisible }); }, 300);
                        return <div ref={this.topMenuRef}><FiltersMenu /></div>;
                    }}
                </TrackVisibility>
            );
            accountMenu = <AccountMenu />;
            snackbar = <Snackbar />;
        }

        return <>
            <Header />

            {accountMenu}

            {filtersMenu}

            <MoviesContainer watchingList={watchingList} watchingListUserInfo={watchingListUserInfo} />

            {this.state.showScrollToMenuButton && scrollToMenu}

            <Attributions />

            {snackbar}
        </>
    }
};

export default Layout;