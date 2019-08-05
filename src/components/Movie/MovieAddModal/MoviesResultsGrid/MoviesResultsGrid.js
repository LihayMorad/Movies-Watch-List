import React from 'react';

import './MoviesResultsGrid.css';

const moviesResultsGrid = props => {

    const moviesSearchResultList = props.results.map(elem => {
        const hasPoster = elem.Poster !== "N/A";
        const chosenMovie = props.imdbID === elem.imdbID;
        return (
            <li key={elem.imdbID}
                className={`movieElem ${chosenMovie && 'chosenMovie'}`}
                onClick={() => { props.updateCurrentMovie(elem.imdbID, elem.Title, elem.Year); }}>
                <img src={elem.Poster} alt={hasPoster ? "Movie poster" : "Movie poster not found"} />
                <div className={`overlay ${!hasPoster && 'overlayBlack'}`}>
                    <h2>{elem.Title}</h2>
                    <h3>{elem.Year}</h3>
                </div>
            </li>
        )
    });

    return (
        <ul id={"moviesSearchResults"}>
            {moviesSearchResultList}
        </ul>
    );

}

export default moviesResultsGrid;