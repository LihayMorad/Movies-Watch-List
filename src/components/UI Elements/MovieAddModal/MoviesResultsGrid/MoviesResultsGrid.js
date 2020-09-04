import React from 'react';
import MoviesResultsItem from './MoviesResultsCard';

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500/';

const moviesResultsGrid = ({
    type,
    results,
    imdbID: selectedIMDBID,
    tmdbID,
    updateCurrentMovie,
    toggleWatchTrailer,
    getIMDBID,
}) => {
    let moviesSearchResultList = null;

    switch (type) {
        case 'search':
            moviesSearchResultList = results.map(({ imdbID, Poster, Title, Year }) => {
                const hasValidPoster = Poster && Poster !== 'N/A';
                const isSelectedMovie = selectedIMDBID === imdbID;
                return (
                    <MoviesResultsItem
                        key={imdbID}
                        id={imdbID}
                        isSelectedMovie={isSelectedMovie}
                        onClick={() => updateCurrentMovie(imdbID, '', Title, Year)}
                        poster={Poster}
                        hasValidPoster={hasValidPoster}
                        title={Title}
                        year={Year}
                        onTrailerClick={(e) => {
                            e.stopPropagation();
                            toggleWatchTrailer(`${Title} ${Year}`, imdbID);
                        }}
                    />
                );
            });
            break;

        case 'trending':
            moviesSearchResultList = results.map(({ id, poster_path, release_date, title }) => {
                const hasValidPoster = poster_path && poster_path !== 'N/A';
                const isSelectedMovie = tmdbID === id;
                const year = release_date && new Date(release_date).getFullYear();
                return (
                    <MoviesResultsItem
                        key={id}
                        isSelectedMovie={isSelectedMovie}
                        onClick={() => getIMDBID(id, title, year)}
                        poster={POSTER_BASE_URL + poster_path}
                        hasValidPoster={hasValidPoster}
                        title={title}
                        year={year}
                        onTrailerClick={(e) => {
                            e.stopPropagation();
                            toggleWatchTrailer(`${title} ${year}`, id);
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
