import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import * as actionTypes from '../../store/actions';

import MoviesService from '../../Services/MoviesService';
import AnalyticsService from '../../Services/AnalyticsService';

import MovieTabs from './MovieTabs/MovieTabs';
import MovieSpinner from '../../components/UI Elements/Spinners/MovieSpinner/MovieSpinner';

import { Card, CardActionArea, CardActions, CardContent, Typography, Checkbox, Tooltip, Fab, Divider, Zoom } from '@material-ui/core';
import { Star as StarIcon, StarBorder as StarBorderIcon, Delete as DeleteIcon, Edit as EditIcon, RemoveRedEye, RemoveRedEyeOutlined } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

import Rating from 'react-rating'; // https://github.com/dreyescat/react-rating

import MovieNotFound from '../../assets/MovieNotFound.png';
import youTubeIcon from '../../assets/youtube_icon.png';

import './Movie.css';

const StyledTooltip = withStyles({ tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' } })(Tooltip);

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500/";

class Movie extends Component {

	state = {
		NameHeb: "", NameEng: "", Year: "", Comments: "", imdbRating: "", dbMovieID: "", Watched: false, imdbRatingTimestamp: "",
		loading: true, Error: false
	}

	componentDidMount() { this.setState({ ...this.props }, this.getMovieDb); }

	componentDidUpdate(prevProps) { if (prevProps.Comments !== this.props.Comments) this.setState({ Comments: this.props.Comments }); }

	getMovieDb = () => {
		this.setState({ loading: true }, () => {
			let movieData = {};
			let error = false;
			axios(`https://www.omdbapi.com/?i=${this.props.imdbID}&type=movie&plot=full&apikey=${process.env.REACT_APP_OMDB_API_KEY}`)
				.then(response => {
					if (response.status === 200 && response.data.Response === "True") {
						movieData = response.data;
						movieData.Year = parseInt(response.data.Year);
						if (this.props.Poster) movieData.Poster = POSTER_BASE_URL + this.props.Poster;

						const timestampNow = Date.now();
						const shouldUpdateIMDBRating = !this.state.imdbRating || !this.state.imdbRatingTimestamp || (timestampNow - this.state.imdbRatingTimestamp) / 1000 / 60 / 60 / 24 > 1;
						if (shouldUpdateIMDBRating) {
							const imdbRating = movieData.imdbRating && movieData.imdbRating !== "N/A" ? movieData.imdbRating : "";
							this.handleUpdateIMDBRating(imdbRating, timestampNow);
						}
					}
					else { error = response.data.Error }
				})
				.catch(error => { error = true })
				.finally(() => { this.setState({ loading: false, ...movieData, Error: error }); })
		});
	}

	toggleMovieWatched = ({ target: { checked } }) => {
		const label = checked ? 'watched' : 'unwatched';
		MoviesService.UpdateMovie(this.props.dbMovieID, "Watched", checked)
			.then(() => {
				this.props.onSnackbarToggle(true, `Movie marked as ${label} successfully`, "information");
				this.handleUpdateCounter("unwatched", checked ? "Mark as watched" : "Mark as unwatched");
				AnalyticsService({
					category: 'Movie',
					action: 'Toggle movie watched status'
				});
			})
			.catch(() => { this.props.onSnackbarToggle(true, `There was an error marking the movie as ${label}`, "error"); })
	}

	handleUpdateCounter = (properties, type) => {
		MoviesService.UpdateCounter(this.props.moviesCounter, properties, type)
			.then(() => { })
			.catch(() => { })
	}

	handleUpdateIMDBRating = (imdbRating, timestampNow) => {
		MoviesService.UpdateMovie(this.props.dbMovieID, "imdbRating", imdbRating)
			.then(() => { })
			.catch(() => { })
		MoviesService.UpdateMovie(this.props.dbMovieID, "imdbRatingTimestamp", timestampNow)
			.then(() => { })
			.catch(() => { })
	}

	render() {
		const movieDBError = this.state.Error;
		const { imdbID, dbMovieID, Title, NameEng, NameHeb, Comments, Year, Poster, Country, Runtime, Watched, imdbRating, loading, watchingList } = this.state;

		return (
			<div id="movieCardContainer">
				<Card className="movieCard">

					{imdbRating && imdbRating !== "N/A" && <StyledTooltip title={`IMDB rating: ${imdbRating}`} TransitionComponent={Zoom}><div>
						<Rating
							className="movieRatingStars"
							initialRating={imdbRating}
							stop={10}
							fractions={10}
							emptySymbol={<StarBorderIcon />}
							fullSymbol={<StarIcon />}
							readonly /></div>
					</StyledTooltip>}

					<CardActionArea>
						<StyledTooltip title="Click to watch the trailer" TransitionComponent={Zoom}>
							<CardContent id="movieCardContent" onClick={() => this.props.toggleWatchTrailer((`${!movieDBError ? Title : NameEng} ${Year}`), imdbID)}>
								<div className="movieCardContentImgDiv">
									{!loading
										? !movieDBError
											? <>
												<img src={Poster} id="movieCardContentImgDivPoster" alt="Movie Poster Not Found" />
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
											<Typography variant="h4"> {!movieDBError ? Title : NameEng} </Typography>
											<Typography variant="h5"> {NameHeb} </Typography>
											{!movieDBError
												? <p>{Country} {Year} <span>({Runtime})</span></p>
												: <p>{Year}</p>}
											{Comments
												? <p>Personal note: <span id="commentsSpan">{Comments}</span></p>
												: ""}
										</div>
										: <MovieSpinner />
									}
								</div>
							</CardContent>
						</StyledTooltip>
					</CardActionArea>

					<CardActions>
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
								watchingList={watchingList} />
							: <MovieSpinner />
						}
					</CardActions>

					{!watchingList && <>
						<StyledTooltip title="Edit movie's personal note" TransitionComponent={Zoom}>
							<Fab className="movieCardFab" color="primary" size="small"
								onClick={() => { this.props.toggleEditComments(dbMovieID, Comments); }}>
								<EditIcon />
							</Fab>
						</StyledTooltip>

						<StyledTooltip title={`Mark movie as ${Watched ? 'unseen' : 'watched'}`} TransitionComponent={Zoom}>
							<Fab className="movieCardFab" color="default" size="small">
								<Checkbox style={{ height: 'inherit' }}
									checked={Watched || false}
									icon={<RemoveRedEyeOutlined fontSize="large" color="action" />}
									checkedIcon={<RemoveRedEye fontSize="large" color="primary" />}
									onChange={this.toggleMovieWatched} />
							</Fab>
						</StyledTooltip>

						<StyledTooltip title="Delete movie" TransitionComponent={Zoom}>
							<Fab className="movieCardFab" color="secondary" size="small"
								onClick={() => {
									if (window.confirm("Are you sure you want to delete this movie?")) { this.props.delete(dbMovieID, imdbID, !movieDBError ? Title : NameEng, Year, Watched); }
								}}>
								<DeleteIcon />
							</Fab>
						</StyledTooltip>
					</>
					}
				</Card>
			</div>
		);

	}

}

const mapStateToProps = state => ({ moviesCounter: state.moviesCounter });

const mapDispatchToProps = dispatch => ({
	onSnackbarToggle: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } })
});

export default connect(mapStateToProps, mapDispatchToProps)(Movie);