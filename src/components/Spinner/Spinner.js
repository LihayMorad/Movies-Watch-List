import React from 'react'

import './Spinner.css';

const spinner = () => {

    return (
        <div className={"loader"}>
            <div className={"inner one"}></div>
            <div className={"inner two"}></div>
            <div className={"inner three"}></div>
        </div>
    );
}

export default spinner;