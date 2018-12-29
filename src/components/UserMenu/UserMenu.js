import React, { Component } from 'react';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';

import './UserMenu.css';

class UserMenu extends Component {

    state = {
        filter: "releaseYear",
        order: "ascending",
        year: "All"
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {

        var yearsSet = new Set(this.props.years);
        const years = [...yearsSet].map(year => <MenuItem key={year} value={year}>{year}</MenuItem>);

        return (

            <form className={"Menu"}>

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
                    {/* <FormHelperText>Auto width</FormHelperText> */}
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
                    {/* <FormHelperText>Auto width</FormHelperText> */}
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
                    {/* <FormHelperText>Auto width</FormHelperText> */}
                </FormControl>

                <Button style={{ margin: '10px' }} color={"primary"} variant="contained" size="small" 
                onClick={() => this.props.sortMovies(this.state.filter, this.state.order, this.state.year)}>Apply</Button>

            </form>

        );

    }


};

export default UserMenu;