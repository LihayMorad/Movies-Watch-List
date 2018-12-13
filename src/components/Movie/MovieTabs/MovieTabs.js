import React, { Component } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


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
    let downloads = "";
    let searchParams = "";
    let mainActor = "";
    const downloadsSites = [
      { "name": "RarBG", "url": "https://rarbgtor.org/torrents.php?search=" },
      { "name": "ArenaBG", "url": "https://arenabg.com/torrents/search:" },
      { "name": "Subcenter", "url": "http://www.subscenter.biz/he/subtitle/search/?q=", "urlEx": "/time:tIjrdxFGYqxWNT54yoREdKBoz6i6U.aaCOcHksvsLXo/" },
    ];

    if (this.props.title) {

      ratings = this.props.ratings ?
        this.props.ratings.map(rating => <Typography key={this.props.imdbID} variant={'caption'}>{rating.Source}: {rating.Value}</Typography>)
        : <div></div>;
      searchParams = this.props.title + "+" + this.props.year;

      // onClick={()=>window.location.href='http://www.hyperlinkcode.com/button-links.php'
      downloads = downloadsSites.map(site => {
        switch (site.name) {
          case "RarBG": return <a style={{ margin: '0 auto' }} href={site.url + searchParams} target="_blank">{site.name}</a>
          case "ArenaBG": return <a style={{ margin: '0 auto' }} href={site.url + searchParams + site.urlEx} target="_blank">{site.name}</a>
          case "Subcenter": return <a style={{ margin: '0 auto' }} href={site.url + this.props.title} target="_blank">{site.name}</a>
          default: return <p></p>;
        }
      });

      mainActor = this.props.actors.split(',')[0];

      // downloads = (<div>
      //   <Typography><a href={"https://rarbgtor.org/torrents.php?search=" + searchParams} target="_blank">RarBG</a></Typography>
      //   <Typography><a href={"https://arenabg.com/torrents/search:" + searchParams + "/time:tIjrdxFGYqxWNT54yoREdKBoz6i6U.aaCOcHksvsLXo/"} target="_blank">ArenaBG</a></Typography>
      //   <Typography><a href={"http://www.subscenter.biz/he/subtitle/search/?q=" + this.props.title} target="_blank">Subcenter</a></Typography>
      // </div>);
    }

    return (
      // style={{ width: '100%' }}
      <div>

        <ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handleChange('panel1')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, margin: 'auto', textAlign: 'left'}} variant={'h6'}>Plot</Typography>
            <Typography style={{margin: 'auto'}} variant={'subtitle2'}>{this.props.genre}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{padding: '10px', borderTop: '1px solid rgba(0, 0, 0, 0.12)'}}>{this.props.plot}</ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel expanded={expanded === 'panel2'} onChange={this.handleChange('panel2')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, margin: 'auto', textAlign: 'left'}} variant={'h6'}>Actors</Typography>
            <Typography style={{margin: 'auto'}} variant={'subtitle2'}>{mainActor} and more</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{padding: '10px', borderTop: '1px solid rgba(0, 0, 0, 0.12)'}}>{this.props.actors}</ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel expanded={expanded === 'panel3'} onChange={this.handleChange('panel3')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 1, textAlign: 'left' }} variant={'h6'}>Ratings</Typography>
            <Typography style={{margin: 'auto'}} variant={'subtitle2'}>IMDb: {this.props.imdbRating} </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{padding: '10px', borderTop: '1px solid rgba(0, 0, 0, 0.12)'}}>{ratings}</ExpansionPanelDetails>
        </ExpansionPanel>
        
        <ExpansionPanel expanded={expanded === 'panel4'} onChange={this.handleChange('panel4')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography style={{ flexBasis: '33.33%', flexShrink: 0, textAlign: 'left' }} variant={'h6'}>Downloads</Typography>
            {/* <Typography style={{margin: 'auto'}} variant={'subtitle2'}>Downloads</Typography> */}
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{padding: '10px', borderTop: '1px solid rgba(0, 0, 0, 0.12)'}}>{downloads}</ExpansionPanelDetails>
        </ExpansionPanel>

      </div >
    );
  }
}

export default MovieTabs;



//       <div style={{ maxWidth: '300px' }}>
//         <AppBar position="static" color="default">
//           <Tabs
//             value={this.state.currentTab}
//             onChange={this.handleChange}
//             indicatorColor="primary"
//             textColor="primary"
//             centered>
//             <Tab label="Plot" />
//             <Tab label="Ratings" />
//              <Tab label="Item Three" /> 
//           </Tabs>
//         </AppBar>
//         {this.state.currentTab === 0 && <Typography variant="subheading" component="div" style={{ padding: 8 * 3 }}>
//           <p>{this.props.imdbRating}</p>
//           <p>{this.props.imdbRating}</p>
//         </Typography>}
//         {this.state.currentTab === 1 && <Typography variant="subheading" component="div" style={{ padding: 8 * 3 }}> Item Two </Typography>}
//         {this.state.currentTab === 2 && <Typography variant="subheading" component="div" style={{ padding: 8 * 3 }}>
//           {this.props.plot}
//         </Typography>}
//       </div>


//    <Typography component="div" dir={'x-reverse'}
//     variant="subheading" style={{ padding: 8 * 3 }}>
//      {ratingsArr} 
//  </Typography> 

// <Typography component="div" dir={'x-reverse'}
//     variant="subheading" style={{ padding: 8 * 3 }}>
//     <p>{this.props.plot}</p>
//   </Typography> 