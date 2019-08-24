import * as actionTypes from './actions';

const initialState = {
    isSnackbarOpen: false,
    snackbarMessage: "",
    snackbarType: "default",
    showWatchedMovies: false,
    freeSearchFilter: "",
    movies: [],
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

            case actionTypes.ON_FREE_SEARCH_FILTER_CHANGE:
                return {
                    ...state,
                    freeSearchFilter: action.payload
                }

        default:
            return { ...state };
    }
}

export default rootReducer;