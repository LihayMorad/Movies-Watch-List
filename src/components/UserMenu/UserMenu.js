import React, { Component } from 'react';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';

class UserMenu extends Component {

    state = {
        filter: "releaseYear",
        order: "ascending"
    }

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    render() {

        return (

            <form style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}} autoComplete="off">

                <FormControl>
                    <InputLabel htmlFor={"age-auto-width"}>Sort By</InputLabel>
                    <Select
                        value={this.state.filter}
                        onChange={this.handleChange}
                        input={<Input name="filter" id="age-auto-width" />}
                        autoWidth
                    >
                        <MenuItem value={"releaseYear"}><em>Year</em></MenuItem>
                        <MenuItem value={"nameEng"}>English Name</MenuItem>
                        <MenuItem value={"nameHeb"}>Hebrew Name</MenuItem>
                    </Select>
                    {/* <FormHelperText>Auto width</FormHelperText> */}
                </FormControl>

                <FormControl>
                    <InputLabel htmlFor="age-auto-width">Order type</InputLabel>
                    <Select
                        value={this.state.order}
                        onChange={this.handleChange}
                        input={<Input name="order" id="age-auto-width" />}
                        autoWidth
                    >
                        <MenuItem value={"ascending"}><em>Ascending</em></MenuItem>
                        <MenuItem value={"descending"}>Descending</MenuItem>
                    </Select>
                    {/* <FormHelperText>Auto width</FormHelperText> */}
                </FormControl>

                <Button onClick={()=>this.props.sortMovies(this.state.filter, this.state.order)}>Sort</Button>

            </form>

        );

    }


};

export default UserMenu;