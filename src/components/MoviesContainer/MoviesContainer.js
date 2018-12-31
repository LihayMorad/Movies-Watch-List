import React, { PureComponent } from 'react';
// import axios from 'axios';

import Movie from '../Movie/Movie';
import UserMenu from '../UserMenu/UserMenu';
import MoviesSpinner from '../Spinners/MoviesSpinner/MoviesSpinner';

import { database } from '../../config/firebase';

import './MoviesContainer.css';

class MoviesContainer extends PureComponent {

    state = {
        moviesData: [],
        moviesSorted: null,
        maxResults: 10,
        addingMovie: false,
        loading: true
    }

    componentDidMount() { // an example of OMDb http://www.omdbapi.com/?t=avatar&y=2003&apikey=2ac6a078

        // const GOOGLE_SHEET_API_URL = "https://content-sheets.googleapis.com/v4/spreadsheets/1PjtUDRc6u76YySXlwN_oM9rgc2-xKdjQBHJKiy9unuI/values/A1%3A2?key=AIzaSyCFE7t_jrVgeC2erH83J65tIxMKcivfWDc";
        // ALSO WORKING: "https://content-sheets.googleapis.com/v4/spreadsheets/1PjtUDRc6u76YySXlwN_oM9rgc2-xKdjQBHJKiy9unuI/values:batchGet?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&ranges=A1%3AZ&majorDimension=ROWS&key=AIzaSyCFE7t_jrVgeC2erH83J65tIxMKcivfWDc"

        // from id 0 to 5 include :'https://movies-to-watch-26077.firebaseio.com/movies.json?orderBy="$key"&startAt="0"&endAt="5"'
        // all :'https://movies-to-watch-26077.firebaseio.com/movies.json?'

        // const FIREBASE_URL = 'https://movies-to-watch-26077.firebaseio.com/mymovies.json?orderBy="$key"&startAt="50"&endAt="55"';

        this.getMoviesToWatch("releaseYear", "descending", "All", this.state.maxResults);
    }

    componentDidUpdate() { console.log('[componentDidUpdate] this.state.moviesData: ', this.state.moviesData); }

    handleDelete = movieID => {
        let deletedMovieDetails = "";
        let updatedMoviesData = this.state.moviesData.slice(); // same as ES6 [...this.state.moviesData]

        updatedMoviesData = updatedMoviesData.filter(movie => {
            if (movieID === movie.key) {
                deletedMovieDetails = `${movie.props.nameEng} (${movie.props.releaseYear})`;
                return false;
            }
            return true;
        });

        this.setState({ moviesData: updatedMoviesData }, () => {
            console.log('[handleDelete] DB REMOVE');
            database.ref('/mymovies/' + movieID).remove(alert(`'${deletedMovieDetails}' deleted successfully`))
        });
    }

    handleMovieAdd = details => {
        console.log('[handleDelete] DB ADD');
        database.ref('/mymovies').push(details, () => { this.toggleMovieAdd(); });
    }

    toggleMovieAdd = () => { this.setState({ addingMovie: !this.state.addingMovie }); }

    getMoviesToWatch = (filter, order, year, maxResults) => {

        // send request to db only if maxResults has changed or entering the website
        if (maxResults !== this.state.maxResults || this.state.moviesData.length === 0)
            this.setState({ maxResults: maxResults, loading: true }, () => {
                database.ref('/mymovies').limitToFirst(this.state.maxResults).on('value', data => {
                    console.log('[getMoviesToWatch] DB GET');
                    this.setMoviesToWatch(data.val(), filter, order, year);
                }, error => { console.log(error); });
            });
        else
            this.sortMovies(filter, order, year);
    }

    setMoviesToWatch = (firebaseResponse, filter, order, year) => {

        let firebaseData = [];
        Object.keys(firebaseResponse).map(key => { firebaseData.push({ key, ...firebaseResponse[key] }) });

        const movies = firebaseData.map((movie => {
            return <Movie
                key={movie['key']}
                dbID={movie['key']}
                nameHeb={movie['NameHeb']}
                nameEng={movie['NameEng']}
                releaseYear={movie['Year']}
                trailerURL={movie['TrailerURL']}
                comments={movie['Comments']}
                delete={this.handleDelete}
            />
        }));

        this.setState({ moviesData: movies, loading: false }, () => { this.sortMovies(filter, order, year); });
    }

    sortMovies = (filter, order, year) => {

        let sortedMovies = this.state.moviesData.slice().filter(movie => !movie.Error && (year === movie.props.releaseYear || year === "All")).sort((a, b) => {

            const movie1 = a.props[filter];
            const movie2 = b.props[filter];

            if (filter === "releaseYear") {
                return order === "descending" ? movie2 - movie1 : movie1 - movie2;
            }
            return order === "descending"
                ?
                movie2 > movie1 ? 1 : movie2 === movie1 ? 0 : -1
                :
                movie1 < movie2 ? -1 : movie2 === movie1 ? 0 : 1;
        });

        this.setState({ moviesSorted: sortedMovies });
    }

    render() {

        const years = this.state.moviesData.map(movie => movie.props.releaseYear).sort((a, b) => b - a);

        return (
            <div>
                <div className={"UserMenu"}>
                    <UserMenu isOpen={this.state.addingMovie} toggle={this.toggleMovieAdd}
                        addMovie={(details) => { this.handleMovieAdd(details) }}
                        getMovies={this.getMoviesToWatch} years={years}
                        maxResults={this.state.maxResults} handleMaxResults={this.handleMaxResults}
                    />
                </div>

                {!this.state.loading ?
                    <div className={"MoviesGallery"}>
                        {this.state.moviesSorted ? this.state.moviesSorted : this.state.moviesData}
                    </div>
                    : <MoviesSpinner />
                }
            </div>
        );

    }

}

export default MoviesContainer;