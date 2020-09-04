import React, { Component } from 'react';

import { connect } from 'react-redux';
import {
    saveMovies,
    saveMoviesYears,
    toggleLoadingMovies,
    toggleSnackbar,
    updateMoviesCounter,
    updateFilters,
} from '../../store/actions';

import AccountsService from '../../Services/AccountsService';
import AnalyticsService from '../../Services/AnalyticsService';

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputLabel,
    FormGroup,
    FormControl,
    FormControlLabel,
    OutlinedInput,
    Select,
    Checkbox,
    MenuItem,
    Button,
    Tooltip,
    IconButton,
    Zoom,
} from '@material-ui/core';
import {
    MovieFilter as MovieFilterIcon,
    Close as CloseIcon,
    Save as SaveIcon,
    RemoveRedEye,
    RemoveRedEyeOutlined,
} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const StyledDialog = withStyles({ paper: { margin: '24px' } })(Dialog);
const StyledDialogTitle = withStyles({ root: { padding: '16px 24px 12px !important' } })(
    DialogTitle
);
const StyledDialogContent = withStyles({ root: { padding: '0 16px !important' } })(DialogContent);
const StyledOutlinedInput = withStyles({
    input: { padding: '18.5px 35px 18.5px 13px' },
})(OutlinedInput);
const StyledFormControlLabel = withStyles({
    root: { marginRight: '0' },
    label: { fontSize: '0.7rem', fontWeight: '500', textAlign: 'center' },
})(FormControlLabel);
const StyledCheckbox = withStyles({ root: { margin: '9.5px 3px 9.5px 10px', padding: '0' } })(
    Checkbox
);
const StyledIconButton = withStyles({ root: { padding: '0px' } })(IconButton);
const StyledTooltip = withStyles({
    tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' },
})(Tooltip);

class FiltersMenu extends Component {
    state = {
        isOpen: false,
        filters: this.props.filters,
    };

