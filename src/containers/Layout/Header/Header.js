import React from 'react';

import HeaderIMG from '../../../assets/HeaderIMG.png';

import './Header.css';

export default () => (
    <>
        <img src={HeaderIMG} alt={"Movies Playlist"} id="mainHeaderImg" />
        <h1>My Movies Watchlist</h1>
    </>
);