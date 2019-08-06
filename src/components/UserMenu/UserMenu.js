import React, { Component } from 'react';

import { connect } from 'react-redux';
import * as actionTypes from '../../store/actions';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import FilterList from '@material-ui/icons/FilterList';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import MovieAddModal from '../Movie/MovieAddModal/MovieAddModal';

import './UserMenu.css';

class UserMenu extends Component {

    state = {
        filter: "releaseYear",
        order: "descending",
        year: "All",
        maxResults: this.props.maxResults || ""
    }

    handleChange = e => { this.setState({ [e.target.name]: e.target.value }); };

    toggleWatchedMovies = () => { this.props.onToggleWatchedMovies(); }

    search = () => { this.props.getMovies(this.state.filter, this.state.order, this.state.year, this.state.maxResults); }

    render() {

        const years = [...this.props.years].map(year => <MenuItem key={year} value={year}>{year}</MenuItem>);

        return (

            <form>
                <div className={"Menu"}>
                    <FormControl id="sortByFilter" className={"MenuElement"} >
                        <InputLabel htmlFor="sortFilter">Sort by</InputLabel>
                        <Select
                            value={this.state.filter}
                            onChange={this.handleChange}
                            input={<Input name="filter" id="sortFilter" />}
                            autoWidth >
                            <MenuItem value={"releaseYear"}><em>Year</em></MenuItem>
                            <MenuItem value={"nameEng"}>English Name</MenuItem>
                            <MenuItem value={"nameHeb"}>Hebrew Name</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl id="orderByFilter" className={"MenuElement"} >
                        <InputLabel htmlFor="orderBy">Order by</InputLabel>
                        <Select
                            value={this.state.order}
                            onChange={this.handleChange}
                            input={<Input name="order" id="orderBy" />}
                            autoWidth >
                            <MenuItem value={"descending"}><em>Descending</em></MenuItem>
                            <MenuItem value={"ascending"}>Ascending</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl id="menuYear" className={"MenuElement"} >
                        <InputLabel htmlFor="showYear">Year</InputLabel>
                        <Select
                            value={this.state.year}
                            onChange={this.handleChange}
                            input={<Input name="year" id="showYear" />}
                            autoWidth >
                            <MenuItem value={"All"}><em>{"All"}</em></MenuItem>
                            {years}

                        </Select>
                    </FormControl>

                    <FormControl id="menuMaxResults" className={"MenuElement"} >
                        <InputLabel htmlFor="maxResults">Results</InputLabel>
                        <Select
                            value={this.state.maxResults}
                            onChange={this.handleChange}
                            name="maxResults"
                            inputProps={{ id: 'maxResults' }} >
                            <MenuItem value={1000}>All</MenuItem>
                            <MenuItem value={5}><em>5</em></MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={10}>15</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl id="showWatchedMovies" className="MenuElement">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="showWatchedMovies"
                                    color="primary"
                                    checked={this.props.showWatchedMovies}
                                    onChange={this.toggleWatchedMovies} />
                            }
                            label="Show watched movies"
                            labelPlacement="end"
                        />
                    </FormControl>


                    <Button className={"MenuElement"} variant="contained" size="small" title="Apply filters" onClick={this.search}>
                        <FilterList />&nbsp;Apply
                    </Button>

                </div>
                <Fab id="menuAddMovie" color="primary" variant="extended" size="large" title="Add Movie" onClick={this.props.toggle} >
                    <AddIcon />Add Movie
                </Fab>

                <MovieAddModal isOpen={this.props.isOpen} toggle={this.props.toggle} addMovie={this.props.addMovie} />
            </form>

        );

    }

};

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch => ({
    onToggleWatchedMovies: () => dispatch({ type: actionTypes.TOGGLE_WATCHED_MOVIES })
})

export default connect(mapStateToProps, mapDispatchToProps)(UserMenu);