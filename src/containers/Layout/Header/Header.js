import React from 'react';

import HeaderIMG from '../../../assets/HeaderIMG.png';

import './Header.css';

const Header = () => (
    <React.Fragment>
        <img src={HeaderIMG} alt={"Movies Playlist"} id="mainHeaderImg" />
        <h1>My Movies Watchlist</h1>
    </React.Fragment>
);

export default Header;