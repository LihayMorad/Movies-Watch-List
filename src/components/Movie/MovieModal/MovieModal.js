import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import axios from 'axios';

import './MovieModal.css';

class MovieModal extends Component {

  state = {
    trailerId: "",
    trailerTitle: ""
  }

  // componentDidMount() { console.log('Movie Modal [componentDidMount] this.props.isOpen', this.props.isOpen); }

  // componentDidUpdate() { console.log('Movie Modal [componentDidMount] this.props.isOpen', this.props.isOpen); }

  async getTrailer() {
    // console.log('this.props.searchParams: ', this.props.searchParams);

    if (this.props) {
      const youtubeSearchResponse = await axios(`https://content.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${this.props.searchParams}%20trailer&type=video&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`);
      try {

        let youtubeTrailerId = youtubeSearchResponse.data.items[0].id.videoId;
        let youtubeTrailerTitle = youtubeSearchResponse.data.items[0].snippet.title;

        this.setState({
          trailerId: youtubeTrailerId,
          trailerTitle: youtubeTrailerTitle
        });

      } catch (error) {
        console.error('error: ', error);
      }
    }

  }
  render() {

    return (
      <div>

        <Dialog
          fullWidth
          maxWidth="lg"
          open={this.props.isOpen}
          onClose={this.props.toggle}
          onEnter={this.getTrailer.bind(this)}>

          <div className={"DialogTitleDiv"}>
            <DialogTitle style={{ margin: 'auto' }} id="scroll-dialog-title">{this.state.trailerTitle}</DialogTitle>
            <IconButton style={{ position: 'absolute', right: '0' }} color="inherit" onClick={this.props.toggle} aria-label="Close"><CloseIcon /></IconButton>
          </div>

          <div className={"DialogContentYoutubeDivWrapper"}>
            <iframe width={"100%"} height={"100%"} src={`https://www.youtube.com/embed/${this.state.trailerId}?autoplay=0`} frameBorder={"0"}
              allow={"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"} allowFullScreen title={"Movie Trailer"}></iframe>
          </div>

          <DialogActions style={{ margin: '0' }}>
            <Button style={{ margin: '0', padding: '12px' }} color="inherit" onClick={this.props.toggle}>Close</Button>
          </DialogActions>

        </Dialog>

      </div>
    );
  }
}

export default MovieModal;