import React from 'react';

import TMDbLogo from '../../assets/TMDbLogo.png';

import './Attributions.css';

export default () => (
    <p id="attributions">
        This site uses the TMDb API but isn't endorsed or certified by TMDb.
        <img src={TMDbLogo} width="80" alt="TMDb Logo" />
    </p>
)