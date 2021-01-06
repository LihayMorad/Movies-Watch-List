import React from 'react';

import TMDbLogo from '../../../assets/TMDbLogo.svg';

const Attributions = () => (
    <p className="attributions">
        This site uses the TMDb API but isn't endorsed or certified by&nbsp;
        <span>
            <img src={TMDbLogo} width="80" alt="TMDb Logo" />
        </span>
    </p>
);

export default Attributions;
