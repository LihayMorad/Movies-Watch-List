import React, { Component } from 'react';
import axios from 'axios';

import Movie from '../Movie/Movie';
import Spinner from '../Spinner/Spinner';

import './MoviesContainer.css';

class MoviesContainer extends Component {

    state = {
        moviesData: [],
        loading: true
    }

    componentDidMount() { // an example of OMDb http://www.omdbapi.com/?t=avatar&y=2003&apikey=2ac6a078
        // console.log('MoviesContainer [componentDidMount]');

        const GOOGLE_SHEET_API_URL = "https://content-sheets.googleapis.com/v4/spreadsheets/1PjtUDRc6u76YySXlwN_oM9rgc2-xKdjQBHJKiy9unuI/values/A1%3A1?key=AIzaSyCFE7t_jrVgeC2erH83J65tIxMKcivfWDc";
        // ALSO WORKING: "https://content-sheets.googleapis.com/v4/spreadsheets/1PjtUDRc6u76YySXlwN_oM9rgc2-xKdjQBHJKiy9unuI/values:batchGet?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING&ranges=A1%3AZ&majorDimension=ROWS&key=AIzaSyCFE7t_jrVgeC2erH83J65tIxMKcivfWDc"
        this.getMoviesToWatch(GOOGLE_SHEET_API_URL);
    }

    // componentDidUpdate() {
    //     console.log(this.state.moviesData);
    // }

    async getMoviesToWatch(googleSheetURL) {
        const googleSheetResponse = await axios(googleSheetURL);
        try {
            const googleSheetData = googleSheetResponse.data.values.map((movie => {
                return <Movie
                    key={`${movie[1]}_${movie[2]}`}
                    nameHeb={movie[0]}
                    nameEng={movie[1]}
                    releaseYear={movie[2]}
                    trailerURL={movie[3]}
                    comments={movie[4]}
                />
            }));
            this.setState({ moviesData: googleSheetData, loading: false });
        } catch (error) {
            console.error('error: ', error);
        }
    }

    render() {
        // console.log(this.state.moviesData);

        if(this.state.loading) {
            return <Spinner />
        }

        return (
            <div className="MoviesContainer">
                {this.state.moviesData}
            </div>
        );

    }

}

export default MoviesContainer;