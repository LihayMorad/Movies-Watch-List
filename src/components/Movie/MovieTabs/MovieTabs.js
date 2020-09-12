import React, { PureComponent } from 'react';

import AccountsService from '../../../Services/AccountsService';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    Divider,
} from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

import { torrentsSites, subtitlesSites } from './sites.json';

const StyledExpansionPanel = withStyles({ root: { color: 'white' } })(Accordion);
const StyledAccordionDetails = withStyles({
    root: { flexWrap: 'wrap', justifyContent: 'space-around' },
})(AccordionDetails);
const StyledAccordionSummary = withStyles({
    expandIcon: { color: 'inherit', padding: '12px 5px' },
})(AccordionSummary);
const StyledTypographyH6 = withStyles({
    root: { flexBasis: '25%', flexShrink: 0, textAlign: 'left', margin: 'auto 0' },
})(Typography);
const StyledTypographyMg = withStyles({
    root: { margin: 'auto', padding: '0 5px', color: 'inherit' },
})(Typography);
const StyledDivider = withStyles({
    root: { height: '0.5px', backgroundColor: 'rgb(255 255 255 / 50%)' },
})(Divider);

class MovieTabs extends PureComponent {
    state = {
        expanded: null,
    };

    onTabChange = (panel) => (e, expanded) => {
        this.setState({ expanded: expanded && panel });
    };

    getRatings = () => {
        const { ratings } = this.props;

        if (!ratings || !ratings.length) return null;

        return ratings.map((rating) => (
            <Typography key={rating.Source} className="ratingsText" variant="body2">
                {rating.Source}: {rating.Value}
            </Typography>
        ));
    };

    getImdbRating = () => {
        const { imdbID, imdbRating } = this.props;
        return (
            <a
                href={`https://www.imdb.com/title/${imdbID}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                IMDb: {!imdbRating || imdbRating === 'N/A' ? 'N/A' : imdbRating}
            </a>
        );
    };

    getTorrentsLinks = () => {
        const { title, year } = this.props;
        const searchParams = `${title}+${year}`;
        return torrentsSites.map((site) => {
            let attributes = '';
            switch (site.name) {
                case 'RarBG':
                case 'TorrentDownloads':
                case 'LimeTorrents':
                    attributes = `${site.url}${searchParams}`;
                    break;
                case '1337X':
                    attributes = `${site.url}${searchParams}${site.urlExt}`;
                    break;
                case 'KickassTorrents':
                    attributes = `${site.url}${title} ${year}${site.urlExt}`;
                    break;
                default:
                    return <p></p>;
            }
            return (
                <a
                    key={site.name}
                    className="downloadSitesLinks"
                    href={attributes}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {site.name}
                </a>
            );
        });
    };

    getSubtitlesLinks = () => {
        const { imdbID, title } = this.props;
        return subtitlesSites.map((site) => {
            let attributes = '';
            switch (site.name) {
                case 'ScrewZira':
                    attributes = `${site.url}${title}`;
                    break;
                case 'Wizdom':
                    attributes = `${site.url}${imdbID}`;
                    break;
                default:
                    return <p></p>;
            }
            return (
                <a
                    key={site.name}
                    className="downloadSitesLinks"
                    href={attributes}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {site.name}
                </a>
            );
        });
    };

    getActors = () => {
        const actors = this.props.actors && this.props.actors.split(',');
        if (!actors) return [];
        return actors.map((actor) => (
            <a
                key={actor.trim()}
                className="actor"
                href={`https://en.wikipedia.org/wiki/${actor.trim()}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
            >
                {actor.trim()}
            </a>
        ));
    };

    getFullCast = () => {
        return (
            <a
                href={`https://www.imdb.com/title/${this.props.imdbID}/fullcredits/`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
            >
                more
            </a>
        );
    };

    getAward = (value) => {
        return (
            <a
                key={value}
                className="award"
                href={`https://www.imdb.com/title/${this.props.imdbID}/awards/`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
            >
                {value}
            </a>
        );
    };

    getAwards = () => {
        if (!this.props.awards || this.props.awards === 'N/A') return [];
        const awards =
            this.props.awards &&
            (this.props.awards || '')
                .split('.')
                .filter((award) => award)
                .map((award) => this.getAward(award.trim()));
        return awards.length === 1 ? awards.concat(this.getAward('All Awards')) : awards;
    };

    getTab = (tabKey, summary, details, detailsComp) => {
        return (
            <StyledExpansionPanel
                className="tabsPanel"
                expanded={this.state.expanded === tabKey}
                onChange={this.onTabChange(tabKey)}
                TransitionProps={{ unmountOnExit: true }}
            >
                <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {summary}
                </StyledAccordionSummary>
                {detailsComp || <AccordionDetails>{details}</AccordionDetails>}
            </StyledExpansionPanel>
        );
    };

    getTabs = () => {
        const { watchMode, genre, plot } = this.props;
        const userEmail = !watchMode ? AccountsService.GetLoggedInUser().email : '';

        const ratings = this.getRatings();
        const imdbRating = ratings && this.getImdbRating();
        const torrentsLinks = this.getTorrentsLinks();
        const subtitlesLinks = this.getSubtitlesLinks();
        const [leadingActor, ...supportingActors] = this.getActors();
        const fullCast = this.getFullCast();
        const [award, ...otherAwards] = this.getAwards();

        return (
            <div>
                {this.getTab(
                    'panel1',
                    <>
                        <StyledTypographyH6 variant="h6">Plot</StyledTypographyH6>
                        <StyledTypographyMg variant="subtitle2">{genre}</StyledTypographyMg>
                    </>,
                    plot || ''
                )}

                {this.getTab(
                    'panel2',
                    <>
                        <StyledTypographyH6 variant="h6">Cast</StyledTypographyH6>
                        <StyledTypographyMg variant="subtitle2">
                            {leadingActor}& {fullCast}
                        </StyledTypographyMg>
                    </>,
                    <StyledTypographyMg variant="body2">{supportingActors}</StyledTypographyMg>
                )}

                {ratings &&
                    this.getTab(
                        'panel3',
                        <>
                            <StyledTypographyH6 variant="h6">Ratings</StyledTypographyH6>
                            <StyledTypographyMg variant="subtitle2">
                                {imdbRating}
                            </StyledTypographyMg>
                        </>,
                        ratings
                    )}

                {award &&
                    this.getTab(
                        'panel4',
                        <>
                            <StyledTypographyH6 variant="h6">Awards</StyledTypographyH6>
                            <StyledTypographyMg variant="subtitle2">{award}</StyledTypographyMg>
                        </>,
                        null,
                        <StyledAccordionDetails>{otherAwards}</StyledAccordionDetails>
                    )}

                {userEmail === atob(process.env.REACT_APP_EMAIL_BTOA) &&
                    this.getTab(
                        'panel5',
                        <>
                            <StyledTypographyH6 variant="h6">Downloads</StyledTypographyH6>
                            <StyledTypographyMg variant="subtitle2">
                                Torrents & Subtitles
                            </StyledTypographyMg>
                        </>,
                        null,
                        <>
                            <StyledAccordionDetails>{torrentsLinks}</StyledAccordionDetails>
                            <StyledDivider variant="middle"></StyledDivider>
                            <StyledAccordionDetails>{subtitlesLinks}</StyledAccordionDetails>
                        </>
                    )}
            </div>
        );
    };

    render() {
        return this.getTabs();
    }
}

export default MovieTabs;
