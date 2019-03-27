import React from 'react';

import './MoviesResultsGrid.css';

const moviesResultsGrid = props => {

    const moviesSearchResultList = props.results.map(elem => {
        return (elem.Poster !== "N/A" && <li key={elem.imdbID} style={{ listStyle: 'none' }} className={props.imdbID === elem.imdbID ? "movieElem chosenMovie" : "movieElem"}
            onClick={event => {
                props.updateCurrentMovie(elem.imdbID, elem.Title, elem.Year);
            }}>

            <img className={"img-responsive"} src={elem.Poster} alt={"Movie poster"} />
            <div className={"overlay"}>
                <h2>{elem.Title}</h2>
                <h3>{elem.Year}</h3>
            </div>

        </li>)
    });

    return (

        <ul id={"moviesSearchResults"}>
            {moviesSearchResultList}
        </ul>

    );

}


export default moviesResultsGrid;