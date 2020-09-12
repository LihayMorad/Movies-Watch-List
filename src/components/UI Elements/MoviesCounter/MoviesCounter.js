import React from 'react';

import { Tooltip, IconButton, Badge, Zoom } from '@material-ui/core';
import { RemoveRedEye, RemoveRedEyeOutlined } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const StyledIconButton = withStyles({ root: { color: 'white' } })(IconButton);
const StyledTooltip = withStyles({
    tooltip: { color: 'white', backgroundColor: 'black', fontSize: '12px' },
    tooltipPlacementBottom: { marginTop: '0px' },
    arrow: { color: 'black' },
})(Tooltip);

const getCounter = (title, value, icon) => {
    return (
        <StyledTooltip
            title={title}
            disableFocusListener
            disableTouchListener
            TransitionComponent={Zoom}
            arrow
        >
            <StyledIconButton>
                <Badge badgeContent={value || '0'} color="secondary">
                    {icon}
                </Badge>
            </StyledIconButton>
        </StyledTooltip>
    );
};

export default ({ unseenCounter = 0, watchedCounter = 0 }) => (
    <div id="moviesCounter">
        {getCounter('Total watched movies', watchedCounter, <RemoveRedEye />)}
        {getCounter('Total unseen movies', unseenCounter, <RemoveRedEyeOutlined />)}
    </div>
);
