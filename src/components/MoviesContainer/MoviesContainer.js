import React, { Component } from 'react';
// import axios from 'axios';

import Movie from '../Movie/Movie';
import UserMenu from '../UserMenu/UserMenu';
import MoviesSpinner from '../Spinners/MoviesSpinner/MoviesSpinner';

import { database } from '../../config/firebase';

import './MoviesContainer.css';

class MoviesContainer extends Component {

    state = {
        moviesData: [],
        moviesSorted: null,
        maxResults: 0,
        loading: true
    }

    componentDidMount() { // an example of OMDb http://www.omdbapi.com/?t=avatar&y=2003&apikey=2ac6a078

        // const GOOGLE_SHEET_API_URL = "https://content-sheets.googleapis.com/v4/spreadsheets/1PjtUDRc6u76YySXlwN_oM9rgc2-xKdjQBHJKiy9unuI/values/A1%3A2?key=AIzaSyCFE7t_jrVgeC2erH83J65tIxMKcivfWDc";
        // ALSO WORKING: "https://content-sheets.googleapis.com/v4/spreadsheets/1PjtUDRc6u76YySXlwN_oM9rgc2-xKdjQBHJKiy9unuI/values:batchGet?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&ranges=A1%3AZ&majorDimension=ROWS&key=AIzaSyCFE7t_jrVgeC2erH83J65tIxMKcivfWDc"

        // from id 0 to 5 include :'https://movies-to-watch-26077.firebaseio.com/movies.json?orderBy="$key"&startAt="0"&endAt="5"'
        // all :'https://movies-to-watch-26077.firebaseio.com/movies.json?'

        // const FIREBASE_URL = `https://movies-to-watch-26077.firebaseio.com/mymovies.json?orderBy="$key"&startAt="${this.state.startAt}"&endAt="${this.state.endAt}"`;
        // const FIREBASE_URL = 'https://movies-to-watch-26077.firebaseio.com/mymovies.json?orderBy="$key"&startAt="50"&endAt="55"';

        database.ref('/mymovies').limitToFirst(12).on('value',
            data => { this.getMoviesToWatch(data.val()); },
            error => { console.log(error); });
    }

    componentDidUpdate() {
        console.log('[componentDidUpdate] this.state.moviesData: ', this.state.moviesData);
    }

    handleDelete = movieID => {
        // console.log('movieID: ', movieID);
        let indexToDelete = "";
        let updatedMoviesData = this.state.moviesData;
        updatedMoviesData.filter((movie, index) => {
            if (movieID === movie.key) indexToDelete = index;
        }
        );

        updatedMoviesData.splice(indexToDelete, 1);

        this.setState({ moviesData: updatedMoviesData });
        database.ref('/mymovies/' + movieID).remove(alert("Delete successfuly"));
    }

    getMoviesToWatch = (firebaseResponse) => {

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

        this.setState({ moviesData: movies, loading: false });

    }

    sortMovies = (filter, order, year) => {
        // console.log('year: ', year);
        console.log('this.state.moviesData: ', this.state.moviesData);
        // console.log('this.state.moviesSorted: ', this.state.moviesSorted);

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
        // console.log('this.state.moviesData', this.state.moviesData);

        if (this.state.loading) {
            return <MoviesSpinner />
        }

        const years = this.state.moviesData.map(movie => movie.props.releaseYear).sort((a, b) => b - a);

        return (
            <div>
                <div className={"UserMenu"}>
                    <UserMenu sortMovies={this.sortMovies} years={years} />
                </div>
                <div className={"MoviesGallery"}>
                    {this.state.moviesSorted ? this.state.moviesSorted : this.state.moviesData}
                </div>
            </div>
        );

    }

}

export default MoviesContainer;