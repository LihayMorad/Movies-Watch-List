import React from 'react';

import HeaderIMG from '../../../assets/HeaderIMG.png';

const Header = props => {
    return(

    <div>
        <img src={HeaderIMG} alt={"Movies Playlist"}style={{marginTop:'15px'}}></img>
        <h1 style={{margin:'3px'}}>My Movies Watchlist</h1>
    </div>

    );
}

export default Header;