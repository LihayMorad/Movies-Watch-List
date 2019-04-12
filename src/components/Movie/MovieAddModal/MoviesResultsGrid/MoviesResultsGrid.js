import React from 'react';

import './MoviesResultsGrid.css';

const moviesResultsGrid = props => {

    const moviesSearchResultList = props.results.map(elem => {
        return (
            <li key={elem.imdbID} style={{ listStyle: 'none', cursor: 'pointer' }}
                className={props.imdbID === elem.imdbID ? "movieElem chosenMovie" : "movieElem"}
                onClick={event => { props.updateCurrentMovie(elem.imdbID, elem.Title, elem.Year); }}>

                <img src={elem.Poster} alt={elem.Poster !== "N/A" ? "Movie poster" : "Movie poster not found"} />
                <div className={"overlay"}>
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