import React from 'react';

import HeaderIMG from '../../../assets/HeaderIMG.png';

import './Header.css';

const Header = () => (
    <>
        <img src={HeaderIMG} alt={"Movies Playlist"} id="mainHeaderImg" />
        <h1>My Movies Watchlist</h1>
    </>
);

export default Header;