import React from 'react'

import './Spinner.css';

const spinner = () => {

    return (
        <div class="loader">
            <div class="inner one"></div>
            <div class="inner two"></div>
            <div class="inner three"></div>
        </div>
    );
}

export default spinner;