import React from 'react';

import Header from './Header/Header';
import MoviesContainer from '../../components/MoviesContainer/MoviesContainer';

import './Layout.css';

const Layout = () => (
    <React.Fragment>
        <Header />
        <MoviesContainer />
    </React.Fragment>
);

export default Layout;