import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import * as actionTypes from '../../store/actions';

import MoviesService from '../../Services/MoviesService';

import MovieTabs from './MovieTabs/MovieTabs';
import MovieSpinner from '../../components/UI Elements/Spinners/MovieSpinner/MovieSpinner';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Divider from '@material-ui/core/Divider';
import RemoveRedEye from '@material-ui/icons/RemoveRedEye';
import RemoveRedEyeOutlined from '@material-ui/icons/RemoveRedEyeOutlined';
import Zoom from '@material-ui/core/Zoom';

import MovieNotFound from '../../assets/MovieNotFound.png';
import youTubeIcon from '../../assets/youtube_icon.png';

import { withStyles } from '@material-ui/core/styles';
import './Movie.css';

const StyledTooltip = withStyles({ tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' } })(Tooltip);

class Movie extends Component {

	state = {
		NameHeb: "", NameEng: "", Year: "", Comments: "", dbMovieID: "", Watched: false,
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
					if (response.status === 200 && response.data.Response === "True") { movieData = response.data; movieData.Year = parseInt(response.data.Year) }
					else { error = response.data.Error }
				})
				.catch(error => { error = true })
				.finally(() => { this.setState({ loading: false, ...movieData, Error: error }); })
		});
	}

	toggleMovieWatched = e => {
		const { checked } = e.target;
		MoviesService.ToggleMovieWatched(this.props.dbMovieID, checked)
			.then(() => {
				this.props.onSnackbarToggle(true, `Movie marked as ${checked ? 'watched' : 'unwatched'} successfully`, "information");
				this.handleUpdateCounter("unwatched", checked ? "Mark as watched" : "Mark as unwatched");
			})
			.catch(() => { this.props.onSnackbarToggle(true, "There was an error marking the movie as watched", "error"); })
	}

	handleUpdateCounter = (properties, type) => {
		MoviesService.UpdateCounter(this.props.moviesCounter, properties, type)
			.then(() => { })
			.catch(() => { })
	}

	render() {
		const movieDBError = this.state.Error;
		const { imdbID, dbMovieID, Title, NameEng, NameHeb, Comments, Year, Poster, Country, Runtime, Watched, loading } = this.state;

		return (

			<Card className="movieCard">

				<CardActionArea>
					<StyledTooltip title="Click to watch the trailer" TransitionComponent={Zoom}>
						<CardContent id="movieCardContent"
							onClick={() => this.props.toggleWatchTrailer((`${!movieDBError ? Title : NameEng} ${Year}`), imdbID)}>
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
							genre={this.state.Genre} />
						: <MovieSpinner />
					}
				</CardActions>

				<StyledTooltip title="Edit movie's personal note" TransitionComponent={Zoom}>
					<Fab className="movieCardFab" color="primary" size="small"
						onClick={() => { this.props.toggleEditComments(dbMovieID, Comments); }}>
						<EditIcon />
					</Fab>
				</StyledTooltip>

				<StyledTooltip title={`Mark movie as ${Watched ? 'unwatched' : 'watched'}`} TransitionComponent={Zoom}>
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

			</Card>

		);

	}

}

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
	onSnackbarToggle: (open, message, type) => dispatch({ type: actionTypes.TOGGLE_SNACKBAR, payload: { open, message, type } })
});

export default connect(mapStateToProps, mapDispatchToProps)(Movie);