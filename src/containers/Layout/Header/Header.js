import React from 'react';

import HeaderIMG from '../../../assets/HeaderIMG.png';

import './Header.css';

const headerStyle = { marginTop: '15px' };

const Header = props => {

    return (
        <div>
            <img src={HeaderIMG} alt={"Movies Playlist"} style={headerStyle}></img>
            <h1>My Movies Watchlist</h1>
        </div>
    );

}

export default Header;