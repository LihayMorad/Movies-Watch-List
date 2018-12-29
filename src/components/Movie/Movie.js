import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
// import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import DeleteIcon from '@material-ui/icons/Delete';
import Icon from '@material-ui/core/Icon';

import MovieTabs from './MovieTabs/MovieTabs';
import MovieModal from './MovieModal/MovieModal';
import MovieCommentsModal from './MovieCommentsModal/MovieCommentsModal'
import Divider from '@material-ui/core/Divider';
import MovieNotFound from '../../assets/MovieNotFound.png';
import MovieSpinner from '../Spinners/MovieSpinner/MovieSpinner';

import { database } from '../../config/firebase';

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
        nameHeb: "", nameEng: "", releaseYear: "", trailerURL: "", comments: "", dbID: "",

        Response: "", Error: "",

        watchingTrailer: false,
        editingComments: false,
        loading: true
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
            omdbData.Response ? this.setState({ ...omdbData, loading: false }) : this.setState({ Response: omdbData.Response, Error: omdbData.Error, loading: false });
        } catch (error) {
            console.error('error: ', error);
        }
    }

    toggleWatchTrailer = () => {
        this.setState({ watchingTrailer: !this.state.watchingTrailer });
    }

    toggleEditingComments = () => {
        this.setState({ editingComments: !this.state.editingComments });
    }

    handleComments = comments => {
        this.setState({ comments: comments, editingComments: false });
        database.ref('/mymovies/' + this.props.dbID).update({ Comments: comments });
    }

    // componentDidUpdate() {
    //     console.log(this.state);
    // }

    render() {
        // console.log(this.state);

        const movieDBError = this.state.Error;
        const loading = this.state.loading;

        return (

            <Card className="movieCard" style={{ width: '350px' }}>

                <CardActionArea>

                    {/* <CardMedia // component="img" // className={{ objectFit: 'cover' }} // height="600px"
                        // image={this.state.Poster} alt={""} title={this.state.Title}
                        image="https://opengameart.org/sites/default/files/Transparency500.png" /> */}

                    <CardContent style={{ padding: '0px' }} onClick={this.toggleWatchTrailer}>
                        <div className={"movieCardContentImgDiv"}>
                            {!loading ?
                                !movieDBError ? <img src={this.state.Poster} alt={"Movie Poster"}></img> :
                                    <div className={"movieCardContentImgDivError"}>
                                        <img src={MovieNotFound} alt={this.state.Error}></img>
                                        <h1>Database error: {this.state.Error}</h1>
                                    </div>
                                : <MovieSpinner />
                            }
                        </div>
                        <Divider variant="middle"></Divider>
                        <div className={"movieCardContentTextDiv"}>
                            {!loading ?
                                <div className={"movieCardContentText"}>
                                    <Typography variant="h4"> {!movieDBError ? this.state.Title : this.state.nameEng} </Typography>
                                    <Typography variant="h5" style={{ direction: 'rtl' }}> {this.state.nameHeb}  </Typography>
                                    {!movieDBError ? <p>{this.state.Country} {this.state.Year} <span>({this.state.Runtime})</span></p> : <p>{this.state.releaseYear}</p>}
                                    {this.state.comments ? <p>Comments: {this.state.comments} </p> : ""}
                                </div>
                                : <MovieSpinner />
                            }
                        </div>
                    </CardContent>

                </CardActionArea>

                <CardActions style={{ padding: '7px' }}>
                    {!loading ?
                        !movieDBError && <MovieTabs
                            title={this.state.Title}
                            year={this.state.Year}
                            ratings={this.state.Ratings}
                            imdbRating={this.state.imdbRating}
                            imdbId={this.state.imdbID}
                            plot={this.state.Plot}
                            actors={this.state.Actors}
                            genre={this.state.Genre}
                        />
                        : <MovieSpinner />
                    }
                </CardActions>


                <MovieModal isOpen={this.state.watchingTrailer} toggle={this.toggleWatchTrailer}
                    searchParams={!movieDBError ? `${this.state.Title} ${this.state.Year}` : `${this.state.nameEng} ${this.state.releaseYear}`} />


                <Fab style={{ margin: '0px 10px 7px 10px' }} onClick={this.toggleEditingComments} color="primary" title={"Edit movie comments"}>
                    <Icon>edit_icon</Icon>
                </Fab>

                <Fab style={{ margin: '0px 10px 7px 10px' }} onClick={() => this.props.delete(this.state.dbID)} color="secondary" title={"Delete movie"}>
                    <DeleteIcon />
                </Fab>

                <MovieCommentsModal isOpen={this.state.editingComments} toggle={this.toggleEditingComments}
                    handleComments={this.handleComments} comments={this.state.comments} />

            </Card>

        );

    }

}

export default Movie;