import React, { Component } from 'react';

import './MoviesResultsGrid.css';

class moviesResultsGrid extends Component {

    render() {

        const moviesSearchResultList = this.props.results.map(elem => {
            return (elem.Poster !== "N/A" && <li key={elem.imdbID} style={{ listStyle: 'none' }} className={this.props.imdbID === elem.imdbID ? "movieElem chosenMovie" : "movieElem"}
                onClick={event => {
                    // if () event.currentTarget.classList.toggle("chosenIMG");
                    // console.log(this.state.imdbID);
                    // console.log('event.currentTarget: ', event.currentTarget);
                    this.props.updateCurrentMovie(elem.imdbID, elem.Year);
                }}>

                <img className={"img-responsive"} src={elem.Poster} alt={"Movie poster"} />
                <div className={"overlay"}>
                    <h2>{elem.Title}</h2>
                    <h3>{elem.Year}</h3>
                </div>

            </li>)
        })

        return (

            <ul id={"moviesSearchResults"}>
                {moviesSearchResultList}
            </ul>

        );

    }
}

export default moviesResultsGrid;