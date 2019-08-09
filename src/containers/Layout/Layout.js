import React from 'react';

import Header from './Header/Header';
import MoviesContainer from '../../components/MoviesContainer/MoviesContainer';
import Attributions from '../../components/Attributions/Attributions';

import './Layout.css';

const Layout = () => (
    <>
        <Header />
        <MoviesContainer />
        <Attributions />
    </>
);

export default Layout;