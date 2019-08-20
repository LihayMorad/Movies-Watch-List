import React from 'react';

import youTubeIcon from '../../../../assets/youtube_icon.png';

import './MoviesResultsGrid.css';

const POSTER_BASE_URL = "http://image.tmdb.org/t/p/w300/";

const moviesResultsGrid = props => {
    let moviesSearchResultList = null;

    switch (props.type) {

        case "search":
            moviesSearchResultList = props.results.map(elem => {
                const hasPoster = elem.Poster && elem.Poster !== "N/A";
                const chosenMovie = props.imdbID === elem.imdbID;
                return (
                    <li key={elem.imdbID}
                        className={`movieElem ${chosenMovie && 'chosenMovie'}`}
                        onClick={() => { props.updateCurrentMovie(elem.imdbID, "", elem.Title, elem.Year); }}>
                        <img src={elem.Poster} alt={hasPoster ? "Movie poster" : "Movie poster not found"} />
                        <div className={`overlay ${!hasPoster && 'overlayBlack'}`}>
                            <h2>{elem.Title}</h2>
                            <h3>{elem.Year}</h3>
                        </div>
                        <img src={youTubeIcon} id="youTubeIcon" alt="YouTube icon"
                            onClick={e => { e.stopPropagation(); props.toggleWatchTrailer(`${elem.Title} ${elem.Year}`, elem.imdbID); }} />
                    </li>
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
                    <li key={elem.id}
                        className={`movieElem ${chosenMovie && 'chosenMovie'}`}
                        onClick={() => { props.getIMDBID(elem.id, elem.title, year); }}>
                        <img src={POSTER_BASE_URL + elem.poster_path} alt={hasPoster ? "Movie poster" : "Movie poster not found"} />
                        <div className={`overlay ${!hasPoster && 'overlayBlack'}`}>
                            <h2>{elem.title}</h2>
                            <h3>{year}</h3>
                        </div>
                        <img src={youTubeIcon} id="youTubeIcon" alt="YouTube icon"
                            onClick={e => { e.stopPropagation(); props.toggleWatchTrailer(`${elem.title} ${year}`, elem.id); }} />
                    </li>
                )
            });
            break;

        default: break;
    }

    return <ul id="moviesSearchResults">{moviesSearchResultList}</ul>;

}

export default moviesResultsGrid;