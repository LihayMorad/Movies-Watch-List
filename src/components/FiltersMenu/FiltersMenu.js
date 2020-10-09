import React, { Component } from 'react';

import { connect } from 'react-redux';
import { updateFilters } from '../../store/actions';

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
    ExpandMoreRounded as ExpandMoreRoundedIcon,
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
const StyledIconButton = withStyles({ root: { padding: '0px', color: '#3f51b5' } })(IconButton);
const StyledTooltip = withStyles({
    tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' },
    arrow: { color: 'black' },
})(Tooltip);
const StyledExpandMoreRoundedIcon = withStyles({ root: { color: '#3f51b5' } })(
    ExpandMoreRoundedIcon
);
const expandIcon = (props) => <StyledExpandMoreRoundedIcon className={props.className} />;

class FiltersMenu extends Component {
    state = {
        isOpen: false,
        filters: this.props.filters,
    };

    componentDidUpdate(prevProps) {
        if (this.props.filters !== prevProps.filters) {
            this.setState({ filters: this.props.filters });
        }
    }

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
            <FormGroup row className="filtersForm">
                <FormControl id="sortByFilter" className="MenuElementMg" variant="outlined">
                    <InputLabel htmlFor="sortFilter">Sort by</InputLabel>
                    <Select
                        value={filters.filter}
                        onChange={this.onFilterChange}
                        input={
                            <StyledOutlinedInput labelWidth={52} name="filter" id="sortFilter" />
                        }
                        IconComponent={expandIcon}
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
                        IconComponent={expandIcon}
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
                        IconComponent={expandIcon}
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
                        IconComponent={expandIcon}
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

                <FormControl className="showWatchedMovies MenuElementMg" variant="outlined">
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
        const { isOpen } = this.state;
        const { loadingMovies } = this.props;

        return (
            <>
                <StyledTooltip
                    title="Change movies list filters"
                    disableFocusListener
                    TransitionComponent={Zoom}
                    arrow
                >
                    <Button
                        className={`filtersMenuBtn ${loadingMovies ? 'disabled' : ''}`}
                        color="secondary"
                        variant="contained"
                        onClick={!loadingMovies ? this.open : undefined}
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

const mapStateToProps = ({ filters, moviesYears, loadingMovies }) => ({
    filters,
    moviesYears,
    loadingMovies,
});

const mapDispatchToProps = (dispatch) => ({
    updateFilters: (filters) => dispatch(updateFilters(filters)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FiltersMenu);