    componentDidMount() {
        AccountsService.InitAccountService().onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                this.getMovies();
                this.setDBListeners();
            } else {
                // User is signed off.
                this.clearDBListeners(['movies', 'yearsAndCounter']);
            }
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.filters !== prevProps.filters) {
            this.setState({ filters: this.props.filters }, this.getMovies);
        }
    }

    componentWillUnmount() {
        this.clearDBListeners(['movies', 'yearsAndCounter']);
    }

    clearDBListeners = (listeners) => {
        if (this.state.DBListeners) {
            listeners.forEach((listener) => {
                this.state.DBListeners[listener] && this.state.DBListeners[listener]();
            });
        }
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
                // { includeMetadataChanges: true },
                (response) => {
                    if (!response.empty && response.docs) {
                        // && !response.metadata.hasPendingWrites
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

    onShowWatchedMoviesFilterChange = () => {
        this.setState((state) => {
            const filters = {
                ...state.filters,
                showWatchedMovies: !state.filters.showWatchedMovies,
            };
            return { filtersChanged: true, filters };
        });
    };

    onFilterChange = ({ target: { name, value } }) => {
        this.setState((state) => {
            const filters = { ...state.filters, [name]: value };
            if (filters.year !== 'All' && filters.filter === 'releaseYear') {
                filters.filter = 'NameEng';
            }
            return { filtersChanged: true, filters };
        });
    };

    updateFilters = () => {
        if (this.state.filtersChanged) {
            this.props.updateFilters(this.state.filters);
            AnalyticsService({
                category: 'User',
                action: 'Filtering movies watch list',
            });
        }
        this.close();
    };

    open = () => {
        this.setState({ isOpen: true });
    };

    close = () => {
        this.setState({ isOpen: false, filters: this.props.filters, filtersChanged: false });
    };

    getOrderLabel = (order) => {
        const isDescending = order === 'descending';
        switch (this.state.filters.filter) {
            case 'releaseYear':
                return isDescending ? 'Newest first' : 'Oldest first';
            case 'NameEng':
                return isDescending ? 'Z - A' : 'A - Z';
            case 'NameHeb':
                return isDescending ? 'ת - א' : 'א - ת';
            case 'imdbRating':
                return isDescending ? 'Highest first' : 'Lowest first';
            default:
                break;
        }
    };

    getMenu = () => {
        const { filters } = this.state;
        const { moviesYears } = this.props;
        return (
            <FormGroup row id="filtersForm">
                <FormControl id="sortByFilter" className="MenuElementMg" variant="outlined">
                    <InputLabel htmlFor="sortFilter">Sort by</InputLabel>
                    <Select
                        value={filters.filter}
                        onChange={this.onFilterChange}
                        input={
                            <StyledOutlinedInput labelWidth={52} name="filter" id="sortFilter" />
                        }
                        autoWidth
                    >
                        {filters.year === 'All' && (
                            <MenuItem value="releaseYear">
                                <em>Year</em>
                            </MenuItem>
                        )}
                        <MenuItem value="NameEng">English Name</MenuItem>
                        <MenuItem value="NameHeb">Hebrew Name</MenuItem>
                        <MenuItem value="imdbRating">IMDB Rating</MenuItem>
                    </Select>
                </FormControl>

                <FormControl id="orderByFilter" className="MenuElementMg" variant="outlined">
                    <InputLabel htmlFor="orderBy">Order</InputLabel>
                    <Select
                        value={filters.order}
                        onChange={this.onFilterChange}
                        input={<StyledOutlinedInput labelWidth={41} name="order" id="orderBy" />}
                        autoWidth
                    >
                        <MenuItem value="descending">
                            <em>{this.getOrderLabel('descending')}</em>
                        </MenuItem>
                        <MenuItem value="ascending">{this.getOrderLabel('ascending')}</MenuItem>
                    </Select>
                </FormControl>

                <FormControl id="menuYear" className="MenuElementMg" variant="outlined">
                    <InputLabel htmlFor="showYear">Year</InputLabel>
                    <Select
                        value={filters.year}
                        onChange={this.onFilterChange}
                        input={<StyledOutlinedInput labelWidth={33} name="year" id="showYear" />}
                        autoWidth
                    >
                        <MenuItem value="All">
                            <em>All</em>
                        </MenuItem>
                        {moviesYears.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl id="menuMaxResults" className="MenuElementMg" variant="outlined">
                    <InputLabel htmlFor="maxResults">Results</InputLabel>
                    <Select
                        value={filters.maxResults}
                        onChange={this.onFilterChange}
                        input={
                            <StyledOutlinedInput
                                labelWidth={54}
                                name="maxResults"
                                id="maxResults"
                            />
                        }
                        autoWidth
                    >
                        <MenuItem value={1000}>All</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>
                            <em>10</em>
                        </MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                    </Select>
                </FormControl>

                <FormControl id="showWatchedMovies" className="MenuElementMg" variant="outlined">
                    <StyledFormControlLabel
                        control={
                            <StyledCheckbox
                                name="showWatchedMovies"
                                checked={filters.showWatchedMovies}
                                onChange={this.onShowWatchedMoviesFilterChange}
                                icon={
                                    <StyledIconButton color="default">
                                        <RemoveRedEyeOutlined fontSize="large" />
                                    </StyledIconButton>
                                }
                                checkedIcon={
                                    <StyledIconButton color="primary">
                                        <RemoveRedEye fontSize="large" />
                                    </StyledIconButton>
                                }
                            />
                        }
                        label={`Show ${filters.showWatchedMovies ? 'watched' : 'unseen'} movies`}
                        labelPlacement="end"
                    />
                </FormControl>
            </FormGroup>
        );
    };

    render() {
        const loggedInUser = AccountsService.GetLoggedInUser();
        if (!loggedInUser) return null;

        const { isOpen } = this.state;
        const { loadingMovies } = this.props;

        return (
            <>
                <StyledTooltip
                    title="Change movies list filters"
                    disableFocusListener
                    TransitionComponent={Zoom}
                >
                    <Button
                        id="filtersMenuBtn"
                        className={loadingMovies ? 'disabled' : ''}
                        color="secondary"
                        variant="contained"
                        onClick={!loadingMovies && this.open}
                    >
                        <MovieFilterIcon />
                        &nbsp;Filters
                    </Button>
                </StyledTooltip>

                <StyledDialog
                    open={isOpen}
                    onClose={this.close}
                    maxWidth="md"
                    TransitionComponent={Zoom}
                >
                    <StyledDialogTitle>
                        List filters
                        <IconButton className="closeModalBtn" onClick={this.close}>
                            <CloseIcon />
                        </IconButton>
                    </StyledDialogTitle>

                    <StyledDialogContent>{this.getMenu()}</StyledDialogContent>

                    <DialogActions>
                        <Button
                            id="applyFiltersBtn"
                            color="primary"
                            variant="contained"
                            size="small"
                            title="Apply filters"
                            onClick={this.updateFilters}
                        >
                            <SaveIcon />
                            &nbsp;Apply
                        </Button>
                    </DialogActions>
                </StyledDialog>
            </>
        );
    }
}

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => ({
    saveMovies: (movies) => dispatch(saveMovies(movies)),
    saveMoviesYears: (moviesYears) => dispatch(saveMoviesYears(moviesYears)),
    toggleLoadingMovies: (isLoading) => dispatch(toggleLoadingMovies(isLoading)),
    toggleSnackbar: (open, message, type) => dispatch(toggleSnackbar({ open, message, type })),
    updateMoviesCounter: (updatedCounter) => dispatch(updateMoviesCounter(updatedCounter)),
    updateFilters: (filters) => dispatch(updateFilters(filters)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FiltersMenu);
