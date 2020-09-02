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
const StyledAccordionSummary = withStyles({ expandIcon: { color: 'inherit' } })(AccordionSummary);
const StyledTypographyH6 = withStyles({
    root: { flexBasis: '33.33%', flexShrink: 0, textAlign: 'left', margin: 'auto 0' },
})(Typography);
const StyledTypographyMg = withStyles({ root: { margin: 'auto', color: 'inherit' } })(Typography);
const StyledDivider = withStyles({
    root: { height: '0.5px', backgroundColor: 'rgb(255 255 255 / 50%)' },
})(Divider);

class MovieTabs extends PureComponent {
    state = {
        expanded: false,
    };

    handlePanelChange = (panel) => (e, expanded) => {
        this.setState({ expanded: expanded && panel });
    };

    render() {
        const { expanded } = this.state;
        const { watchingList, imdbID, title, year, genre, plot } = this.props;
        const userEmail = !watchingList ? AccountsService.GetLoggedInUser().email : '';
        const searchParams = `${title}+${year}`;
        let ratings = '';

        if (this.props.ratings && this.props.ratings.length > 0) {
            ratings = this.props.ratings.map((rating) => (
                <Typography key={rating.Source} className="ratingsText" variant="body2">
                    {rating.Source}: {rating.Value}
                </Typography>
            ));
        }

        const imdbRating = (
            <a
                href={`https://www.imdb.com/title/${imdbID}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                IMDb:{' '}
                {!this.props.imdbRating || this.props.imdbRating === 'N/A'
                    ? 'N/A'
                    : this.props.imdbRating}
            </a>
        );

        const torrents = torrentsSites.map((site) => {
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

        const subtitles = subtitlesSites.map((site) => {
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

        const actors = this.props.actors.split(',').map((actor) => (
            <a
                key={actor.trim()}
                className="actorsList"
                href={`https://en.wikipedia.org/wiki/${actor}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
            >
                {actor.trim()}
            </a>
        ));

        const mainActor = actors[0];
        const fullCast = (
            <a
                href={`https://www.imdb.com/title/${imdbID}/fullcredits/`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
            >
                more
            </a>
        );

        return (
            <div>
                <StyledExpansionPanel
                    className="tabsPanel"
                    expanded={expanded === 'panel1'}
                    onChange={this.handlePanelChange('panel1')}
                >
                    <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <StyledTypographyH6 variant="h6">Plot</StyledTypographyH6>
                        <StyledTypographyMg variant="subtitle2">{genre}</StyledTypographyMg>
                    </StyledAccordionSummary>
                    <AccordionDetails>{plot || ''}</AccordionDetails>
                </StyledExpansionPanel>

                <StyledExpansionPanel
                    className="tabsPanel"
                    expanded={expanded === 'panel2'}
                    onChange={this.handlePanelChange('panel2')}
                >
                    <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <StyledTypographyH6 variant="h6">Cast</StyledTypographyH6>
                        <StyledTypographyMg variant="subtitle2">
                            {mainActor}& {fullCast}
                        </StyledTypographyMg>
                    </StyledAccordionSummary>
                    <AccordionDetails>
                        <StyledTypographyMg variant="body2">{actors.slice(1)}</StyledTypographyMg>
                    </AccordionDetails>
                </StyledExpansionPanel>

                {ratings && (
                    <StyledExpansionPanel
                        className="tabsPanel"
                        expanded={expanded === 'panel3'}
                        onChange={this.handlePanelChange('panel3')}
                    >
                        <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <StyledTypographyH6 variant="h6">Ratings</StyledTypographyH6>
                            <StyledTypographyMg variant="subtitle2">
                                {imdbRating}
                            </StyledTypographyMg>
                        </StyledAccordionSummary>
                        <AccordionDetails>{ratings}</AccordionDetails>
                    </StyledExpansionPanel>
                )}

                {userEmail === atob(process.env.REACT_APP_EMAIL_BTOA) && (
                    <StyledExpansionPanel
                        className="tabsPanel"
                        expanded={expanded === 'panel4'}
                        onChange={this.handlePanelChange('panel4')}
                    >
                        <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <StyledTypographyH6 variant="h6">Downloads</StyledTypographyH6>
                            <StyledTypographyMg variant="subtitle2">
                                Torrents & Subtitles
                            </StyledTypographyMg>
                        </StyledAccordionSummary>
                        <StyledAccordionDetails>{torrents}</StyledAccordionDetails>
                        <StyledDivider variant="middle"></StyledDivider>
                        <StyledAccordionDetails>{subtitles}</StyledAccordionDetails>
                    </StyledExpansionPanel>
                )}
            </div>
        );
    }
}

export default MovieTabs;
