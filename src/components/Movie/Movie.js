import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
// import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

import MovieTabs from './MovieTabs/MovieTabs';
import MovieModal from './MovieModal/MovieModal';
import Divider from '@material-ui/core/Divider';

import axios from 'axios';

import './Movie.css';

// https://docs.google.com/spreadsheets/d/1PjtUDRc6u76YySXlwN_oM9rgc2-xKdjQBHJKiy9unuI/edit#gid=1798005677

// {
//     "Title": "Apollo 18",
//     "Year": "2011",
//     "Rated": "PG-13",
//     "Released": "02 Sep 2011",
//     "Runtime": "86 min",
//     "Genre": "Horror, Mystery, Sci-Fi, Thriller",
//     "Director": "Gonzalo López-Gallego",
//     "Writer": "Brian Miller, Cory Goodman (screenplay), Cory Goodman (story)",
//     "Actors": "Warren Christie, Lloyd Owen, Ryan Robbins, Michael Kopsa",
//     "Plot": "Decades-old found footage from NASA's abandoned Apollo 18 mission, where two American astronauts were sent on a secret expedition, reveals the reason the U.S. has never returned to the moon.",
//     "Language": "English",
//     "Country": "USA, Canada",
//     "Awards": "1 win & 2 nominations.",
//     "Poster": "https://m.media-amazon.com/images/M/MV5BMTk5MTk3OTk3OV5BMl5BanBnXkFtZTcwMzg4MzgxNg@@._V1_SX300.jpg",
//     "Ratings": [ {
//         "Source": "Internet Movie Database",
//         "Value": "5.2/10"
//          }, {
//         "Source": "Rotten Tomatoes",
//         "Value": "24%"
//          }, {
//         "Source": "Metacritic",
//         "Value": "24/100"
//          } ],
//     "Metascore": "24",
//     "imdbRating": "5.2",
//     "imdbVotes": "50,554",
//     "imdbID": "tt1772240",
//     "Type": "movie",
//     "DVD": "27 Dec 2011",
//     "BoxOffice": "$17,500,000",
//     "Production": "The Weinstein Company",
//     "Website": "http://www.apollo18movie.net/",
//     "Response": "True"
//   }

class Movie extends Component {

    state = {
        nameHeb: "",
        nameEng: "",
        releaseYear: "",
        trailerURL: "",
        comments: "",
        watchingTrailer: false
    }

    componentDidMount() {
        // console.log('Movie [componentDidMount]');
        this.setState({ ...this.props });

        this.getMovieDb();
    }

    async getMovieDb() { // example: http://www.omdbapi.com/?t=avatar&y=2009&type=movie&apikey=2ac6a078
        const omdbResponse = await axios(`http://www.omdbapi.com/?t=${this.props.nameEng}&y=${this.props.releaseYear}&type=movie&apikey=2ac6a078`);
        try {
            let omdbData = omdbResponse.data;
            this.setState({ ...omdbData });
        } catch (error) {
            console.error('error: ', error);
        }
    }

    // another approach: by using boolean 'loading' in state
    // getMovieDb() {
    //     axios(`http://www.omdbapi.com/?t=${this.props.nameEng}&y=${this.props.releaseYear}&type=movie&apikey=2ac6a078`)
    //         .then(response => {
    //             this.setState({ ...omdbData, loading: false });
    //         })
    //         .catch(error => {
    //             console.error('error: ', error);
    //         });
    // }

    toggleWatchTrailer = () => {
        this.setState({ watchingTrailer: !this.state.watchingTrailer });
    }

    // componentDidUpdate() {
    //     console.log(this.state);
    // }

    render() {
        // console.log(this.state);

        if (this.state.Error) {
            return <h1>TESTTEST @@@@@@@</h1>
        }

        return (

            <Card className="movieCard" >

                <CardActionArea>

                    {/* <CardMedia // component="img" // className={{ objectFit: 'cover' }} // height="600px"
                        // image={this.state.Poster} alt={""} title={this.state.Title}
                        image="https://opengameart.org/sites/default/files/Transparency500.png" /> */}

                    <CardContent style={{ padding: '0px' }} onClick={this.toggleWatchTrailer}>
                        <div className={"movieCardContentImgDiv"}>
                            <img src={this.state.Poster ? this.state.Poster : ""} alt={"Movie Poster"} />
                        </div>
                        <Divider variant="middle"></Divider>
                        <div className={"movieCardContentTextDiv"}>
                            <Typography variant="h4"> {this.state.Title} </Typography>
                            <Typography variant="h5" style={{ direction: 'rtl' }}> {this.state.nameHeb}  </Typography>
                            <p>{this.state.Country} {this.state.Year} <span>({this.state.Runtime})</span></p>
                        </div>
                    </CardContent>

                </CardActionArea>

                <CardActions style={{ padding: '7px' }}>

                    <MovieTabs
                        title={this.state.Title}
                        year={this.state.Year}
                        ratings={this.state.Ratings}
                        imdbRating={this.state.imdbRating}
                        imdbId={this.state.imdbID}
                        plot={this.state.Plot}
                        actors={this.state.Actors}
                        genre={this.state.Genre}
                    />

                </CardActions>

                <MovieModal isOpen={this.state.watchingTrailer} toggle={this.toggleWatchTrailer}
                    searchParams={`${this.state.Title} ${this.state.Year}`} />

            </Card>

        );

    }

}

export default Movie;