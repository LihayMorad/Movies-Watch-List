import React, { Component } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';

import './MovieTabs.css';

class MovieTabs extends Component {

  state = {
    expanded: null,
  };

  handleChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
    });
  };

  render() {
    // console.log('[this.props]', this.props);

    const { expanded } = this.state;
    let ratings = "";
    let imdbRating = "";
    let torrents = [];
    let subtitles = [];
    let searchParams = "";
    let actors = [];
    let mainActor = "";
    let fullcast = "";
    const torrentsSites = [
      { "name": "RarBG", "url": "https://rarbgtor.org/torrents.php?search=" },
      { "name": "TorrentDownloads", "url": "https://www.torrentdownloads.me/search/?s_cat=4&search=" },
      { "name": "1337X", "url": "https://1337x.to/category-search/", "urlExt": "/Movies/1/" },
      { "name": "LimeTorrents", "url": "https://www.limetorrents.info/search/movie/" },
      { "name": "KickassTorrents", "url": " https://kat.rip/usearch/", "urlExt": " category:movies/" },
    ];
    const subtitlesSites = [
      { "name": "Subcenter", "url": "http://www.subscenter.biz/he/subtitle/search/?q=" },
      { "name": "Wizdom", "url": "https://wizdom.xyz/#/movies/" },
      { "name": "ScrewZira", "url": "https://www.screwzira.com/Search.aspx?q=" },
    ];

    if (this.props.title) {
      // onClick={()=>window.location.href='http://www.hyperlinkcode.com/button-links.php'

      ratings = this.props.ratings ? this.props.ratings.map(rating =>
        <Typography key={`${this.props.imdbID}_${rating.Source}`} className={"ratingsText"} variant={'body2'} >{rating.Source}: {rating.Value}</Typography>) : <div></div>;
      imdbRating = this.props.imdbRating === "N/A" ? "N/A" : `IMDb: ${this.props.imdbRating}`;

      searchParams = this.props.title + "+" + this.props.year;

      torrents = torrentsSites.map(site => {
        let attributes = "";
        switch (site.name) {
          case "RarBG": attributes = `${site.url}${searchParams}`; break;
          case "TorrentDownloads": attributes = `${site.url}${searchParams}`; break;
          case "1337X": attributes = `${site.url}${searchParams}${site.urlExt}`; break;
          case "LimeTorrents": attributes = `${site.url}${searchParams}`; break;
          case "KickassTorrents": attributes = `${site.url}${this.props.title} ${this.props.year}${site.urlExt}`; break;
          default: return <p></p>;
        }
        return <a key={`${this.props.imdbId}_${site.name}`} className={"downloadSitesLinks"} href={attributes} target="_blank" rel="noopener noreferrer">{site.name}</a>
      });

      subtitles = subtitlesSites.map(site => {
        let attributes = "";
        switch (site.name) {
          case "Subcenter": attributes = `${site.url}${this.props.title}`; break;
          case "Wizdom": attributes = `${site.url}${this.props.imdbId}`; break;
          case "ScrewZira": attributes = `${site.url}${this.props.title}`; break;
          default: return <p></p>;
        }
        return <a key={`${this.props.imdbId}_${site.name}`} className={"downloadSitesLinks"} href={attributes} target="_blank" rel="noopener noreferrer">{site.name}</a>
      });

      actors = this.props.actors.split(',').map(actor => {
        return <a key={`${this.props.imdbId} _${actor} `} href={`https://en.wikipedia.org/wiki/${actor}`} target={"_blank"} rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
          className={"actorsList"}> {actor.trim()}</a >
      });

      mainActor = actors[0];
      fullcast = <a href={`https://www.imdb.com/title/${this.props.imdbId}/fullcredits/`} target={"_blank"} rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>more</a>
    }

    return (

<div>

        <ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handleChange('panel1')} style={{ borderTop: 'solid 1px dodgerblue', borderRadius: '10px' }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, textAlign: 'left', margin: 'auto' }} variant={'h6'}>Plot</Typography>
            <Typography style={{ margin: 'auto' }} variant={'subtitle2'}>{this.props.genre}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ padding: '8px 10px' }}>{this.props.plot ? this.props.plot : ""}</ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel expanded={expanded === 'panel2'} onChange={this.handleChange('panel2')} style={{ borderTop: 'solid 1px dodgerblue', borderRadius: '10px' }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, textAlign: 'left', margin: 'auto' }} variant={'h6'}>Cast</Typography>
            <Typography style={{ margin: 'auto' }} variant={'subtitle2'}>{mainActor}& {fullcast}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ padding: '8px 10px' }}>
            <Typography style={{ margin: 'auto' }} variant={'body2'}>{actors.splice(1)}</Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel expanded={expanded === 'panel3'} onChange={this.handleChange('panel3')} style={{ borderTop: 'solid 1px dodgerblue', borderRadius: '10px' }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, textAlign: 'left' }} variant={'h6'}>Ratings</Typography>
            <Typography style={{ margin: 'auto' }} variant={'subtitle2'}>{imdbRating}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ padding: '8px 10px' }}>{ratings}</ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel expanded={expanded === 'panel4'} onChange={this.handleChange('panel4')} style={{ borderTop: 'solid 1px dodgerblue', borderRadius: '10px' }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, textAlign: 'left' }} variant={'h6'}>Downloads</Typography>
            <Typography style={{ margin: 'auto' }} variant={'subtitle2'}>Torrents & Subtitles</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ padding: '8px 10px', flexWrap: 'wrap' }}>{torrents}</ExpansionPanelDetails>
          <Divider variant="middle"></Divider>
          <ExpansionPanelDetails style={{ padding: '8px 10px', flexWrap: 'wrap' }}>{subtitles}</ExpansionPanelDetails>

        </ExpansionPanel>

      </div >
    );
  }
}

export default MovieTabs;