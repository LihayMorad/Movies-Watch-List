import React, { PureComponent } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';

import './MovieTabs.css';

const torrentsSites = [
	{ "name": "RarBG", "url": "https://rarbgtor.org/torrents.php?search=" },
	{ "name": "TorrentDownloads", "url": "https://www.torrentdownloads.me/search/?s_cat=4&search=" },
	{ "name": "LimeTorrents", "url": "https://www.limetorrents.info/search/movie/" },
	{ "name": "1337X", "url": "https://1337x.to/category-search/", "urlExt": "/Movies/1/" },
	{ "name": "KickassTorrents", "url": " https://kat.rip/usearch/", "urlExt": " category:movies/" }
];
const subtitlesSites = [
	{ "name": "Subcenter", "url": "http://www.subscenter.biz/he/subtitle/search/?q=" },
	{ "name": "ScrewZira", "url": "https://www.screwzira.com/Search.aspx?q=" },
	{ "name": "Wizdom", "url": "https://wizdom.xyz/#/movies/" }
];

const styles = {
	"h6": { flexBasis: '33.33%', flexShrink: 0, textAlign: 'left', margin: 'auto 0' },
	"autoMg": { margin: 'auto' },
	"padding": { padding: '8px 10px' },
	"flexWrapPadding": { padding: '8px 10px', flexWrap: 'wrap' }
}

class MovieTabs extends PureComponent {

	state = {
		expanded: false
	};

	handleChange = panel => (e, expanded) => { this.setState({ expanded: expanded && panel }); };

	render() {
		const { expanded } = this.state;
		let ratings = "";
		const searchParams = `${this.props.title}+${this.props.year}`;
		const { userEmail } = this.props;

		if (this.props.ratings) {
			ratings = this.props.ratings.map(rating => (
				<Typography key={rating.Source} className={"ratingsText"} variant={'body2'} >
					{rating.Source}: {rating.Value}
				</Typography>));
		}

		const imdbRating = <a href={`https://www.imdb.com/title/${this.props.imdbId}`} target={"_blank"} rel="noopener noreferrer">
			{this.props.imdbRating === "N/A"
				? "N/A"
				: `IMDb: ${this.props.imdbRating}`}</a>;

		const torrents = torrentsSites.map(site => {
			let attributes = "";
			switch (site.name) {
				case "RarBG":
				case "TorrentDownloads":
				case "LimeTorrents": attributes = `${site.url}${searchParams}`; break;
				case "1337X": attributes = `${site.url}${searchParams}${site.urlExt}`; break;
				case "KickassTorrents": attributes = `${site.url}${this.props.title} ${this.props.year}${site.urlExt}`; break;
				default: return <p></p>;
			}
			return <a key={site.name} className={"downloadSitesLinks"} href={attributes} target="_blank" rel="noopener noreferrer">{site.name}</a>
		});

		const subtitles = subtitlesSites.map(site => {
			let attributes = "";
			switch (site.name) {
				case "Subcenter":
				case "ScrewZira": attributes = `${site.url}${this.props.title}`; break;
				case "Wizdom": attributes = `${site.url}${this.props.imdbId}`; break;
				default: return <p></p>;
			}
			return <a key={site.name} className={"downloadSitesLinks"} href={attributes} target="_blank" rel="noopener noreferrer">{site.name}</a>
		});

		const actors = this.props.actors.split(',').map(actor => {
			return <a key={actor.trim()} className={"actorsList"} href={`https://en.wikipedia.org/wiki/${actor}`} target="_blank" rel="noopener noreferrer"
				onClick={e => e.stopPropagation()}> {actor.trim()}</a >
		});

		const mainActor = actors[0];
		const fullcast = <a href={`https://www.imdb.com/title/${this.props.imdbId}/fullcredits/`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>more</a>;

		return (
			<div>

				<ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handleChange('panel1')} className={"tabsPanel"}>
					<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
						<Typography style={styles.h6} variant={'h6'}>Plot</Typography>
						<Typography style={styles.autoMg} variant={'subtitle2'}>{this.props.genre}</Typography>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails style={styles.padding}>{this.props.plot ? this.props.plot : ""}</ExpansionPanelDetails>
				</ExpansionPanel>

				<ExpansionPanel expanded={expanded === 'panel2'} onChange={this.handleChange('panel2')} className={"tabsPanel"}>
					<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
						<Typography style={styles.h6} variant={'h6'}>Cast</Typography>
						<Typography style={styles.autoMg} variant={'subtitle2'}>{mainActor}& {fullcast}</Typography>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails style={styles.padding}>
						<Typography style={styles.autoMg} variant={'body2'}>{actors.splice(1)}</Typography>
					</ExpansionPanelDetails>
				</ExpansionPanel>

				<ExpansionPanel expanded={expanded === 'panel3'} onChange={this.handleChange('panel3')} className={"tabsPanel"}>
					<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
						<Typography style={styles.h6} variant={'h6'}>Ratings</Typography>
						<Typography style={styles.autoMg} variant={'subtitle2'}>{imdbRating}</Typography>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails style={styles.padding}>{ratings}</ExpansionPanelDetails>
				</ExpansionPanel>

				{userEmail === "m141084@gmail.com" &&
					<ExpansionPanel expanded={expanded === 'panel4'} onChange={this.handleChange('panel4')} className={"tabsPanel"}>
						<ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
							<Typography style={styles.h6} variant={'h6'}>Downloads</Typography>
							<Typography style={styles.autoMg} variant={'subtitle2'}>Torrents & Subtitles</Typography>
						</ExpansionPanelSummary>
						<ExpansionPanelDetails style={styles.flexWrapPadding}>{torrents}</ExpansionPanelDetails>
						<Divider variant={'middle'}></Divider>
						<ExpansionPanelDetails style={styles.flexWrapPadding}>{subtitles}</ExpansionPanelDetails>
					</ExpansionPanel>}

			</div >
		);
	}
}

export default MovieTabs;