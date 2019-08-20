import React, { Component } from 'react';
import axios from 'axios';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import LoadingSpinner from '../Spinners/SearchResultsSpinner/SearchResultsSpinner';
import Zoom from '@material-ui/core/Zoom';

import { withStyles } from '@material-ui/core/styles';
import './MovieTrailerModal.css';

const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);

class MovieTrailerModal extends Component {

	state = { trailerId: "", trailerTitle: "", searchError: false, loading: false }

	getTrailer = () => { this.setState({ loading: true }, this.getTrailerFromTMDBAPI); } // if we get an error from TMDB, continue to YouTube search

	getTrailerFromTMDBAPI = async () => {
		try {
			if (this.props.searchID) {
				const searchURL = `https://api.themoviedb.org/3/movie/${this.props.searchID}/videos?api_key=${process.env.REACT_APP_TMDB_API_KEY}`;
				const tmdbSearchResponse = await axios(searchURL);
				if (tmdbSearchResponse.status === 200 && tmdbSearchResponse.statusText === "OK") {
					const results = tmdbSearchResponse.data.results || [];
					if (results.length === 0) throw Error({ message: "No results from TMDB" });
					const youTubeTrailerID = results.find(movie => movie.site === "YouTube" && movie.type === "Trailer").key;
					this.setState({
						trailerId: youTubeTrailerID || "",
						trailerTitle: `${this.props.searchParams} Trailer`,
						searchError: "",
						loading: false
					});
				} else { throw Error(tmdbSearchResponse); }
			} else { throw Error({ message: "Search ID is missing" }); }
		} catch (error) {
			this.setState({ searchError: error.response ? error.response.statusText : error.message });
			this.getTrailerFromYouTubeAPI();
		}
	}

	getTrailerFromYouTubeAPI = async () => {
		try {
			if (this.props.searchParams) {
				const searchURL = `https://content.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${this.props.searchParams}%20trailer&type=video&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`;
				const youTubeSearchResponse = await axios(searchURL);
				if (youTubeSearchResponse.status === 200) {
					this.setState({
						trailerId: youTubeSearchResponse.data.items[0].id.videoId,
						trailerTitle: `${this.props.searchParams} Trailer`,
						searchError: "",
						loading: false
					});
				} else { throw Error(youTubeSearchResponse); }
			} else { throw Error({ message: "Search parameters are missing" }); }
		} catch (error) {
			this.setState({ searchError: error.response ? error.response.data : error.message, loading: false });
		}
	}

	handleClose = () => {
		this.setState({ trailerId: "", trailerTitle: "", searchError: false, loading: false });
		this.props.toggle();
	}

	render() {
		const { trailerId, trailerTitle, searchError, loading } = this.state;

		return (

			<StyledDialog
				fullWidth
				maxWidth="lg"
				TransitionComponent={Zoom}
				open={this.props.isOpen}
				onEnter={this.getTrailer}
				onClose={this.handleClose}>

				<div className="DialogTitleDiv">
					{!loading && <DialogTitle>{!searchError ? trailerTitle : "Error! Something went wrong"}</DialogTitle>}
					<IconButton color="inherit" onClick={this.props.toggle} aria-label="Close"><CloseIcon /></IconButton>
				</div>

				{!loading
					? <div className="DialogContentYoutubeDivWrapper">
						<iframe
							src={`https://www.youtube.com/embed/${trailerId}?autoplay=0`}
							allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen frameBorder="0" title="Movie Trailer">
						</iframe>
					</div>
					: <LoadingSpinner />
				}

				<DialogActions id="TrailerModalActions">
					{!loading && <Typography variant="body1" align="left">*based on YouTube search results</Typography>}
					<Button onClick={this.props.toggle}>Close</Button>
				</DialogActions>

			</StyledDialog>

		);
	}
}

export default MovieTrailerModal;