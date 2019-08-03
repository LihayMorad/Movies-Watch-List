import React, { Component } from 'react';
import axios from 'axios';
import { database } from '../../config/firebase';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import DeleteIcon from '@material-ui/icons/Delete';
import Icon from '@material-ui/core/Icon';

import MovieTabs from './MovieTabs/MovieTabs';
import MovieTrailerModal from './MovieTrailerModal/MovieTrailerModal';
import MovieCommentsModal from './MovieCommentsModal/MovieCommentsModal'
import Divider from '@material-ui/core/Divider';
import MovieNotFound from '../../assets/MovieNotFound.png';
import MovieSpinner from '../Spinners/MovieSpinner/MovieSpinner';

import youTubeIcon from '../../assets/youtube_social_icon_red.png';

import './Movie.css';

const styles = { "cardContent": { padding: '0px' } };

class Movie extends Component {

	state = {
		nameHeb: "", nameEng: "", releaseYear: "", comments: "", dbID: "",
		Response: "", Error: "",
		watchingTrailer: false, editingComments: false, loading: true
	}

	componentDidMount() { this.setState({ ...this.props }, this.getMovieDb); }

	getMovieDb = async () => {
		try {
			const omdbResponse = await axios(`https://www.omdbapi.com/?i=${this.props.imdbID}&type=movie&apikey=${process.env.REACT_APP_OMDB_API_KEY}`)
			const omdbData = omdbResponse.data;
			omdbData.Response === "True"
				? this.setState({ ...omdbData, loading: false })
				: this.setState({ Response: omdbData.Response, Error: omdbData.Error, loading: false });
		} catch (error) {
			console.error('error: ', error);
		}
	}

	toggleWatchTrailer = () => { this.setState({ watchingTrailer: !this.state.watchingTrailer }); }

	toggleEditingComments = () => { this.setState({ editingComments: !this.state.editingComments }); }

	handleComments = comments => {
		database.ref(`/mymovies/${this.props.userID}/${this.props.dbID}`).update({ Comments: comments }, () => {
			this.setState({ comments: comments, editingComments: false }, () => {
				this.props.handleInformationDialog("Comments saved successfully");
			});
		});
	}

	render() {

		const movieDBError = this.state.Error;
		const loading = this.state.loading;

		return (

			<Card className={"movieCard"} >

				<CardActionArea>

					<CardContent style={styles.cardContent} title={"Click to open trailer"} onClick={this.toggleWatchTrailer}>
						<div className={"movieCardContentImgDiv"}>
							{!loading
								? !movieDBError
									? <React.Fragment>
										<img src={this.state.Poster} id={"movieCardContentImgDivPoster"} alt={"Movie Poster Not Found"} />
										<img src={youTubeIcon} id={"movieCardContentYouTubeImg"} alt={"YouTube icon"} />
									</React.Fragment>
									: <div id={"movieCardContentImgDivError"}>
										<img src={MovieNotFound} alt={movieDBError} />
										<h1>Database error: {movieDBError}</h1>
									</div>
								: <MovieSpinner />
							}
						</div>
						<Divider variant="middle"></Divider>
						<div className={"movieCardContentTextDiv"}>
							{!loading
								? <div>
									<Typography variant="h4"> {!movieDBError ? this.state.Title : this.state.nameEng} </Typography>
									<Typography variant="h5"> {this.state.nameHeb} </Typography>
									{!movieDBError
										? <p>{this.state.Country} {this.state.Year} <span>({this.state.Runtime})</span></p>
										: <p>{this.state.releaseYear}</p>}
									{this.state.comments
										? <p>Personal note: <span id={"commentsSpan"}>{this.state.comments}</span></p>
										: ""}
								</div>
								: <MovieSpinner />
							}
						</div>
					</CardContent>

				</CardActionArea>

				<CardActions id={"movieCardActions"}>
					{!loading
						? !movieDBError && <MovieTabs
							title={this.state.Title}
							year={this.state.Year}
							ratings={this.state.Ratings}
							imdbRating={this.state.imdbRating}
							imdbId={this.state.imdbID}
							plot={this.state.Plot}
							actors={this.state.Actors}
							genre={this.state.Genre}
							userEmail={this.props.userEmail} />
						: <MovieSpinner />
					}
				</CardActions>

				<MovieTrailerModal
					isOpen={this.state.watchingTrailer}
					toggle={this.toggleWatchTrailer}
					searchParams={!movieDBError
						? `${this.state.Title} ${this.state.Year}`
						: `${this.state.nameEng} ${this.state.releaseYear}`} />

				<Fab id={"movieCardFab1"} color="primary" title={"Add/Edit movie's personal note"} size="small"
					onClick={this.toggleEditingComments} >
					<Icon>edit_icon</Icon>
				</Fab>

				<Fab id={"movieCardFab2"} color="secondary" title={"Delete movie"} size="small"
					onClick={() => { if (window.confirm("Are you sure you want to delete this movie?")) { this.props.delete(this.state.dbID); } }} >
					<DeleteIcon />
				</Fab>

				<MovieCommentsModal
					isOpen={this.state.editingComments}
					toggle={this.toggleEditingComments}
					handleComments={this.handleComments}
					comments={this.state.comments} />

			</Card>

		);

	}

}

export default Movie;