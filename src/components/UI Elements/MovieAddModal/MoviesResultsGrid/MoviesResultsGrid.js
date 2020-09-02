import React from 'react';
import MoviesResultsItem from './MoviesResultsCard';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500/';

const moviesResultsGrid = ({
    type,
    results,
    imdbID,
    tmdbID,
    updateCurrentMovie,
    toggleWatchTrailer,
    getIMDBID,
}) => {
    let moviesSearchResultList = null;

    switch (type) {
        case 'search':
            moviesSearchResultList = results.map((elem) => {
                const hasValidPoster = elem.Poster && elem.Poster !== 'N/A';
                const isSelectedMovie = imdbID === elem.imdbID;
                return (
                    <MoviesResultsItem
                        key={elem.imdbID}
                        id={elem.imdbID}
                        isSelectedMovie={isSelectedMovie}
                        onClick={() => updateCurrentMovie(elem.imdbID, '', elem.Title, elem.Year)}
                        poster={elem.Poster}
                        hasValidPoster={hasValidPoster}
                        title={elem.Title}
                        year={elem.Year}
                        onTrailerClick={(e) => {
                            e.stopPropagation();
                            toggleWatchTrailer(`${elem.Title} ${elem.Year}`, elem.imdbID);
                        }}
                    />
                );
            });
            break;

        case 'trending':
            moviesSearchResultList = results.map((elem) => {
                const hasValidPoster = elem.poster_path && elem.poster_path !== 'N/A';
                const isSelectedMovie = tmdbID === elem.id;
                const releaseDate = elem.release_date && new Date(elem.release_date);
                const year = releaseDate.getFullYear();
                return (
                    <MoviesResultsItem
                        key={elem.id}
                        isSelectedMovie={isSelectedMovie}
                        onClick={() => {
                            getIMDBID(elem.id, elem.title, year);
                        }}
                        poster={POSTER_BASE_URL + elem.poster_path}
                        hasValidPoster={hasValidPoster}
                        title={elem.title}
                        year={year}
                        onTrailerClick={(e) => {
                            e.stopPropagation();
                            toggleWatchTrailer(`${elem.title} ${year}`, elem.id);
                        }}
                    />
                );
            });
            break;

        default:
            break;
    }

    return <ul id="moviesSearchResults">{moviesSearchResultList}</ul>;
};

export default moviesResultsGrid;
