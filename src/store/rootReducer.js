import * as actionTypes from './actions';

const initialState = {
    isSnackbarOpen: false,
    snackbarMessage: "",
    snackbarType: "default",
    showWatchedMovies: false
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

        default:
            return { ...state };
    }
}

export default rootReducer;