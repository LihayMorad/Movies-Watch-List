import React, { PureComponent } from 'react';

import AccountsService from '../../../Services/AccountsService';

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';

import { torrentsSites, subtitlesSites } from './sites.json';

import { withStyles } from '@material-ui/core/styles';
import './MovieTabs.css';

const StyledExpansionPanel = withStyles({ root: { color: 'inherit' } })(Accordion);
const StyledAccordionDetails = withStyles({ root: { color: 'inherit', padding: '8px 10px' } })(AccordionDetails);
const StyledAccordionDetailsFlexWrap = withStyles({ root: { color: 'inherit', padding: '8px 10px', flexWrap: 'wrap' } })(AccordionDetails);
const StyledAccordionSummary = withStyles({ content: { color: 'inherit' }, expanded: { color: 'inherit' }, expandIcon: { color: 'inherit' } })(AccordionSummary);
const StyledTypographyH6 = withStyles({ root: { flexBasis: '33.33%', flexShrink: 0, textAlign: 'left', margin: 'auto 0', color: 'white' } })(Typography);
const StyledTypographyMg = withStyles({ root: { margin: 'auto' } })(Typography);
const StyledDivider = withStyles({ root: { height: '0.5px', backgroundColor: 'rgb(255 255 255 / 50%)' } })(Divider);

class MovieTabs extends PureComponent {

	state = {
		expanded: false
	};

	handlePanelChange = panel => (e, expanded) => { this.setState({ expanded: expanded && panel }); };

	render() {
		const { expanded } = this.state;
		const { watchingList } = this.props;
		const userEmail = !watchingList ? AccountsService.GetLoggedInUser().email : "";
		const searchParams = `${this.props.title}+${this.props.year}`;
		let ratings = "";

		if (this.props.ratings) {
			ratings = this.props.ratings.map(rating => <Typography key={rating.Source} className="ratingsText" variant="body2">
				{rating.Source}: {rating.Value}</Typography>);
		}

		const imdbRating = <a href={`https://www.imdb.com/title/${this.props.imdbID}`} target="_blank" rel="noopener noreferrer">
			IMDb: {!this.props.imdbRating || this.props.imdbRating === "N/A" ? "N/A" : this.props.imdbRating}</a>;

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
			return <a key={site.name} className="downloadSitesLinks" href={attributes} target="_blank" rel="noopener noreferrer">{site.name}</a>
		});

		const subtitles = subtitlesSites.map(site => {
			let attributes = "";
			switch (site.name) {
				case "ScrewZira": attributes = `${site.url}${this.props.title}`; break;
				case "Wizdom": attributes = `${site.url}${this.props.imdbID}`; break;
				default: return <p></p>;
			}
			return <a key={site.name} className="downloadSitesLinks" href={attributes} target="_blank" rel="noopener noreferrer">{site.name}</a>
		});

		const actors = this.props.actors.split(',').map(actor => (
			<a key={actor.trim()} className="actorsList" href={`https://en.wikipedia.org/wiki/${actor}`} target="_blank" rel="noopener noreferrer"
				onClick={e => e.stopPropagation()}> {actor.trim()}</a>
		));

		const mainActor = actors[0];
		const fullcast = <a href={`https://www.imdb.com/title/${this.props.imdbID}/fullcredits/`} target="_blank" rel="noopener noreferrer"
			onClick={e => e.stopPropagation()}>more</a>;

		return (
			<div>

				<StyledExpansionPanel className="tabsPanel" expanded={expanded === "panel1"} onChange={this.handlePanelChange("panel1")}>
					<StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
						<StyledTypographyH6 color="inherit" variant="h6">Plot</StyledTypographyH6>
						<StyledTypographyMg color="inherit" variant="subtitle2">{this.props.genre}</StyledTypographyMg>
					</StyledAccordionSummary>
					<StyledAccordionDetails>{this.props.plot || ""}</StyledAccordionDetails>
				</StyledExpansionPanel>

				<StyledExpansionPanel className="tabsPanel" expanded={expanded === "panel2"} onChange={this.handlePanelChange("panel2")}>
					<StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
						<StyledTypographyH6 color="inherit" variant="h6">Cast</StyledTypographyH6>
						<StyledTypographyMg color="inherit" variant="subtitle2">{mainActor}& {fullcast}</StyledTypographyMg>
					</StyledAccordionSummary>
					<StyledAccordionDetails>
						<StyledTypographyMg color="inherit" variant="body2">{actors.slice(1)}</StyledTypographyMg>
					</StyledAccordionDetails>
				</StyledExpansionPanel>

				{this.props.ratings && this.props.ratings.length > 0 && <StyledExpansionPanel className="tabsPanel" expanded={expanded === "panel3"} onChange={this.handlePanelChange("panel3")}>
					<StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
						<StyledTypographyH6 color="inherit" variant="h6">Ratings</StyledTypographyH6>
						<StyledTypographyMg color="inherit" variant="subtitle2">{imdbRating}</StyledTypographyMg>
					</StyledAccordionSummary>
					<StyledAccordionDetails>{ratings}</StyledAccordionDetails>
				</StyledExpansionPanel>}

				{userEmail === "m141084@gmail.com" &&
					<StyledExpansionPanel className="tabsPanel" expanded={expanded === "panel4"} onChange={this.handlePanelChange("panel4")}>
						<StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
							<StyledTypographyH6 color="inherit" variant="h6">Downloads</StyledTypographyH6>
							<StyledTypographyMg color="inherit" variant="subtitle2">Torrents & Subtitles</StyledTypographyMg>
						</StyledAccordionSummary>
						<StyledAccordionDetailsFlexWrap>{torrents}</StyledAccordionDetailsFlexWrap>
						<StyledDivider variant="middle"></StyledDivider>
						<StyledAccordionDetailsFlexWrap>{subtitles}</StyledAccordionDetailsFlexWrap>
					</StyledExpansionPanel>}

			</div>
		);
	}
}

export default MovieTabs;