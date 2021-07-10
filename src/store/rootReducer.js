import * as actionTypes from './actions';

const FILTERS_STORAGE_KEY = 'filters';
const DEFAULT_FILTERS = {
    filter: 'releaseYear',
    order: 'descending',
    year: 'All',
    maxResults: 10,
    showWatchedMovies: false,
};

const initialState = {
    isSnackbarOpen: false,
    snackbarMessage: '',
    snackbarType: 'default',
    movies: [],
    moviesYears: [],
    moviesCounter: {
        total: 0,
        unwatched: 0,
    },
    filters: JSON.parse(localStorage.getItem(FILTERS_STORAGE_KEY)) || DEFAULT_FILTERS,
    loadingMovies: false,
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.TOGGLE_SNACKBAR:
            return {
                ...state,
                isSnackbarOpen: action.payload.open,
                snackbarMessage: action.payload.message,
                snackbarType: action.payload.type,
            };

        case actionTypes.TOGGLE_LOADING_MOVIES:
            return {
                ...state,
                loadingMovies: action.payload,
            };

        case actionTypes.SAVE_MOVIES:
            return {
                ...state,
                movies: action.payload,
                loadingMovies: false,
            };

        case actionTypes.SAVE_MOVIES_YEARS:
            return {
                ...state,
                moviesYears: action.payload,
            };

        case actionTypes.UPDATE_MOVIES_COUNTER:
            if (action.payload) {
                return {
                    ...state,
                    moviesCounter: { ...action.payload },
                };
            } else return state;

        case actionTypes.UPDATE_FILTERS:
            if (action.payload) {
                localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(action.payload));
                return {
                    ...state,
                    filters: { ...action.payload },
                };
            } else return state;

        default:
            return state;
    }
};

export default rootReducer;
