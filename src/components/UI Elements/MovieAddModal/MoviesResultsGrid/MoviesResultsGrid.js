import React from 'react';

import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';

import youTubeIcon from '../../../../assets/youtube_icon.png';

import { withStyles } from '@material-ui/core/styles';
import './MoviesResultsGrid.css';

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w300/";

const StyledTooltip = withStyles({ tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' }, tooltipPlacementBottom: { marginTop: '-27px' } })(Tooltip);

const moviesResultsGrid = props => {
    let moviesSearchResultList = null;

    switch (props.type) {

        case "search":
            moviesSearchResultList = props.results.map(elem => {
                const hasPoster = elem.Poster && elem.Poster !== "N/A";
                const chosenMovie = props.imdbID === elem.imdbID;
                return (
                    <StyledTooltip title="Click to add this movie" TransitionComponent={Zoom} key={elem.imdbID}>
                        <li className={`movieElem ${chosenMovie && 'chosenMovie'}`}
                            onClick={() => { props.updateCurrentMovie(elem.imdbID, "", elem.Title, elem.Year); }}>
                            <img src={elem.Poster} alt={hasPoster ? "Movie poster" : "Movie poster not found"} />
                            <div className={`overlay ${!hasPoster && 'overlayBlack'}`}>
                                <h2>{elem.Title}</h2>
                                <h3>{elem.Year}</h3>
                            </div>
                            <img src={youTubeIcon} id="youTubeIcon" alt="YouTube icon" title="Click to watch the trailer"
                                onClick={e => { e.stopPropagation(); props.toggleWatchTrailer(`${elem.Title} ${elem.Year}`, elem.imdbID); }} />
                        </li>
                    </StyledTooltip>
                )
            });
            break;

        case "trending":
            moviesSearchResultList = props.results.map(elem => {
                const hasPoster = elem.poster_path && elem.poster_path !== "N/A";
                const chosenMovie = props.tmdbID === elem.id;
                const releaseDate = elem.release_date && new Date(elem.release_date);
                const year = releaseDate.getFullYear();
                return (
                    <StyledTooltip title="Click to add this movie" TransitionComponent={Zoom} key={elem.id}>
                        <li className={`movieElem ${chosenMovie && 'chosenMovie'}`}
                            onClick={() => { props.getIMDBID(elem.id, elem.title, year); }}>
                            <img src={POSTER_BASE_URL + elem.poster_path} alt={hasPoster ? "Movie poster" : "Movie poster not found"} />
                            <div className={`overlay ${!hasPoster && 'overlayBlack'}`}>
                                <h2>{elem.title}</h2>
                                <h3>{year}</h3>
                            </div>
                            <img src={youTubeIcon} id="youTubeIcon" alt="YouTube icon" title="Click to watch the trailer"
                                onClick={e => { e.stopPropagation(); props.toggleWatchTrailer(`${elem.title} ${year}`, elem.id); }} />
                        </li>
                    </StyledTooltip>
                )
            });
            break;

        default: break;
    }

    return <ul id="moviesSearchResults">{moviesSearchResultList}</ul>;

}

export default moviesResultsGrid;