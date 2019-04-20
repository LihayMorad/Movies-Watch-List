import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import './MovieTrailerModal.css';

const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);

class MovieTrailerModal extends Component {

	state = {
		trailerId: "",
		trailerTitle: ""
	}

	// componentDidMount() { console.log('Movie Modal [componentDidMount] this.props.isOpen', this.props.isOpen); }

	// componentDidUpdate() { console.log('Movie Modal [componentDidMount] this.props.isOpen', this.props.isOpen); }

	getTrailer = async () => {

		if (this.props) {
			try {
				const youtubeSearchResponse = await axios(`https://content.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${this.props.searchParams}%20trailer&type=video&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`);
				let youtubeTrailerId = youtubeSearchResponse.data.items[0].id.videoId;

				this.setState({
					trailerId: youtubeTrailerId,
					trailerTitle: this.props.searchParams + " Trailer"
				});

			} catch (error) { console.error('error: ', error); }
		}
	}

	render() {

		return (

			<StyledDialog
				fullWidth
				maxWidth="lg"
				open={this.props.isOpen}
				onEnter={this.getTrailer}
				onClose={this.props.toggle}>

				<div className={"DialogTitleDiv"}>
					<DialogTitle id="scroll-dialog-title">{this.state.trailerTitle}</DialogTitle>
					<IconButton color="inherit" onClick={this.props.toggle} aria-label="Close"><CloseIcon /></IconButton>
				</div>

				<div className={"DialogContentYoutubeDivWrapper"}>
					<iframe allow={"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"} allowFullScreen
						src={`https://www.youtube.com/embed/${this.state.trailerId}?autoplay=0`} frameBorder={"0"} title={"Movie Trailer"}></iframe>
				</div>

				<DialogActions id={"TrailerModalActions"}>
					<Button color="inherit" onClick={this.props.toggle}>Close</Button>
				</DialogActions>

			</StyledDialog>

		);
	}
}

export default MovieTrailerModal;