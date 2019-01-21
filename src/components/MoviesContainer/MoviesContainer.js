import React, { PureComponent } from 'react';
import { database } from '../../config/firebase';

import Movie from '../Movie/Movie';
import UserMenu from '../UserMenu/UserMenu';
import MoviesSpinner from '../Spinners/MoviesSpinner/MoviesSpinner';

import './MoviesContainer.css';

class MoviesContainer extends PureComponent {

    state = {
        moviesData: [],
        maxResults: 10,
        addingMovie: false,
        years: [],
        loading: true
    }

    componentDidMount() {
        this.myRef = React.createRef();
        this.getMoviesToWatch();
    }

    componentDidUpdate() {
        // this.state.moviesData.forEach(elem => { console.log(elem.key) });
        // console.log('[componentDidUpdate] this.state.moviesData: ', this.state.moviesData);
    }

    handleDelete = movieID => {
        let deletedMovieDetails = "";
        let updatedMoviesData = this.state.moviesData.slice(); // same as ES6: [...this.state.moviesData]

        updatedMoviesData = updatedMoviesData.filter(movie => {
            if (movieID === movie.key) {
                deletedMovieDetails = `${movie.props.nameEng} (${movie.props.releaseYear})`;
                return false;
            }
            return true;
        });

        this.setState({ moviesData: updatedMoviesData }, () => {
            console.log('[handleDelete] DB REMOVE');
            database.ref('/mymovies/' + movieID).remove()
                .then((res) => { console.log(res); alert(`'${deletedMovieDetails}' deleted successfully`); })
                .catch((error) => { console.error(error); })
        });
    }

    handleMovieAdd = details => {
        console.log('[handleDelete] DB ADD');
        const Year = parseInt(details.Year);
        const movieToBeAdded = { ...details, Year };
        database.ref('/mymovies').push(movieToBeAdded, () => { alert(`'${movieToBeAdded.NameEng} (${movieToBeAdded.Year})' added successfully`); this.toggleMovieAdd(); });
    }

    toggleMovieAdd = () => { this.setState({ addingMovie: !this.state.addingMovie }); }

    getMoviesToWatch = (filter = "releaseYear", order = "descending", year = "All", maxResults = this.state.maxResults) => {

        const filterToShow = filter === "releaseYear" ? "Year" : filter.charAt(0).toUpperCase() + filter.slice(1); // for matching DB's keys: nameEng > NameEng

        this.setState({ maxResults: maxResults, loading: true }, () => {
            year === "All"
                ?
                database.ref('/mymovies').orderByChild(filterToShow).limitToLast(this.state.maxResults)
                    .on('value', response => { this.handleFirebaseData(response, filterToShow, order, year); }, error => { console.log(error); })
                :
                database.ref('/mymovies').orderByChild("Year").limitToLast(this.state.maxResults).equalTo(parseInt(year))
                    .on('value', response => { this.handleFirebaseData(response, filterToShow, order, year); }, error => { console.log(error); });

        });
    }

    handleFirebaseData = (response, filter, order, year) => {
        let sortedMovies = [];

        if (year !== "All") {
            sortedMovies = this.sortMoviesofTheSameYear(response.val(), filter, order, year); // sort movies of the same year by filter
        }

        else {
            order === "descending" ?
                response.forEach(elem => { sortedMovies.unshift({ key: elem.key, ...elem.val() }); })
                :
                response.forEach(elem => { sortedMovies.push({ key: elem.key, ...elem.val() }); });
        }

        console.table(sortedMovies);
        this.setMoviesToWatch(sortedMovies);
    }

    setMoviesToWatch = moviesData => {

        let years = [];
        const movies = moviesData.map((movie => { // .slice(0, this.state.maxResults)
            years.push(movie['Year']);
            return <Movie
                key={movie['key']}
                dbID={movie['key']}
                nameHeb={movie['NameHeb']}
                nameEng={movie['NameEng']}
                releaseYear={movie['Year']}
                trailerURL={movie['TrailerURL']}
                comments={movie['Comments']}
                delete={this.handleDelete}
            />
        }));

        years = new Set([...this.state.years, ...years]);
        this.setState({ moviesData: movies, years: years, loading: false });
    }

    sortMoviesofTheSameYear = (responseData, filter, order, year) => {

        let sortedMovies = [];

        for (const elem in responseData)
            sortedMovies.push({ key: elem, ...responseData[elem] });

        sortedMovies = sortedMovies.sort((a, b) => { // filter(movie => !movie.Error).

            const movie1 = a[filter], movie2 = b[filter];

            return order === "descending"
                ?
                movie2 > movie1 ? 1 : movie2 === movie1 ? 0 : -1
                :
                movie1 < movie2 ? -1 : movie2 === movie1 ? 0 : 1;
        });

        return sortedMovies;
    }

    render() {

        return (
            <div>
                <div className={"UserMenu"} ref={this.myRef}>
                    <UserMenu
                        isOpen={this.state.addingMovie}
                        toggle={this.toggleMovieAdd}
                        addMovie={details => { this.handleMovieAdd(details) }}
                        getMovies={this.getMoviesToWatch}
                        years={this.state.years}
                        maxResults={this.state.maxResults}
                    />
                </div>

                {!this.state.loading ?
                    <div className={"MoviesGallery"}>{this.state.moviesData}</div>
                    :
                    <MoviesSpinner />
                }
                <button onClick={() => { window.scrollTo({ top: this.myRef.current.offsetTop, behavior: "smooth" }); }}>Scroll to the TOP MENU</button>
            </div>
        );

    }

}

export default MoviesContainer;