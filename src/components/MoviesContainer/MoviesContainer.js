import React, { Component } from 'react';
import axios from 'axios';

import Movie from '../Movie/Movie';
import UserMenu from '../UserMenu/UserMenu';
import Spinner from '../Spinner/Spinner';

import './MoviesContainer.css';

class MoviesContainer extends Component {

    state = {
        moviesData: [],
        loading: true
    }

    componentDidMount() { // an example of OMDb http://www.omdbapi.com/?t=avatar&y=2003&apikey=2ac6a078
        // console.log('MoviesContainer [componentDidMount]');

        // const GOOGLE_SHEET_API_URL = "https://content-sheets.googleapis.com/v4/spreadsheets/1PjtUDRc6u76YySXlwN_oM9rgc2-xKdjQBHJKiy9unuI/values/A1%3A2?key=AIzaSyCFE7t_jrVgeC2erH83J65tIxMKcivfWDc";
        // ALSO WORKING: "https://content-sheets.googleapis.com/v4/spreadsheets/1PjtUDRc6u76YySXlwN_oM9rgc2-xKdjQBHJKiy9unuI/values:batchGet?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&ranges=A1%3AZ&majorDimension=ROWS&key=AIzaSyCFE7t_jrVgeC2erH83J65tIxMKcivfWDc"

        // from id 0 to 5 include :'https://movies-to-watch-26077.firebaseio.com/movies.json?orderBy="$key"&startAt="0"&endAt="5"'
        // all :'https://movies-to-watch-26077.firebaseio.com/movies.json?'

        const FIREBASE_URL = 'https://movies-to-watch-26077.firebaseio.com/movies.json';
        this.getMoviesToWatch(FIREBASE_URL);
    }

    // componentDidUpdate() {
    //     console.log(this.state.moviesData);
    // }

    async getMoviesToWatch(firebaseURL) {
        const firebaseResponse = await axios.get(firebaseURL);
        try {
            let firebaseData = Array.isArray(firebaseResponse.data) ?
                firebaseResponse.data : Object.keys(firebaseResponse.data).map(key => { return firebaseResponse.data[key] });
            console.log('firebaseData: ', firebaseData);

            const movies = firebaseData.map((movie => {
                return <Movie
                    key={`${movie['NameEng']}_${movie['Year']}`}
                    nameHeb={movie['NameHeb']}
                    nameEng={movie['NameEng']}
                    releaseYear={movie['Year']}
                    trailerURL={movie['TrailerURL']}
                    comments={movie['Comments']}
                />
            }));

            this.setState({ moviesData: movies, loading: false });

        } catch (error) {
            console.error('error: ', error);
        }
    }

    sortMovies = (filter, order) => {
        console.log('order: ', order);
        console.log('sortBy: ', filter);

        let sortByPicked = "", orderPicked = "";

        switch (filter) {
            case "nameEng": sortByPicked = "nameEng"; break;
            case "nameHeb": sortByPicked = "nameHeb"; break;
            default: sortByPicked = "releaseYear";
        }

        orderPicked = order === "ascending" ? "ascending" : "descending";

        let sortedMovies = this.state.moviesData.slice().filter(movie => !movie.Error).sort((a, b) => {

            const movie1 = a.props[sortByPicked];
            const movie2 = b.props[sortByPicked];

            console.log('movie2', movie2);
            console.log('movie1', movie1);

            if (sortByPicked === "releaseYear") {
                return orderPicked === "descending" ? movie2 - movie1 : movie1 - movie2;
            }
            return orderPicked === "descending" ?
                movie2 > movie1 ? 1 : movie2 === movie1 ? 0 : -1 :
                movie1 < movie2 ? -1 : movie2 === movie1 ? 0 : 1;

        });

        this.setState({ moviesData: sortedMovies });
    }

    render() {
        // console.log('this.state.moviesData', this.state.moviesData);

        if (this.state.loading) {
            return <Spinner />
        }

        return (
            <div>
                <div className={"UserMenu"}>
                    <UserMenu sortMovies={this.sortMovies} />
                </div>
                <div className={"MoviesGallery"}>
                    {this.state.moviesData}
                </div>
            </div>
        );

    }

}

export default MoviesContainer;