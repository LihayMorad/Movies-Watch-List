import React, { Component } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';

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
    console.log('[this.props]', this.props);

    const { expanded } = this.state;
    let ratings = "";
    let torrents = [];
    let subtitles = [];
    let searchParams = "";
    let actors = [];
    let mainActor = "";
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

      ratings = this.props.ratings ?
        this.props.ratings.map(rating => <Typography key={this.props.imdbID} style={{ padding: '5px' }} variant={'body2'} >{rating.Source}: {rating.Value}</Typography>)
        : <div></div>;

      searchParams = this.props.title + "+" + this.props.year;

      torrents = torrentsSites.map(site => {
        switch (site.name) {
          case "RarBG": return <a style={{ margin: '0 auto' }} href={site.url + searchParams} target="_blank" rel="noopener noreferrer">{site.name}</a>
          case "TorrentDownloads": return <a style={{ margin: '0 auto' }} href={site.url + searchParams} target="_blank" rel="noopener noreferrer">{site.name}</a>
          case "1337X": return <a style={{ margin: '0 auto' }} href={site.url + searchParams + site.urlExt} target="_blank" rel="noopener noreferrer">{site.name}</a>
          case "LimeTorrents": return <a style={{ margin: '0 auto' }} href={site.url + searchParams} target="_blank" rel="noopener noreferrer">{site.name}</a>
          case "KickassTorrents": return <a style={{ margin: '0 auto' }} href={site.url + this.props.title + " " + this.props.year + site.urlExt} target="_blank" rel="noopener noreferrer">{site.name}</a>
          default: return <p></p>;
        }
      });

      subtitles = subtitlesSites.map(site => {
        switch (site.name) {
          case "Subcenter": return <a style={{ margin: '0 auto' }} href={site.url + this.props.title} target="_blank" rel="noopener noreferrer">{site.name}</a>
          case "Wizdom": return <a style={{ margin: '0 auto' }} href={site.url + this.props.imdbId} target="_blank" rel="noopener noreferrer">{site.name}</a>
          case "ScrewZira": return <a style={{ margin: '0 auto' }} href={site.url + this.props.title} target="_blank" rel="noopener noreferrer">{site.name}</a>
          default: return <p></p>;
        }
      });

      actors = this.props.actors.split(',').map(actor => {
        return <a href={"https://en.wikipedia.org/wiki/" + actor} target={"_blank"} onClick={(e) => e.stopPropagation()}
          style={{ display: 'inline-block', paddingLeft: '5px' }}>{actor.trim()}</a>
      });

      mainActor = actors[0];
    }

    return (
      // style={{ width: '100%' }}
      <div>

        <ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handleChange('panel1')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, textAlign: 'left', margin: 'auto' }} variant={'h6'}>Plot</Typography>
            <Typography style={{ margin: 'auto' }} variant={'subtitle2'}>{this.props.genre}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ padding: '8px 10px', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>{this.props.plot}</ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel expanded={expanded === 'panel2'} onChange={this.handleChange('panel2')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, textAlign: 'left', margin: 'auto' }} variant={'h6'}>Actors</Typography>
            <Typography style={{ margin: 'auto' }} variant={'subtitle2'}>{mainActor}  &  more</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ padding: '8px 10px', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Typography variant={'body2'}>{actors.splice(1)}</Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel expanded={expanded === 'panel3'} onChange={this.handleChange('panel3')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, textAlign: 'left' }} variant={'h6'}>Ratings</Typography>
            <Typography style={{ margin: 'auto' }} variant={'subtitle2'}>IMDb: {this.props.imdbRating}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ padding: '8px 10px', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>{ratings}</ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel expanded={expanded === 'panel4'} onChange={this.handleChange('panel4')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, textAlign: 'left' }} variant={'h6'}>Downloads</Typography>
            <Typography style={{ margin: 'auto' }} variant={'subtitle2'}>Torrents & Subtitles</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ padding: '8px 10px', borderTop: '1px solid rgba(0, 0, 0, 0.12)', flexWrap: 'wrap' }}>{torrents}</ExpansionPanelDetails>
          <Divider variant="middle"></Divider>
          <ExpansionPanelDetails style={{ padding: '8px 10px', flexWrap: 'wrap' }}>{subtitles}</ExpansionPanelDetails>

        </ExpansionPanel>

      </div >
    );
  }
}

export default MovieTabs;