import React, { Component } from 'react';
import axios from 'axios';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import LoadingSpinner from '../../Spinners/SearchResultsSpinner/SearchResultsSpinner';

import { withStyles } from '@material-ui/core/styles';

import './MovieTrailerModal.css';

const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);

class MovieTrailerModal extends Component {

	state = {
		trailerId: "",
		trailerTitle: "",
		searchError: false,
		loading: false
	}

	getTrailer = () => {
		this.setState({ loading: true }, async () => {
			try {
				const searchURL = `https://content.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${this.props.searchParams}%20trailer&type=video&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`;
				const youtubeSearchResponse = await axios(searchURL);
				if (youtubeSearchResponse.status === 200) {
					this.setState({
						trailerId: youtubeSearchResponse.data.items[0].id.videoId,
						trailerTitle: this.props.searchParams + " Trailer",
						loading: false
					});
				} else {
					throw Error(youtubeSearchResponse);
				}
			} catch (error) {
				this.setState({ searchError: error, loading: false });
				console.error(error);
			}
		});
	}

	render() {
		const { trailerId, trailerTitle, searchError, loading } = this.state;

		return (

			<StyledDialog
				fullWidth
				maxWidth="lg"
				open={this.props.isOpen}
				onEnter={this.getTrailer}
				onClose={this.props.toggle}>

				<div className={"DialogTitleDiv"}>
					<DialogTitle id="scroll-dialog-title">{!searchError ? trailerTitle : "Error! Something went wrong"}</DialogTitle>
					<IconButton color="inherit" onClick={this.props.toggle} aria-label="Close"><CloseIcon /></IconButton>
				</div>

				{!loading
					? <div className={"DialogContentYoutubeDivWrapper"}>
						<iframe
							src={`https://www.youtube.com/embed/${trailerId}?autoplay=0`}
							allow={"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"}
							allowFullScreen
							frameBorder="0"
							title="Movie Trailer">
						</iframe>
					</div>
					: <LoadingSpinner />
				}

				<DialogActions id={"TrailerModalActions"}>
					<Button color="inherit" onClick={this.props.toggle}>Close</Button>
				</DialogActions>

			</StyledDialog>

		);
	}
}

export default MovieTrailerModal;