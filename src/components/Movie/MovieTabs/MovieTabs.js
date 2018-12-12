import React, { Component } from 'react';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

class MovieTabs extends Component {
  state = {
    currentTab: 0,
  };

  handleChange = (event, value) => { this.setState({ currentTab: value }); };

  handleChangeIndex = index => { this.setState({ currentTab: index }); };

  render() {

    return (
      <div style={{ width: '300px' }}>
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.currentTab}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
          >
            <Tab label="Item One" />
            <Tab label="Item Two" />
            <Tab label="Item Three" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={'x-reverse'}
          index={this.state.currentTab}
          onChangeIndex={this.handleChangeIndex}
        >
          <Typography component="div" dir={'x-reverse'}
            style={{ padding: 8 * 3 }}>
            Item 1
          </Typography>

          <Typography component="div" dir={'x-reverse'}
            style={{ padding: 8 * 3 }}>
            Item 2
          </Typography>

          <Typography component="div" dir={'x-reverse'}
            style={{ padding: 8 * 3 }}>
            Item 3
          </Typography>

        </SwipeableViews>
      </div>
    );
  }
}

export default MovieTabs;
