import React from 'react'

import './MoviesSpinner.css';

const moviesSpinner = () => (
    <div className={"moviesLoading"}>
        <div className={"inner one"}></div>
        <div className={"inner two"}></div>
        <div className={"inner three"}></div>
    </div>
);

export default moviesSpinner;