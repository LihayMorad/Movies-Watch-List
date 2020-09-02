import React from 'react';

import { Tooltip, Zoom } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import youTubeIcon from '../../../../assets/youtube_icon.png';

const StyledTooltip = withStyles({
    tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' },
    tooltipPlacementBottom: { marginTop: '-27px' },
})(Tooltip);

const moviesResultsCard = ({
    id,
    isSelectedMovie,
    onClick,
    poster,
    hasValidPoster,
    title,
    year,
    onTrailerClick,
}) => {
    return (
        <StyledTooltip title="Click to add this movie" TransitionComponent={Zoom} key={id}>
            <li className={`movieElem ${isSelectedMovie && 'chosenMovie'}`} onClick={onClick}>
                <img
                    src={poster}
                    alt={hasValidPoster ? 'Movie poster' : 'Movie poster not found'}
                />
                <div className={`overlay ${!hasValidPoster && 'overlay-black'}`}>
                    <h2>{title}</h2>
                    <h3>{year}</h3>
                </div>
                <img
                    src={youTubeIcon}
                    id="youTubeIcon"
                    alt="YouTube icon"
                    title="Click to watch the trailer"
                    onClick={onTrailerClick}
                />
            </li>
        </StyledTooltip>
    );
};

export default moviesResultsCard;
