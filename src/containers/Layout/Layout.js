import React, { Component } from 'react';

import Header from './Header/Header';
import MoviesContainer from '../../components/MoviesContainer/MoviesContainer';

import MovieTabs from '../../components/Movie/MovieTabs/MovieTabs';
import Aaa from './aaa';

import './Layout.css';

class Layout extends Component {

    render() {

        return (
            <div>
                <Header />
                <MoviesContainer />
                {/* <Aaa /> */}
            </div>
        );

    }
}

export default Layout;