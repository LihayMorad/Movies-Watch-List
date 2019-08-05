import * as actionTypes from './actions';

const initialState = {
    isSnackbarOpen: false,
    snackbarMessage: ""
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.TOGGLE_SNACKBAR:
            return {
                ...state,
                isSnackbarOpen: action.payload.open,
                snackbarMessage: action.payload.message
            };
        case actionTypes.ANOTHER:
            return { ...state };
        default:
            return { ...state };
    }
}

export default rootReducer;