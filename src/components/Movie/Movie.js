import React, { Component } from 'react';
import axios from 'axios';
import { database } from '../../config/firebase';

import { connect } from 'react-redux';
import * as actionTypes from '../../store/actions';

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
import MovieSpinner from '../../components/UI Elements/Spinners/MovieSpinner/MovieSpinner';
import Checkbox from '@material-ui/core/Checkbox';
import RemoveRedEye from '@material-ui/icons/RemoveRedEye';
import RemoveRedEyeOutlined from '@material-ui/icons/RemoveRedEyeOutlined';

import youTubeIcon from '../../assets/youtube_social_icon_red.png';

import './Movie.css';

const styles = { "cardContent": { padding: '0px' } };

class Movie extends Component {

	state = {
		nameHeb: "", nameEng: "", Year: "", comments: "", dbMovieID: "", watched: false,
		loading: true, Error: false,
		watchingTrailer: false, editingComments: false
	}

	componentDidMount() { this.setState({ ...this.props }, this.getMovieDb); }

	getMovieDb = () => {
		this.setState({ loading: true }, async () => {
			try {
				const searchURL = `https://www.omdbapi.com/?i=${this.props.imdbID}&type=movie&apikey=${process.env.REACT_APP_OMDB_API_KEY}`;
				const omdbResponse = await axios(searchURL);
				let movieData = {}
				let error = false;
				if (omdbResponse.status === 200 && omdbResponse.data.Response === "True") {
					movieData = omdbResponse.data;
				} else {
					error = omdbResponse.data.Error;
				}
				this.setState({ loading: false, ...movieData, Error: error });
			} catch (error) {
				this.setState({ loading: false, Error: true });
			}
		});
	}

	toggleWatchTrailer = () => { this.setState(state => ({ watchingTrailer: !state.watchingTrailer })) };

	toggleEditComments = () => { this.setState(state => ({ editingComments: !state.editingComments })) };

	handleComments = comments => {
		database.ref(`/mymovies/${this.props.userID}/${this.props.dbMovieID}`).update({ Comments: comments }, (error) => {
			const message = !error
				? "Personal note saved successfully"
				: "There was an error saving the note";
			this.setState({ comments: comments, editingComments: false },
				() => { this.props.onSnackbarToggle(true, message, !error ? "success" : "error"); });
		});
	}

	toggleMovieWatched = e => {
		const { checked } = e.target;
		database.ref(`/mymovies/${this.props.userID}/${this.props.dbMovieID}`).update({ Watched: checked }, (error) => {
			const message = !error
				? `Movie marked as ${checked ? 'watched' : 'unwatched'} successfully`
				: "There was an error marking the movie as watched";
			this.props.onSnackbarToggle(true, message, !error ? "information" : "error");
			if (!(!this.props.showWatchedMovies && checked)) this.setState({ watched: checked }); // prevent setState on unmounted component
		})
	}

	render() {

		const movieDBError = this.state.Error;
		const { loading } = this.state;

		return (

			<Card className="movieCard" >

				<CardActionArea>

					<CardContent style={styles.cardContent} title="Click to open trailer" onClick={this.toggleWatchTrailer}>
						<div className="movieCardContentImgDiv">
							{!loading
								? !movieDBError
									? <>
										<img src={this.state.Poster} id="movieCardContentImgDivPoster" alt="Movie Poster Not Found" />
										<img src={youTubeIcon} id="movieCardContentYouTubeImg" alt="YouTube icon" />
									</>
									: <div id="movieCardContentImgDivError">
										<img src={MovieNotFound} alt={movieDBError === true ? "Error" : movieDBError} />
										<h1>Database error {movieDBError}</h1>
									</div>
								: <MovieSpinner />
							}
						</div>
						<Divider variant="middle"></Divider>
						<div className="movieCardContentTextDiv">
							{!loading
								? <div>
									<Typography variant="h4"> {!movieDBError ? this.state.Title : this.state.nameEng} </Typography>
									<Typography variant="h5"> {this.state.nameHeb} </Typography>
									{!movieDBError
										? <p>{this.state.Country} {this.state.Year} <span>({this.state.Runtime})</span></p>
										: <p>{this.state.Year}</p>}
									{this.state.comments
										? <p>Personal note: <span id="commentsSpan">{this.state.comments}</span></p>
										: ""}
								</div>
								: <MovieSpinner />
							}
						</div>
					</CardContent>

				</CardActionArea>

				<CardActions id="movieCardActions">
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

				<Fab className="movieCardFab" color="primary" size="small" title="Add/Edit movie's personal note"
					onClick={this.toggleEditComments} >
					<Icon>edit_icon</Icon>
				</Fab>

				<Fab className="movieCardFab" color="default" size="small" title={`Mark as ${this.state.watched ? 'unwatched' : 'watched'}`}>
					<Checkbox style={{ height: 'inherit' }}
						checked={this.state.watched || false}
						icon={< RemoveRedEyeOutlined fontSize="large" color="action" />}
						checkedIcon={<RemoveRedEye fontSize="large" color="primary" />}
						onChange={this.toggleMovieWatched} />
				</Fab>

				<Fab className="movieCardFab" color="secondary" size="small" title="Delete movie"
					onClick={() => { if (window.confirm("Are you sure you want to delete this movie?")) { this.props.delete(this.state.dbMovieID); } }} >
					<DeleteIcon />
				</Fab>

				<MovieTrailerModal
					isOpen={this.state.watchingTrailer}
					toggle={this.toggleWatchTrailer}
					searchParams={!movieDBError
						? `${this.state.Title} ${this.state.Year}`
						: `${this.state.nameEng} ${this.state.Year}`} />

				<MovieCommentsModal
					isOpen={this.state.editingComments}
					toggle={this.toggleEditComments}
					handleComments={this.handleComments}
					comments={this.state.comments} />

			</Card>

		);

	}

}

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
	onSnackbarToggle: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } })
})

export default connect(mapStateToProps, mapDispatchToProps)(Movie);