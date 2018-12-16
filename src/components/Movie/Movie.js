import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

import MovieTabs from './MovieTabs/MovieTabs';
import MovieModal from './MovieModal/MovieModal';

import axios from 'axios';

// https://docs.google.com/spreadsheets/d/1PjtUDRc6u76YySXlwN_oM9rgc2-xKdjQBHJKiy9unuI/edit#gid=1798005677

import './Movie.css';

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
        // console.log(this.props);

        this.getMovieDb();
    }

    async getMovieDb() {
        const omdbResponse = await axios(`http://www.omdbapi.com/?t=${this.props.nameEng}&y=${this.props.releaseYear}&type=movie&apikey=2ac6a078`);
        try {
            // console.log(omdbResponse.data);
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
        this.setState({
            watchingTrailer: !this.state.watchingTrailer
        });
    }

    // componentDidUpdate() {
    //     console.log(this.state);
    // }

    render() {

        return (

            <Card className="movieCard" >

                <CardActionArea>

                    <CardMedia
                        component="img"
                        alt={this.state.nameEng + " Movie Poster"}
                        // className={{ objectFit: 'cover' }}
                        // height="600px"
                        image={this.state.Poster}
                        title={this.state.Title}
                        onClick={this.toggleWatchTrailer}
                    />

                    <CardContent style={{ padding: '12px' }}>
                        <Typography variant="h4"> {this.state.Title} </Typography>
                        <Typography variant="h5" style={{ direction: 'rtl' }}> {this.state.nameHeb}  </Typography>
                        <p style={{ fontSize: '14px', marginTop: '4px', marginBottom: '0' }}>{this.state.Country} {this.state.Year} <span style={{ display: 'inline-block' }}>({this.state.Runtime})</span></p>
                    </CardContent>

                </CardActionArea>

                <CardActions>

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

{/* <Button size="small" color="primary">
    Show more
</Button>
<Button size="small" color="secondary">
    Download
</Button> */}