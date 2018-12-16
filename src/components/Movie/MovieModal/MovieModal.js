import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import axios from 'axios';

// import YTSearch from 'ytsearch';

import './MovieModal.css';

class MovieModal extends Component {

  state = {
    trailerId: "",
    trailerTitle: ""
  }

  // componentDidMount() {
  //   console.log('Movie Modal [componentDidMount] this.props.isOpen', this.props.isOpen);
  // }

  // componentDidUpdate() {
  //   console.log('Movie Modal [componentDidMount] this.props.isOpen', this.props.isOpen);
  // }

  // https://upload.wikimedia.org/wikipedia/en/thumb/6/63/IMG_%28business%29.svg/1200px-IMG_%28business%29.svg.png

  // 'colors'),
  // 'format-number')(),
  // 'minimist'),
  // 'youtube-best-video').findBestMusicVideo,
  // 'youtube-search'),
  // 'slashes'),
  // 'timelabel'),
  // ('get-youtube-id'),

  async getTrailer() {
    console.log('this.props.searchParams: ', this.props.searchParams);

    if (this.props) {
      const youtubeSearchResponse = await axios(`https://content.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${this.props.searchParams}%20trailer&type=video&key=AIzaSyCUbrEdnpgemTm9Qivmu6Aeg44bNOKl2Uo`);
      try {
        let youtubeTrailerId = youtubeSearchResponse.data.items[0].id.videoId;
        let youtubeTrailerTitle = youtubeSearchResponse.data.items[0].snippet.title;
        console.log('youtubeTrailerId', youtubeSearchResponse.data.items[0]);
        console.log('youtubeTrailerTitle: ', youtubeTrailerTitle);

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
          maxWidth="xl"
          open={this.props.isOpen}
          onClose={this.props.toggle}
          onEnter={this.getTrailer.bind(this)}>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DialogTitle style={{ margin: 'auto' }} id="scroll-dialog-title">{this.state.trailerTitle}</DialogTitle>
            <IconButton style={{ position: 'absolute' }} color="inherit" onClick={this.props.toggle} aria-label="Close"><CloseIcon /></IconButton>
          </div>

          <DialogContent>
            <div className={"videowrapper"}>
              <iframe width={"560px"} height={"315px"} src={`https://www.youtube.com/embed/${this.state.trailerId}?autoplay=0`} frameBorder={"0"}
                allow={"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"} allowFullScreen title={"Movie Trailer"}></iframe>
            </div>
            {/* <DialogContentText>Cras mattis consectetur purus sit amet fermentum.</DialogContentText> */}
          </DialogContent>

          <DialogActions style={{ margin: '0' }}>
            <Button style={{ margin: '0', padding: '12px' }} color="inherit" onClick={this.props.toggle}>Close</Button>
          </DialogActions>

        </Dialog>

      </div>
    );
  }
}

export default MovieModal;