import React from 'react';

import Header from './Header/Header';
import MoviesContainer from '../../components/MoviesContainer/MoviesContainer';

import './Layout.css';

const Layout = () => (
    <>
        <Header />
        <MoviesContainer />
    </>
);

export default Layout;