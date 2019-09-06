import React, { Component } from 'react';

import Header from '../../components/UI Elements/Header/Header';
import AccountMenu from '../../components/AccountMenu/AccountMenu';
import FiltersMenu from '../../components/FiltersMenu/FiltersMenu';
import MoviesContainer from '../MoviesContainer/MoviesContainer';
import Attributions from '../../components/UI Elements/Attributions/Attributions';
import Snackbar from '../../components/UI Elements/Snackbar/Snackbar';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';
import TrackVisibility from 'react-on-screen';
import Zoom from '@material-ui/core/Zoom';

import './Layout.css';

import { withStyles } from '@material-ui/core/styles';

const StyledTooltip = withStyles({ tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' } })(Tooltip);

class Layout extends Component {

    state = {
        showScrollToMenuButton: false
    }

    componentDidMount() { this.topMenuRef = React.createRef(); }

    scrollToMenu = () => { window.scrollTo({ top: this.topMenuRef.current.offsetTop, behavior: "smooth" }); }

    render() {

        const scrollToMenu = <StyledTooltip title="Scroll to the top menu" disableFocusListener disableTouchListener TransitionComponent={Zoom}>
            <Fab id="scrollToMenu" color="primary" variant="extended" size="small" onClick={this.scrollToMenu}>
                <NavigationIcon />
            </Fab>
        </StyledTooltip>;

        const filtersMenu = ({ isVisible }) => {
            setTimeout(() => { this.setState({ showScrollToMenuButton: !isVisible }); }, 300);
            return <div ref={this.topMenuRef}><FiltersMenu /></div>;
        }

        return <>
            <Header />

            <AccountMenu />

            <TrackVisibility partialVisibility>
                {filtersMenu}
            </TrackVisibility>

            <MoviesContainer />

            {this.state.showScrollToMenuButton && scrollToMenu}

            <Attributions />

            <Snackbar />
        </>
    }
};

export default Layout;