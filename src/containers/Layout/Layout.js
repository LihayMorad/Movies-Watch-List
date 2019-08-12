import React, { Component } from 'react';

import Header from './Header/Header';
import UserMenu from '../../components/UI Elements/UserMenu/UserMenu';
import MoviesContainer from '../../components/MoviesContainer/MoviesContainer';
import Attributions from '../../components/Attributions/Attributions';

import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';
import TrackVisibility from 'react-on-screen';

class Layout extends Component {

    state = {
        showScrollToMenuButton: false
    }

    componentDidMount() {
        this.topMenuRef = React.createRef();
    }

    scrollToMenu = () => { window.scrollTo({ top: this.topMenuRef.current.offsetTop, behavior: "smooth" }); }

    render() {

        const { showScrollToMenuButton } = this.state;

        const scrollToMenu = <Fab
            id="scrollToMenu" color="primary" variant="extended" size="small" title="Scroll to the top menu"
            onClick={this.scrollToMenu}><NavigationIcon />
        </Fab>;

        const userMenu = ({ isVisible }) => {
            setTimeout(() => { this.setState({ showScrollToMenuButton: !isVisible }); }, 300);
            return <div ref={this.topMenuRef}><UserMenu /></div>;
        }

        return (

            <>
                <Header />

                <TrackVisibility partialVisibility>
                    {userMenu}
                </TrackVisibility>

                <MoviesContainer />

                {showScrollToMenuButton && scrollToMenu}

                <Attributions />
            </>
        )
    }
};

export default Layout;