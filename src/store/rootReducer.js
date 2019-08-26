import * as actionTypes from './actions';

const initialState = {
    isSnackbarOpen: false,
    snackbarMessage: "",
    snackbarType: "default",
    showWatchedMovies: false,
    freeSearchFilter: "",
    movies: [],
    moviesYears: [],
    moviesCounter: {
        total: 0,
        unwatched: 0
    },
    loadingMovies: false
};

const rootReducer = (state = initialState, action) => {

    switch (action.type) {

        case actionTypes.TOGGLE_SNACKBAR:
            return {
                ...state,
                isSnackbarOpen: action.payload.open,
                snackbarMessage: action.payload.message,
                snackbarType: action.payload.type
            };

        case actionTypes.TOGGLE_WATCHED_MOVIES:
            return {
                ...state,
                showWatchedMovies: !state.showWatchedMovies
            };

        case actionTypes.TOGGLE_LOADING_MOVIES:
            return {
                ...state,
                loadingMovies: action.payload
            };

        case actionTypes.SAVE_MOVIES:
            return {
                ...state,
                movies: action.payload,
                loadingMovies: false
            };

        case actionTypes.SAVE_MOVIES_YEARS:
            return {
                ...state,
                moviesYears: action.payload
            }

        case actionTypes.ON_FREE_SEARCH_FILTER_CHANGE:
            return {
                ...state,
                freeSearchFilter: action.payload
            }

        case actionTypes.ON_MOVIES_COUNTER_CHANGE: // DB.on('value')
            if (action.payload) {
                return {
                    ...state,
                    moviesCounter: { ...action.payload }
                };
            } else return state;

        default: return state;
    }
}

export default rootReducer;