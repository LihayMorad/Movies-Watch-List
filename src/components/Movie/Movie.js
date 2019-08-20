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
import EditIcon from '@material-ui/icons/Edit';
import MovieTabs from './MovieTabs/MovieTabs';
import Divider from '@material-ui/core/Divider';
import MovieNotFound from '../../assets/MovieNotFound.png';
import MovieSpinner from '../../components/UI Elements/Spinners/MovieSpinner/MovieSpinner';
import Checkbox from '@material-ui/core/Checkbox';
import RemoveRedEye from '@material-ui/icons/RemoveRedEye';
import RemoveRedEyeOutlined from '@material-ui/icons/RemoveRedEyeOutlined';

import youTubeIcon from '../../assets/youtube_icon.png';

import './Movie.css';

class Movie extends Component {

	state = {
		NameHeb: "", NameEng: "", Year: "", comments: "", dbMovieID: "", watched: false,
		loading: true, Error: false
	}

	componentDidMount() { this.setState({ ...this.props }, this.getMovieDb); }

	componentDidUpdate(prevProps) { if (prevProps.comments !== this.props.comments) this.setState({ comments: this.props.comments }); }

	getMovieDb = () => {
		this.setState({ loading: true }, async () => {
			try {
				const searchURL = `https://www.omdbapi.com/?i=${this.props.imdbID}&type=movie&plot=full&apikey=${process.env.REACT_APP_OMDB_API_KEY}`;
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

			<Card className="movieCard">

				<CardActionArea>
					<CardContent id="movieCardContent" title="Click to watch trailer"
						onClick={() => this.props.toggleWatchTrailer((`${!movieDBError ? this.state.Title : this.state.NameEng} ${this.state.Year}`), this.state.imdbID)}>
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
									<Typography variant="h4"> {!movieDBError ? this.state.Title : this.state.NameEng} </Typography>
									<Typography variant="h5"> {this.state.NameHeb} </Typography>
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
							imdbID={this.state.imdbID}
							plot={this.state.Plot}
							actors={this.state.Actors}
							genre={this.state.Genre}
							userEmail={this.props.userEmail} />
						: <MovieSpinner />
					}
				</CardActions>

				<Fab className="movieCardFab" color="primary" size="small" title="Add/Edit movie's personal note"
					onClick={() => { this.props.toggleEditComments(this.state.comments, this.state.userID, this.state.dbMovieID); }} >
					<EditIcon />
				</Fab>

				<Fab className="movieCardFab" color="default" size="small" title={`Mark as ${this.state.watched ? 'unwatched' : 'watched'}`}>
					<Checkbox style={{ height: 'inherit' }}
						checked={this.state.watched || false}
						icon={<RemoveRedEyeOutlined fontSize="large" color="action" />}
						checkedIcon={<RemoveRedEye fontSize="large" color="primary" />}
						onChange={this.toggleMovieWatched} />
				</Fab>

				<Fab className="movieCardFab" color="secondary" size="small" title="Delete movie"
					onClick={() => { if (window.confirm("Are you sure you want to delete this movie?")) { this.props.delete(this.state.dbMovieID); } }} >
					<DeleteIcon />
				</Fab>

			</Card>

		);

	}

}

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
	onSnackbarToggle: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } })
})

export default connect(mapStateToProps, mapDispatchToProps)(Movie);