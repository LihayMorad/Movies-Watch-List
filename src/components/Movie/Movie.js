import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
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

    async getMovieDb() {
        const omdbResponse = await axios(`https://www.omdbapi.com/?t=${this.props.nameEng}&y=${this.props.releaseYear}&type=movie&apikey=${process.env.REACT_APP_OMDB_API_KEY}`);
        try {
            let omdbData = omdbResponse.data;
            omdbData.Response ? this.setState({ ...omdbData, loading: false }) : this.setState({ Response: omdbData.Response, Error: omdbData.Error, loading: false });
        } catch (error) {
            console.error('error: ', error);
        }
    }

    toggleWatchTrailer = () => { this.setState({ watchingTrailer: !this.state.watchingTrailer }); }

    toggleEditingComments = () => { this.setState({ editingComments: !this.state.editingComments }); }

    handleComments = comments => {
        this.setState({ comments: comments, editingComments: false }, () => {
            database.ref('/mymovies/' + this.props.dbID).update({ Comments: comments }, () => { alert("Comments saved succesfully"); });
        });
    }

    // componentDidUpdate() {
    //     console.log(this.state);
    // }

    render() {
        // console.log(this.state);

        // @@@@@ check whether it help performance or not
        const movieDBError = this.state.Error;
        const loading = this.state.loading;

        return (

            <Card className="movieCard" style={{ width: '350px' }}>

                <CardActionArea>

                    <CardContent style={{ padding: '0px' }} onClick={this.toggleWatchTrailer}>
                        <div className={"movieCardContentImgDiv"}>
                            {!loading ?
                                !movieDBError ? <img src={this.state.Poster} alt={"Movie Poster Not Found"}></img> :
                                    <div className={"movieCardContentImgDivError"}>
                                        <img src={MovieNotFound} alt={movieDBError}></img>
                                        <h1>Database error: {movieDBError}</h1>
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
                                    {this.state.comments ? <p>Comments: <span style={{ wordBreak: 'break-word', direction: 'rtl' }}>{this.state.comments}</span></p> : ""}
                                </div>
                                : <MovieSpinner />
                            }
                        </div>
                    </CardContent>

                </CardActionArea>

                <CardActions style={{ display: 'inherit', padding: '7px' }}>
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

                <Fab style={{ margin: '0px 10px 7px 10px' }} size="small" onClick={this.toggleEditingComments} color="primary" title={"Edit movie comments"}>
                    <Icon>edit_icon</Icon>
                </Fab>

                <Fab style={{ margin: '0px 10px 7px 10px' }} size="small" onClick={() => this.props.delete(this.state.dbID)} color="secondary" title={"Delete movie"}>
                    <DeleteIcon />
                </Fab>

                <MovieCommentsModal isOpen={this.state.editingComments} toggle={this.toggleEditingComments}
                    handleComments={this.handleComments} comments={this.state.comments} />

            </Card>

        );

    }

}

export default Movie;