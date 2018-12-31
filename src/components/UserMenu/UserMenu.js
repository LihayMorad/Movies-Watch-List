import React, { Component } from 'react';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import MovieAddModal from '../Movie/MovieAddModal/MovieAddModal';

import './UserMenu.css';

class UserMenu extends Component {

    state = {
        filter: "releaseYear",
        order: "descending",
        year: "All",
        maxResults: ""
    }

    componentWillMount() {
        this.setState({ maxResults: this.props.maxResults });
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {

        var yearsSet = new Set(this.props.years); // for deletion of duplicates
        const years = [...yearsSet].map(year => <MenuItem key={year} value={year}>{year}</MenuItem>);

        return (

            <form className={"Menu"}>

                <Fab color="primary" size="medium" onClick={this.props.toggle} >
                    <AddIcon />
                </Fab>

                <FormControl style={{ margin: '10px' }} className={"MenuElement"} >
                    <InputLabel htmlFor="sortFilter">Sort by</InputLabel>
                    <Select
                        value={this.state.filter}
                        onChange={this.handleChange}
                        input={<Input name="filter" id="sortFilter" />}
                        autoWidth
                    >
                        <MenuItem value={"releaseYear"}><em>Year</em></MenuItem>
                        <MenuItem value={"nameEng"}>English Name</MenuItem>
                        <MenuItem value={"nameHeb"}>Hebrew Name</MenuItem>
                    </Select>
                </FormControl>

                <FormControl style={{ margin: '10px' }} className={"MenuElement"} >
                    <InputLabel htmlFor="orderBy">Order by</InputLabel>
                    <Select
                        value={this.state.order}
                        onChange={this.handleChange}
                        input={<Input name="order" id="orderBy" />}
                        autoWidth
                    >
                        <MenuItem value={"ascending"}><em>Ascending</em></MenuItem>
                        <MenuItem value={"descending"}>Descending</MenuItem>
                    </Select>
                </FormControl>

                <FormControl style={{ margin: '10px' }} className={"MenuElement"} >
                    <InputLabel htmlFor="showYear">Year</InputLabel>
                    <Select
                        value={this.state.year}
                        onChange={this.handleChange}
                        input={<Input name="year" id="showYear" />}
                        autoWidth
                    >
                        <MenuItem value={"All"}><em>{"All"}</em></MenuItem>
                        {years}

                    </Select>
                </FormControl>

                <FormControl style={{ margin: '10px' }} className={"MenuElement"} >
                    <InputLabel htmlFor="maxResults">Max Results</InputLabel>

                    <Select
                        value={this.state.maxResults}
                        onChange={this.handleChange}
                        name="maxResults"
                        inputProps={{ id: 'maxResults' }}
                    >
                        <MenuItem value={1000}>All</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}><em>10</em></MenuItem>
                        <MenuItem value={15}>15</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={30}>30</MenuItem>
                        <MenuItem value={40}>40</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                    </Select>
                </FormControl>

                <Button style={{ margin: '10px' }} color={"primary"} variant="contained" size="small"
                    onClick={() => this.props.getMovies(this.state.filter, this.state.order, this.state.year, this.state.maxResults)}>Apply</Button>

                <MovieAddModal isOpen={this.props.isOpen} toggle={this.props.toggle} addMovie={this.props.addMovie} />

            </form>

        );

    }


};

export default UserMenu;