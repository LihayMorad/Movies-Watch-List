import React, { Component } from 'react';

import Header from './Header/Header';
import MoviesContainer from '../../components/MoviesContainer/MoviesContainer';

import './Layout.css';

class Layout extends Component {

    render() {

        return (
            <div>
                <Header />
                <MoviesContainer />
            </div>
        );

    }
}

export default Layout;