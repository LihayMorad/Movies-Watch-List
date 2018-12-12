import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import MovieTabs from './MovieTabs/MovieTabs';

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
//     "Ratings": [
//       {
//         "Source": "Internet Movie Database",
//         "Value": "5.2/10"
//       },
//       {
//         "Source": "Rotten Tomatoes",
//         "Value": "24%"
//       },
//       {
//         "Source": "Metacritic",
//         "Value": "24/100"
//       }
//     ],
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
    }

    componentDidMount() {
        // console.log('Movie [componentDidMount]');
        this.setState({ ...this.props });
        console.log(this.props);

        this.getMovieDb();
    }

    async getMovieDb() {
        const omdbResponse = await axios('http://www.omdbapi.com/?t=' + this.props.nameEng + '&y=' + this.props.releaseYear + 'type=movie&apikey=2ac6a078');
        try {
            console.log(omdbResponse.data);
            let omdbData = omdbResponse.data;
            this.setState({ ...omdbData });
        } catch (error) {
            console.error('error: ', error);
        }
    }

    componentDidUpdate() {
        console.log(this.state);
    }

    render() {

        return (

            <Card className="movieCard" >

                <CardActionArea>

                    <CardMedia
                        component="img"
                        alt={this.state.nameEng + " Movie Poster"}
                        // className={{ objectFit: 'cover' }}
                        // height="200px"
                        image={this.state.Poster}
                        title={this.state.Title}
                    />

                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            {this.state.Title}
                        </Typography>
                        <Typography component="p">
                            {this.state.nameHeb}
                        </Typography>
                        <Typography component="p">
                            {this.state.Year}
                        </Typography>
                    </CardContent>

                </CardActionArea>

                <CardActions>


                {MovieTabs}



                    {/* <Button size="small" color="primary">
                        Show more
                    </Button>
                    <Button size="small" color="secondary">
                        Download
                    </Button> */}

                </CardActions>

            </Card>

        );

    }

}

export default Movie;