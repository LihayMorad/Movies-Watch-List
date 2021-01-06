import React from 'react';

import HeaderIMG from '../../../assets/HeaderIMG.png';

const Header = () => (
    <a href="/">
        <img className="headerLogo" src={HeaderIMG} alt="Movies Watch List" />
    </a>
);

export default Header;
