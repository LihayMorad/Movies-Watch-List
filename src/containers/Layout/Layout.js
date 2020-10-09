import React, { Component } from 'react';

import { connect } from 'react-redux';
import {
    saveMovies,
    saveMoviesYears,
    toggleLoadingMovies,
    toggleSnackbar,
    updateMoviesCounter,
} from '../../store/actions';

import AccountsService from '../../Services/AccountsService';

import Header from '../../components/UI Elements/Header/Header';
import AccountMenu from '../../components/AccountMenu/AccountMenu';
import FiltersMenu from '../../components/FiltersMenu/FiltersMenu';
import MoviesContainer from '../MoviesContainer/MoviesContainer';
import Attributions from '../../components/UI Elements/Attributions/Attributions';
import Snackbar from '../../components/UI Elements/Snackbar/Snackbar';

import { Tooltip, Fab, Zoom } from '@material-ui/core';
import { Navigation as NavigationIcon } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

import TrackVisibility from 'react-on-screen';

const StyledTooltip = withStyles({
    tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' },
    arrow: { color: 'black' },
})(Tooltip);

class Layout extends Component {
    constructor(props) {
        super(props);

        this.topMenuRef = React.createRef();
        this.state = { ...this.handleQueryParams() };
    }

    componentDidMount() {
        AccountsService.InitAccountService().onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                this.setState({ loggedInUser: user });
                if (!this.state.watchMode) {
                    this.getMovies();
                    this.setDBListeners();
                }
            } else {
                // User is signed off.
                this.setState({ loggedInUser: null });
                this.clearDBListeners(['movies', 'yearsAndCounter']);
            }
        });
    }

    componentWillUnmount() {
        this.clearDBListeners(['movies', 'yearsAndCounter']);
    }

    componentDidUpdate(prevProps) {
        if (this.props.filters !== prevProps.filters) {
            this.getMovies();
        }
    }

    getMovies = () => {
        this.props.toggleLoadingMovies(true);

        this.clearDBListeners(['movies']);

        const { filter, order, year, maxResults, showWatchedMovies } = this.props.filters;
        const filterToShow = filter === 'releaseYear' ? 'Year' : filter;
        const orderToShow = order === 'descending' ? 'desc' : 'asc';
        let moviesDBRef = AccountsService.GetDBRef('userMovies');

        if (year === 'All') {
            moviesDBRef = moviesDBRef.orderBy(filterToShow, orderToShow);
        } else {
            // specific year
            moviesDBRef = moviesDBRef.where('Year', '==', year);
            if (filterToShow !== 'Year') {
                moviesDBRef = moviesDBRef.orderBy(filterToShow, orderToShow);
            }
        }

        const DBListener = moviesDBRef
            .where('Watched', '==', showWatchedMovies)
            .limit(maxResults)
            .onSnapshot(
                (response) => {
                    if (!response.empty && response.docs) {
                        const mappedMovies = response.docs.map((doc) => ({
                            key: doc.id,
                            ...doc.data(),
                        }));
                        this.props.saveMovies(mappedMovies);
                    } else {
                        this.props.saveMovies([]);
                    }
                },
                () => {
                    this.props.toggleLoadingMovies(false);
                    this.props.toggleSnackbar(
                        true,
                        `There was an error retrieving movies`,
                        'error'
                    );
                }
            );

        this.setState({ DBListeners: { ...this.state.DBListeners, movies: DBListener } });
    };

    setDBListeners = () => {
        this.clearDBListeners(['yearsAndCounter']);
        const DBListener = AccountsService.GetDBRef('user').onSnapshot(
            (response) => {
                if (response.exists && response.data()) {
                    if (response.data().counter) {
                        this.props.updateMoviesCounter(response.data().counter);
                    }
                    if (response.data().years) {
                        const years = new Set([...response.data().years]) || [];
                        this.props.saveMoviesYears([...years].sort((a, b) => b - a));
                    }
                }
            },
            (error) => {}
        );

        this.setState({ DBListeners: { ...this.state.DBListeners, yearsAndCounter: DBListener } });
    };

    clearDBListeners = (listeners) => {
        if (this.state.DBListeners) {
            listeners.forEach((listener) => {
                this.state.DBListeners[listener] && this.state.DBListeners[listener]();
            });
        }
    };

    scrollToMenu = () => {
        window.scrollTo({ top: this.topMenuRef.current.offsetTop, behavior: 'smooth' });
    };

    handleQueryParams = () => {
        const paramsString = window.location.search;
        const searchParams = new URLSearchParams(paramsString);
        return {
            watchMode: searchParams.has('watchMode') && searchParams.get('watchMode') === 'true',
            watchModeUserInfo: searchParams.has('user') && searchParams.get('user'),
        };
    };

    render() {
        const { loggedInUser, watchMode, watchModeUserInfo } = this.state;
        let filtersMenu = null;

        if (loggedInUser && !watchMode) {
            filtersMenu = (
                <TrackVisibility partialVisibility>
                    {({ isVisible }) => (
                        <>
                            <div ref={this.topMenuRef}>
                                <FiltersMenu />
                            </div>
                            <StyledTooltip
                                title="Scroll up to filters menu"
                                disableFocusListener
                                disableTouchListener
                                TransitionComponent={Zoom}
                                arrow
                            >
                                <Fab
                                    className={`scrollToMenu ${!isVisible ? 'show' : ''}`}
                                    color="primary"
                                    variant="extended"
                                    size="small"
                                    onClick={this.scrollToMenu}
                                >
                                    <NavigationIcon />
                                </Fab>
                            </StyledTooltip>
                        </>
                    )}
                </TrackVisibility>
            );
        }

        return (
            <>
                <Header />

                <AccountMenu />

                {filtersMenu}

                <MoviesContainer
                    watchMode={watchMode}
                    watchModeUserInfo={watchModeUserInfo}
                    loggedInUser={loggedInUser}
                />

                <Attributions />

                <Snackbar />
            </>
        );
    }
}

const mapStateToProps = ({ filters }) => ({ filters });

const mapDispatchToProps = (dispatch) => ({
    saveMovies: (movies) => dispatch(saveMovies(movies)),
    saveMoviesYears: (moviesYears) => dispatch(saveMoviesYears(moviesYears)),
    toggleLoadingMovies: (isLoading) => dispatch(toggleLoadingMovies(isLoading)),
    toggleSnackbar: (open, message, type) => dispatch(toggleSnackbar({ open, message, type })),
    updateMoviesCounter: (updatedCounter) => dispatch(updateMoviesCounter(updatedCounter)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
