export const TOGGLE_SNACKBAR = 'TOGGLE_SNACKBAR';
export const TOGGLE_LOADING_MOVIES = 'TOGGLE_LOADING_MOVIES';
export const SAVE_MOVIES = 'SAVE_MOVIES';
export const SAVE_MOVIES_YEARS = 'SAVE_MOVIES_YEARS';
export const UPDATE_FILTERS = 'UPDATE_FILTERS';
export const UPDATE_MOVIES_COUNTER = 'UPDATE_MOVIES_COUNTER';

export const saveMovies = (movies) => ({
    type: SAVE_MOVIES,
    payload: movies,
});

export const saveMoviesYears = (moviesYears) => ({
    type: SAVE_MOVIES_YEARS,
    payload: moviesYears,
});

export const toggleSnackbar = ({ open, message, type }) => ({
    type: TOGGLE_SNACKBAR,
    payload: { open, message, type },
});

export const toggleLoadingMovies = (isLoading) => ({
    type: TOGGLE_LOADING_MOVIES,
    payload: isLoading,
});

export const updateMoviesCounter = (updatedCounter) => ({
    type: UPDATE_MOVIES_COUNTER,
    payload: updatedCounter,
});

export const updateFilters = (filters) => ({ type: UPDATE_FILTERS, payload: filters });
